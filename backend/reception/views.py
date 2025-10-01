from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Count
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from patients.models import Patient, PatientStatusHistory, PatientNote
from patients.serializers import PatientSearchSerializer
from .serializers import PatientRegistrationSerializer, PatientUpdateSerializer
from finance.utils import get_service_price


@swagger_auto_schema(
    method='post',
    operation_summary="Register new patient",
    operation_description="Register a new patient at reception. Includes file fee tracking and auto-generates patient ID.",
    request_body=PatientRegistrationSerializer,
    responses={
        201: openapi.Response(
            description="Patient registered successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_uuid': openapi.Schema(type=openapi.TYPE_STRING),
                    'file_fee_required': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'file_fee_amount': openapi.Schema(type=openapi.TYPE_NUMBER),
                }
            )
        ),
        400: openapi.Response(description="Invalid patient data or duplicate phone number"),
        401: openapi.Response(description="Authentication required")
    },
    tags=['Reception Portal']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_patient(request):
    """
    Register a new patient at reception.
    
    This endpoint handles the complete patient registration process including:
    - Auto-generating patient ID (PAT0001, PAT0002, etc.)
    - File fee tracking (2000 TZS for new patients)
    - Initial status setting
    - Audit trail creation
    """
    # Validate input data
    serializer = PatientRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create patient
        patient_data = serializer.validated_data
        file_fee_paid = patient_data.pop('file_fee_paid', False)
        
        # Create the patient
        patient = Patient.objects.create_patient(
            created_by=request.user,
            **patient_data
        )
        
        # Handle file fee payment logic
        if patient.patient_type == 'NHIF':
            # NHIF patients don't pay file fees - automatically handled in model save()
            note_text = f"NHIF patient registered with card number: {patient.nhif_card_number}"
        elif file_fee_paid:
            patient.file_fee_paid = True
            patient.file_fee_payment_date = timezone.now()
            patient.file_fee_amount = 2000.00  # Fixed amount
            patient.save()

            # Create revenue record for finance tracking
            from finance.models import RevenueRecord, ServicePayment
            RevenueRecord.objects.create(
                patient=patient,
                revenue_type='FILE_FEE',
                description=f'File fee payment for patient {patient.patient_id}',
                amount=2000.00,
                payment_method='CASH',  # Default, can be updated later
                collected_by=request.user,
                revenue_date=timezone.now().date()
            )

            # Also create ServicePayment record for payment queue visibility
            ServicePayment.objects.create(
                patient_id=patient.patient_id,
                patient_name=patient.full_name,
                service_type='FILE_FEE',
                service_name='Patient File Fee (New Registration)',
                amount=2000.00,
                payment_method='CASH',
                status='PAID',
                payment_date=timezone.now(),
                processed_by=request.user,
                notes=f'File fee paid during registration by {request.user.full_name}'
            )

            note_text = f"Normal patient registered with file fee paid by {request.user.full_name}"
        else:
            return Response({
                'error': 'File fee payment is required for normal patient registration'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # NEW PATIENTS: Automatically add to doctor queue (WAITING_DOCTOR)
        patient.current_status = 'WAITING_DOCTOR'
        patient.current_location = f"Doctor Queue - Auto-registered by {request.user.full_name}"
        patient.save()

        # Create initial status history
        PatientStatusHistory.objects.create(
            patient=patient,
            previous_status=None,
            new_status='WAITING_DOCTOR',
            previous_location=None,
            new_location=patient.current_location,
            changed_by=request.user,
            notes=f"New patient auto-queued for doctor. {note_text}"
        )
        
        return Response({
            'message': 'Patient registered successfully',
            'patient_id': patient.patient_id,
            'full_name': patient.full_name,
            'file_fee_paid': patient.file_fee_paid,
            'file_fee_amount': patient.file_fee_amount,
            'created_at': patient.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to register patient: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='patch',
    operation_summary="Update patient details",
    operation_description="Update patient information including name, phone, personal and medical details. Supports partial updates.",
    request_body=PatientUpdateSerializer,
    responses={
        200: openapi.Response(
            description="Patient details updated successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'updated_fields': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_STRING)
                    ),
                }
            )
        ),
        400: openapi.Response(description="Invalid data or duplicate phone number"),
        404: openapi.Response(description="Patient not found"),
        401: openapi.Response(description="Authentication required")
    },
    tags=['Reception Portal']
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_patient_details(request, patient_id):
    """
    Update patient information including name, phone, and all personal details.
    
    This endpoint allows reception staff to update any patient information
    including name, phone number, contact details, and medical information.
    Supports partial updates - only send fields you want to change.
    """
    try:
        # Find patient
        if len(patient_id) == 36:  # UUID format
            patient = Patient.objects.get(id=patient_id)
        else:
            patient = Patient.objects.get(patient_id=patient_id.upper())
        
        # Store original data for comparison
        original_data = {
            field: getattr(patient, field) for field in PatientUpdateSerializer.Meta.fields
        }
        
        # Validate and update
        serializer = PatientUpdateSerializer(patient, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save updates
        updated_patient = serializer.save()
        updated_patient.last_updated_by = request.user
        updated_patient.save()
        
        # Track what was changed
        updated_fields = []
        for field in PatientUpdateSerializer.Meta.fields:
            if getattr(updated_patient, field) != original_data[field]:
                updated_fields.append(field)
        
        # Create note for significant changes
        if updated_fields:
            note_text = f"Updated fields: {', '.join(updated_fields)}"
            PatientNote.objects.create(
                patient=updated_patient,
                note=note_text,
                note_type='CONTACT',
                created_by=request.user
            )
        
        return Response({
            'message': 'Patient details updated successfully',
            'patient_id': updated_patient.patient_id,
            'updated_fields': updated_fields,
            'updated_by': request.user.full_name,
            'updated_at': updated_patient.updated_at.isoformat()
        })
    
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to update patient: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='post',
    operation_summary="Check in existing patient",
    operation_description="Check in an existing patient for today's visit. Handles both normal and NHIF patients.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'visit_reason': openapi.Schema(type=openapi.TYPE_STRING, description="Reason for today's visit"),
            'requires_new_file': openapi.Schema(type=openapi.TYPE_BOOLEAN, description="Whether patient needs a new file (additional fee)", default=False)
        }
    ),
    responses={
        200: openapi.Response(
            description="Patient checked in successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_name': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_type': openapi.Schema(type=openapi.TYPE_STRING),
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'location': openapi.Schema(type=openapi.TYPE_STRING),
                    'checked_in_at': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        400: openapi.Response(description="Patient already checked in or invalid request"),
        404: openapi.Response(description="Patient not found")
    },
    tags=['Reception Portal']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_in_patient(request, patient_id):
    """
    Check in an existing patient for today's visit.

    Handles both normal and NHIF patients. Updates patient status to WAITING_DOCTOR
    and adds them to the doctor's queue following FIFO logic.
    """
    try:
        # Find patient by UUID or patient_id
        if len(patient_id) == 36:  # UUID format
            patient = Patient.objects.get(id=patient_id)
        else:
            patient = Patient.objects.get(patient_id=patient_id.upper())

        # Check if patient is already in an active status today
        today = timezone.now().date()
        active_statuses = ['WAITING_DOCTOR', 'WITH_DOCTOR', 'WAITING_LAB', 'IN_LAB', 'LAB_RESULTS_READY', 'WAITING_PHARMACY', 'IN_PHARMACY']

        if (patient.updated_at.date() == today and
            patient.current_status in active_statuses):
            return Response({
                'error': f'Patient is already checked in today with status: {patient.current_status}',
                'current_status': patient.current_status,
                'current_location': patient.current_location
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get visit details
        visit_reason = request.data.get('visit_reason', 'Regular checkup')
        requires_new_file = request.data.get('requires_new_file', False)

        # Handle new file fee if required (for normal patients only)
        if requires_new_file and patient.patient_type == 'NORMAL':
            # Additional file fee required
            from finance.models import RevenueRecord
            RevenueRecord.objects.create(
                patient=patient,
                revenue_type='ADDITIONAL_FILE',
                description=f'Additional file fee for {patient.patient_id} - {visit_reason}',
                amount=2000.00,
                payment_method='CASH',
                collected_by=request.user,
                revenue_date=today
            )

        # Update patient status - send to doctor queue (FIFO)
        previous_status = patient.current_status
        previous_location = patient.current_location

        patient.current_status = 'WAITING_DOCTOR'
        patient.current_location = f"Doctor Queue - Checked in by {request.user.full_name}"
        patient.updated_at = timezone.now()
        patient.last_updated_by = request.user
        patient.save()

        # Create status history
        PatientStatusHistory.objects.create(
            patient=patient,
            previous_status=previous_status,
            new_status='WAITING_DOCTOR',
            previous_location=previous_location,
            new_location=patient.current_location,
            changed_by=request.user,
            notes=f"Patient checked in for: {visit_reason}. Patient type: {patient.patient_type}"
        )

        # Create check-in note
        from patients.models import PatientNote
        note_text = f"Checked in for: {visit_reason}"
        if patient.patient_type == 'NHIF':
            note_text += f" (NHIF Card: {patient.nhif_card_number})"
        if requires_new_file:
            note_text += " - Additional file created"

        PatientNote.objects.create(
            patient=patient,
            note=note_text,
            note_type='GENERAL',
            created_by=request.user
        )

        return Response({
            'message': 'Patient checked in successfully',
            'patient_id': patient.patient_id,
            'patient_name': patient.full_name,
            'patient_type': patient.patient_type,
            'status': patient.current_status,
            'location': patient.current_location,
            'visit_reason': visit_reason,
            'checked_in_by': request.user.full_name,
            'checked_in_at': patient.updated_at.isoformat()
        })

    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to check in patient: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    operation_summary="Process file fee payment",
    operation_description="Record file fee payment for a patient (2000 TZS)",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'amount': openapi.Schema(type=openapi.TYPE_NUMBER, description="Payment amount (should be 2000)"),
            'payment_method': openapi.Schema(type=openapi.TYPE_STRING, description="Cash, Card, Mobile Money"),
            'notes': openapi.Schema(type=openapi.TYPE_STRING, description="Optional payment notes")
        },
        required=['amount']
    ),
    responses={
        200: openapi.Response(
            description="File fee payment processed",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'amount_paid': openapi.Schema(type=openapi.TYPE_NUMBER),
                    'payment_date': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        400: openapi.Response(description="Invalid payment amount or patient already paid"),
        404: openapi.Response(description="Patient not found")
    },
    tags=['Reception Portal']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_file_fee_payment(request, patient_id):
    """
    Process file fee payment for a patient.
    
    Records payment of the 2000 TZS file creation fee for new patients.
    """
    try:
        # Find patient
        if len(patient_id) == 36:  # UUID format
            patient = Patient.objects.get(id=patient_id)
        else:
            patient = Patient.objects.get(patient_id=patient_id.upper())
        
        # Check if already paid
        if patient.file_fee_paid:
            return Response(
                {'error': 'File fee already paid for this patient'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get current file fee from centralized pricing
        current_file_fee = get_service_price('RECEPTION_FILE') or patient.file_fee_amount
        
        # Validate payment amount
        amount = request.data.get('amount')
        if not amount or float(amount) != float(current_file_fee):
            return Response(
                {'error': f'Invalid payment amount. Expected: {current_file_fee} TZS'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process payment
        patient.file_fee_paid = True
        patient.file_fee_payment_date = timezone.now()
        patient.last_updated_by = request.user
        patient.save()
        
        # Create payment note
        payment_method = request.data.get('payment_method', 'Cash')
        notes = request.data.get('notes', '')
        note_text = f"File fee payment: {amount} TZS via {payment_method}"
        if notes:
            note_text += f". Notes: {notes}"
        
        PatientNote.objects.create(
            patient=patient,
            note=note_text,
            note_type='PAYMENT',
            created_by=request.user
        )
        
        return Response({
            'message': 'File fee payment processed successfully',
            'patient_id': patient.patient_id,
            'patient_name': patient.full_name,
            'amount_paid': float(amount),
            'payment_method': payment_method,
            'payment_date': patient.file_fee_payment_date.isoformat(),
            'processed_by': request.user.full_name
        })
    
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to process payment: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='get',
    operation_summary="Get reception dashboard data",
    operation_description="Get summary data for reception dashboard including today's registrations and pending payments",
    responses={
        200: openapi.Response(
            description="Dashboard data",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'today_registrations': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'pending_file_fees': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'total_patients': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'recent_registrations': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT))
                }
            )
        )
    },
    tags=['Reception Portal']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reception_dashboard(request):
    """
    Get reception dashboard summary data.
    
    Provides key metrics for reception staff including registrations and payments.
    """
    try:
        today = timezone.now().date()
        
        # Today's registrations
        today_registrations = Patient.objects.filter(created_at__date=today).count()
        
        # Pending file fee payments
        pending_file_fees = Patient.objects.filter(file_fee_paid=False).count()
        
        # Total patients
        total_patients = Patient.objects.count()
        
        # Recent registrations (last 10)
        recent_patients = Patient.objects.select_related('created_by').order_by('-created_at')[:10]
        recent_data = PatientSearchSerializer(recent_patients, many=True).data
        
        # Today's active queue - patients currently in the hospital system
        today_active_statuses = ['REGISTERED', 'WAITING_DOCTOR', 'WITH_DOCTOR', 'WAITING_LAB', 'IN_LAB', 'LAB_RESULTS_READY', 'WAITING_PHARMACY', 'IN_PHARMACY', 'PAYMENT_PENDING']
        todays_active_queue = Patient.objects.filter(
            Q(created_at__date=today) | Q(updated_at__date=today),
            current_status__in=today_active_statuses
        ).select_related('created_by').order_by('-updated_at')
        
        active_queue_data = PatientSearchSerializer(todays_active_queue, many=True).data
        
        # Patients currently registered (waiting for next service)
        patients_registered = Patient.objects.filter(current_status='REGISTERED').count()
        
        # Get current file fee from centralized pricing
        file_fee_amount = get_service_price('RECEPTION_FILE') or 2000.0
        
        return Response({
            'today_registrations': today_registrations,
            'pending_file_fees': pending_file_fees,
            'total_patients': total_patients,
            'patients_waiting': patients_registered,
            'recent_registrations': recent_data,
            'todays_active_queue': active_queue_data,
            'file_fee_amount': float(file_fee_amount),
            'dashboard_generated_at': timezone.now().isoformat(),
            'generated_by': request.user.full_name
        })
    
    except Exception as e:
        return Response(
            {'error': f'Failed to generate dashboard data: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='patch',
    operation_summary="Update patient details",
    operation_description="Update patient contact and personal information. Does not change medical status.",
    request_body=PatientUpdateSerializer,
    responses={
        200: openapi.Response(
            description="Patient details updated successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'updated_fields': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_STRING)
                    ),
                }
            )
        ),
        400: openapi.Response(description="Invalid data or duplicate phone number"),
        404: openapi.Response(description="Patient not found"),
        401: openapi.Response(description="Authentication required")
    },
    tags=['Reception Portal']
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_patient_details(request, patient_id):
    """
    Update patient contact and personal details.
    
    This endpoint allows reception staff to update patient information
    such as contact details, address, and basic medical information.
    Does not change patient status or location.
    """
    try:
        # Find patient
        if len(patient_id) == 36:  # UUID format
            patient = Patient.objects.get(id=patient_id)
        else:
            patient = Patient.objects.get(patient_id=patient_id.upper())
        
        # Store original data for comparison
        original_data = {
            field: getattr(patient, field) for field in PatientUpdateSerializer.Meta.fields
        }
        
        # Validate and update
        serializer = PatientUpdateSerializer(patient, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save updates
        updated_patient = serializer.save()
        updated_patient.last_updated_by = request.user
        updated_patient.save()
        
        # Track what was changed
        updated_fields = []
        for field in PatientUpdateSerializer.Meta.fields:
            if getattr(updated_patient, field) != original_data[field]:
                updated_fields.append(field)
        
        return Response({
            'message': 'Patient details updated successfully',
            'patient_id': updated_patient.patient_id,
            'updated_fields': updated_fields,
            'updated_by': request.user.full_name,
            'updated_at': updated_patient.updated_at.isoformat()
        })
    
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to update patient: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
