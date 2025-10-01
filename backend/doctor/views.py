from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Import from patients app for shared access
from patients.models import Patient, PatientStatusHistory
from patients.serializers import PatientSearchSerializer

from .models import Consultation, LabTestRequest, Prescription
from .serializers import (
    ConsultationSerializer, ConsultationListSerializer,
    LabTestRequestSerializer, LabTestRequestCreateSerializer,
    PrescriptionSerializer, PrescriptionCreateSerializer,
    DoctorDashboardSerializer
)


@swagger_auto_schema(
    method='get',
    operation_summary="Get patients waiting for doctor",
    operation_description="Get all patients currently waiting for doctor consultation. Live updates when patients move through the system.",
    manual_parameters=[
        openapi.Parameter(
            'priority', openapi.IN_QUERY,
            description="Filter by priority (NORMAL, URGENT, EMERGENCY)",
            type=openapi.TYPE_STRING,
            required=False
        )
    ],
    responses={
        200: openapi.Response(
            description="Patients waiting for doctor",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'waiting_patients': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_OBJECT)
                    ),
                    'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                }
            )
        )
    },
    tags=['Doctor Portal']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_waiting_patients(request):
    """
    Get all patients waiting for doctor consultation.
    
    This endpoint shows patients with status 'WAITING_DOCTOR' to ALL doctors.
    No assignment - any available doctor can see and treat any waiting patient.
    Updates live as patient statuses change across the system.
    """
    try:
        # Get all patients waiting for doctor (shared access)
        waiting_patients_query = Patient.objects.filter(
            current_status='WAITING_DOCTOR'
        ).order_by('created_at')  # First come, first served
        
        # Filter by priority if specified
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            # Get consultations for these patients to check priority
            patient_ids = [p.patient_id for p in waiting_patients_query]
            urgent_consultations = Consultation.objects.filter(
                patient_id__in=patient_ids,
                priority=priority_filter.upper(),
                status='IN_PROGRESS'
            ).values_list('patient_id', flat=True)
            
            waiting_patients_query = waiting_patients_query.filter(
                patient_id__in=urgent_consultations
            )
        
        # Serialize patient data
        waiting_patients = PatientSearchSerializer(waiting_patients_query, many=True).data
        
        # Add consultation info if exists
        for patient_data in waiting_patients:
            patient_id = patient_data['id']
            latest_consultation = Consultation.objects.filter(
                patient_id=patient_data['patient_id'],
                status='IN_PROGRESS'
            ).first()
            
            if latest_consultation:
                patient_data['consultation_info'] = {
                    'chief_complaint': latest_consultation.chief_complaint,
                    'priority': latest_consultation.priority,
                    'doctor_assigned': latest_consultation.doctor.full_name if latest_consultation.doctor else None
                }
        
        return Response({
            'waiting_patients': waiting_patients,
            'count': len(waiting_patients),
            'last_updated': timezone.now().isoformat(),
            'note': 'All doctors can see and treat any waiting patient'
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get waiting patients: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='post',
    operation_summary="Start consultation",
    operation_description="Start a new consultation for a patient. Updates patient status to WITH_DOCTOR.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'patient_id': openapi.Schema(type=openapi.TYPE_STRING, description="Patient ID (PAT123)"),
            'chief_complaint': openapi.Schema(type=openapi.TYPE_STRING, description="Main reason for visit"),
            'priority': openapi.Schema(type=openapi.TYPE_STRING, description="NORMAL, URGENT, or EMERGENCY"),
        },
        required=['patient_id', 'chief_complaint']
    ),
    responses={
        201: openapi.Response(description="Consultation started successfully"),
        400: openapi.Response(description="Invalid data or patient not available"),
        404: openapi.Response(description="Patient not found")
    },
    tags=['Doctor Portal']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_consultation(request):
    """
    Start a new consultation for a patient.
    
    Updates patient status to WITH_DOCTOR and creates consultation record.
    Any doctor can start consultation with any waiting patient.
    """
    try:
        patient_id = request.data.get('patient_id')
        if not patient_id:
            return Response(
                {'error': 'Patient ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get patient from patients app
        try:
            patient = Patient.objects.get(patient_id=patient_id.upper())
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if patient is available for consultation
        if patient.current_status not in ['WAITING_DOCTOR', 'REGISTERED']:
            return Response(
                {'error': f'Patient is currently {patient.current_status}. Cannot start consultation.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if there's already an IN_PROGRESS consultation for this patient
        existing_consultation = Consultation.objects.filter(
            patient_id=patient_id.upper(),
            status='IN_PROGRESS'
        ).first()
        
        if existing_consultation:
            # Patient has consultation but wrong status - fix it
            patient.current_status = 'WITH_DOCTOR'
            patient.current_location = f"Consultation Room - Dr. {existing_consultation.doctor.full_name}"
            patient.save()
            
            return Response({
                'error': 'This patient already has a consultation in progress.',
                'consultation_id': str(existing_consultation.id),
                'patient_id': patient.patient_id,
                'patient_name': patient.full_name,
                'doctor': existing_consultation.doctor.full_name,
                'started_at': existing_consultation.consultation_date.isoformat(),
                'note': 'Patient status has been updated to WITH_DOCTOR. They should no longer appear in the waiting queue.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create consultation
        consultation_data = {
            'patient_id': patient.patient_id,
            'patient_name': patient.full_name,
            'doctor': request.user.id,
            'chief_complaint': request.data.get('chief_complaint', 'To be determined'),  # Default placeholder
            'priority': request.data.get('priority', 'NORMAL').upper(),
            'symptoms': request.data.get('symptoms', ''),
        }
        
        serializer = ConsultationSerializer(data=consultation_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        consultation = serializer.save(doctor=request.user)
        
        # Update patient status to WITH_DOCTOR using patients app API
        from patients.models import PatientStatusHistory
        
        previous_status = patient.current_status
        previous_location = patient.current_location
        
        patient.current_status = 'WITH_DOCTOR'
        patient.current_location = f"Consultation Room - Dr. {request.user.full_name}"
        patient.last_updated_by = request.user
        patient.save()
        
        # Create status history
        PatientStatusHistory.objects.create(
            patient=patient,
            previous_status=previous_status,
            new_status='WITH_DOCTOR',
            previous_location=previous_location,
            new_location=patient.current_location,
            changed_by=request.user,
            notes=f"Consultation started by Dr. {request.user.full_name}"
        )
        
        return Response({
            'message': 'Consultation started successfully',
            'consultation_id': str(consultation.id),
            'patient_id': patient.patient_id,
            'patient_name': patient.full_name,
            'doctor': request.user.full_name,
            'status_updated': 'WITH_DOCTOR',
            'location': patient.current_location,
            'started_at': consultation.consultation_date.isoformat()
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to start consultation: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='patch',
    operation_summary="Update consultation",
    operation_description="Update consultation details including diagnosis, treatment plan, and vital signs.",
    request_body=ConsultationSerializer,
    responses={
        200: openapi.Response(description="Consultation updated successfully"),
        400: openapi.Response(description="Invalid data"),
        404: openapi.Response(description="Consultation not found")
    },
    tags=['Doctor Portal']
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_consultation(request, consultation_id):
    """
    Update consultation details.
    
    Allows updating diagnosis, treatment plan, vital signs, and other consultation data.
    """
    try:
        consultation = get_object_or_404(Consultation, id=consultation_id)
        
        # Only the doctor who created the consultation can update it
        if consultation.doctor != request.user:
            return Response(
                {'error': 'You can only update your own consultations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ConsultationSerializer(
            consultation, 
            data=request.data, 
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        updated_consultation = serializer.save()
        
        return Response({
            'message': 'Consultation updated successfully',
            'consultation': ConsultationSerializer(updated_consultation).data,
            'updated_at': updated_consultation.updated_at.isoformat()
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to update consultation: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='post',
    operation_summary="Create prescription",
    operation_description="Create medication prescription for a patient. Will be processed by pharmacy.",
    request_body=PrescriptionCreateSerializer,
    responses={
        201: openapi.Response(description="Prescription created successfully"),
        400: openapi.Response(description="Invalid prescription data")
    },
    tags=['Doctor Portal']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_prescription(request):
    """
    Create medication prescription for a patient.

    Prescription will be available to pharmacy for dispensing.
    """
    try:
        serializer = PrescriptionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prescription = serializer.save(prescribed_by=request.user)

        # PAYMENT CREATION MOVED TO complete_consultation VIEW
        # Payment is now created ONCE for ALL prescriptions when consultation is completed
        # This prevents duplicate payments and incorrect pricing
        payment_created = False

        return Response({
            'message': 'Prescription created successfully',
            'prescription_id': str(prescription.id),
            'medication': prescription.medication_name,
            'patient_id': prescription.consultation.patient_id,
            'quantity': prescription.quantity_prescribed,
            'created_at': prescription.prescribed_at.isoformat()
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': f'Failed to create prescription: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='post',
    operation_summary="Request lab test",
    operation_description="Request lab test for a patient. Will be processed by lab portal.",
    request_body=LabTestRequestCreateSerializer,
    responses={
        201: openapi.Response(description="Lab test requested successfully"),
        400: openapi.Response(description="Invalid test request data")
    },
    tags=['Doctor Portal']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_lab_test(request):
    """
    Request comprehensive lab tests for a patient.

    Creates lab test request matching hospital form with all test categories.
    Test request will be available to lab technicians for processing.
    """
    try:
        from finance.utils import create_pending_payment, get_pending_payment_for_service
        from patients.models import Patient
        from decimal import Decimal

        # Add the requesting doctor to the data
        data = request.data.copy()
        data['requested_by'] = request.user.id

        serializer = LabTestRequestCreateSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        lab_request = serializer.save(requested_by=request.user)

        # Count requested tests
        test_fields = [
            'mrdt_requested', 'bs_requested', 'stool_analysis_requested',
            'urine_sed_requested', 'urinalysis_requested', 'rpr_requested',
            'h_pylori_requested', 'hepatitis_b_requested', 'hepatitis_c_requested',
            'ssat_requested', 'upt_requested', 'esr_requested',
            'blood_grouping_requested', 'hb_requested', 'rheumatoid_factor_requested',
            'rbg_requested', 'fbg_requested', 'sickling_test_requested'
        ]

        requested_tests = [field.replace('_requested', '').upper().replace('_', ' ')
                          for field in test_fields if getattr(lab_request, field, False)]

        # Auto-create PENDING payment for lab tests if fee is required
        payment_created = False
        if lab_request.lab_fee_required:
            try:
                patient = Patient.objects.get(patient_id=lab_request.patient_id)

                # Check if payment already exists
                existing_payment = get_pending_payment_for_service(
                    patient=patient,
                    service_type='LAB_TEST',
                    reference_id=lab_request.id
                )

                if not existing_payment:
                    # Get lab fee amount
                    lab_fee = lab_request.lab_fee_amount or Decimal('25000.00')

                    # Create PENDING payment
                    payment = create_pending_payment(
                        patient=patient,
                        service_type='LAB_TEST',
                        service_name=f'Laboratory Tests ({len(requested_tests)} tests)',
                        amount=lab_fee,
                        reference_id=lab_request.id,
                        user=request.user
                    )
                    payment_created = True

                    # Update patient status
                    patient.current_status = 'PENDING_LAB_PAYMENT'
                    patient.current_location = 'Finance - Lab Payment'
                    patient.last_updated_by = request.user
                    patient.save()

            except Exception as payment_error:
                print(f"Error creating lab payment: {payment_error}")

        return Response({
            'message': 'Lab tests requested successfully',
            'request_id': str(lab_request.id),
            'patient_id': lab_request.patient_id,
            'patient_name': lab_request.patient_name,
            'requested_tests': requested_tests,
            'tests_count': len(requested_tests),
            'lab_fee_required': lab_request.lab_fee_required,
            'lab_fee_amount': float(lab_request.lab_fee_amount) if lab_request.lab_fee_amount else 0,
            'status': lab_request.status,
            'requested_at': lab_request.requested_at.isoformat(),
            'payment_created': payment_created,
            'note': 'Patient must proceed to Finance for payment before lab processing' if payment_created else None
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': f'Failed to request lab tests: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='get',
    operation_summary="Get doctor dashboard",
    operation_description="Get doctor's daily summary including consultations, pending tasks, and urgent cases.",
    responses={
        200: openapi.Response(description="Dashboard data", schema=DoctorDashboardSerializer)
    },
    tags=['Doctor Portal']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_dashboard(request):
    """
    Get doctor's dashboard with daily summary.
    
    Shows today's consultations, pending tasks, and system overview.
    """
    try:
        today = timezone.now().date()
        
        # Today's consultations
        today_consultations = Consultation.objects.filter(
            consultation_date__date=today
        ).count()
        
        # Pending consultations (in progress)
        pending_consultations = Consultation.objects.filter(
            status='IN_PROGRESS'
        ).count()
        
        # Patients waiting for doctor (all doctors see same data)
        patients_waiting = Patient.objects.filter(
            current_status='WAITING_DOCTOR'
        ).count()
        
        # Pending lab requests
        lab_requests_pending = LabTestRequest.objects.filter(
            status='PENDING'
        ).count()
        
        # Today's prescriptions
        prescriptions_today = Prescription.objects.filter(
            prescribed_at__date=today
        ).count()
        
        # Recent consultations (last 5)
        recent_consultations = Consultation.objects.select_related('doctor').order_by('-consultation_date')[:5]
        
        # Urgent cases
        urgent_cases = Consultation.objects.filter(
            priority='URGENT',
            status='IN_PROGRESS'
        ).select_related('doctor')[:5]
        
        dashboard_data = {
            'today_consultations': today_consultations,
            'pending_consultations': pending_consultations,
            'patients_waiting': patients_waiting,
            'lab_requests_pending': lab_requests_pending,
            'prescriptions_today': prescriptions_today,
            'recent_consultations': ConsultationListSerializer(recent_consultations, many=True).data,
            'urgent_cases': ConsultationListSerializer(urgent_cases, many=True).data,
        }
        
        return Response({
            **dashboard_data,
            'dashboard_generated_at': timezone.now().isoformat(),
            'doctor_name': request.user.full_name
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to generate dashboard: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='get',
    operation_summary="Get consultations",
    operation_description="Get all consultations for viewing in diagnoses page.",
    responses={200: openapi.Response(description="List of consultations")},
    tags=['Doctor Portal']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_consultations(request):
    """Get consultations. Filter by patient_id if provided."""
    try:
        consultations = Consultation.objects.all()

        # Filter by patient_id if provided
        patient_id = request.query_params.get('patient_id')
        if patient_id:
            consultations = consultations.filter(patient_id=patient_id.upper())

        consultations = consultations.order_by('-consultation_date')
        serializer = ConsultationListSerializer(consultations, many=True)
        return Response({
            'consultations': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        return Response(
            {'error': f'Failed to get consultations: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='post',
    operation_summary="Create consultation record",
    operation_description="Create a new consultation record with diagnosis details.",
    request_body=ConsultationSerializer,
    responses={
        201: openapi.Response(description="Consultation created successfully"),
        400: openapi.Response(description="Invalid data")
    },
    tags=['Doctor Portal']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_consultation(request):
    """
    Create a new consultation record.

    This is typically used when a consultation needs to be created separately
    from the start-consultation flow.
    """
    try:
        data = request.data.copy()
        data['doctor'] = request.user.id
        
        patient_id = data.get('patient_id')
        
        # Check if there's already a consultation IN_PROGRESS for this patient
        if patient_id:
            existing_consultation = Consultation.objects.filter(
                patient_id=patient_id,
                status='IN_PROGRESS'
            ).first()

            if existing_consultation:
                print(f"⚠️ Consultation already exists for {patient_id}: {existing_consultation.id} - Returning it")
                return Response({
                    'message': 'Using existing consultation',
                    'consultation': ConsultationSerializer(existing_consultation).data,
                    'existing': True
                }, status=status.HTTP_200_OK)

        serializer = ConsultationSerializer(data=data)

        if not serializer.is_valid():
            print(f"❌ Consultation validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        consultation = serializer.save()

        return Response({
            'message': 'Consultation created successfully',
            'consultation': ConsultationSerializer(consultation).data,
            'created_at': consultation.consultation_date.isoformat()
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"❌ Failed to create consultation: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to create consultation: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='get',
    operation_summary="Get prescriptions",
    operation_description="Get all prescriptions.",
    responses={200: openapi.Response(description="List of prescriptions")},
    tags=['Doctor Portal']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_prescriptions(request):
    """Get all prescriptions."""
    try:
        prescriptions = Prescription.objects.all().order_by('-prescribed_at')
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response({
            'prescriptions': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        return Response(
            {'error': f'Failed to get prescriptions: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='get',
    operation_summary="Get lab requests",
    operation_description="Get comprehensive lab test requests. Filter by patient_id or consultation_id if provided.",
    manual_parameters=[
        openapi.Parameter(
            'patient_id', openapi.IN_QUERY,
            description="Filter by patient ID",
            type=openapi.TYPE_STRING,
            required=False
        ),
        openapi.Parameter(
            'consultation_id', openapi.IN_QUERY,
            description="Filter by consultation ID",
            type=openapi.TYPE_STRING,
            required=False
        )
    ],
    responses={200: openapi.Response(description="List of lab requests")},
    tags=['Doctor Portal']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lab_requests(request):
    """Get comprehensive lab test requests with filtering options."""
    try:
        lab_requests = LabTestRequest.objects.all()

        # Filter by patient_id if provided
        patient_id = request.query_params.get('patient_id')
        if patient_id:
            lab_requests = lab_requests.filter(patient_id=patient_id.upper())

        # Filter by consultation_id if provided
        consultation_id = request.query_params.get('consultation_id')
        if consultation_id:
            lab_requests = lab_requests.filter(consultation_id=consultation_id)

        lab_requests = lab_requests.order_by('-requested_at')
        serializer = LabTestRequestSerializer(lab_requests, many=True)

        return Response({
            'lab_requests': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        return Response(
            {'error': f'Failed to get lab requests: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='get',
    operation_summary="Get consultation details",
    operation_description="Get detailed consultation information including clinical notes and payment status.",
    responses={
        200: openapi.Response(description="Consultation details", schema=ConsultationSerializer),
        404: openapi.Response(description="Consultation not found")
    },
    tags=['Doctor Portal']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_consultation_detail(request, consultation_id):
    """Get detailed consultation information."""
    try:
        consultation = get_object_or_404(Consultation, id=consultation_id)
        serializer = ConsultationSerializer(consultation)

        return Response({
            'consultation': serializer.data,
            'patient_id': consultation.patient_id,
            'doctor_name': consultation.doctor.full_name
        })

    except Exception as e:
        return Response(
            {'error': f'Failed to get consultation details: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='post',
    operation_summary="Complete consultation",
    operation_description="Mark consultation as completed and update patient status.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'consultation_id': openapi.Schema(type=openapi.TYPE_STRING, description="Consultation ID"),
        },
        required=['consultation_id']
    ),
    responses={
        200: openapi.Response(description="Consultation completed successfully"),
        400: openapi.Response(description="Invalid data"),
        404: openapi.Response(description="Consultation not found")
    },
    tags=['Doctor Portal']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_consultation(request):
    """Mark consultation as completed and update patient status."""
    try:
        from finance.utils import create_pending_payment, get_pending_payment_for_service, get_consultation_price
        from decimal import Decimal

        consultation_id = request.data.get('consultation_id')
        if not consultation_id:
            return Response(
                {'error': 'Consultation ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        consultation = get_object_or_404(Consultation, id=consultation_id)

        # Check if the current user is the doctor for this consultation
        if consultation.doctor != request.user:
            return Response(
                {'error': 'You can only complete your own consultations'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Mark consultation as completed
        consultation.status = 'COMPLETED'
        consultation.completed_at = timezone.now()
        consultation.save()

        # Update patient status and create payment
        try:
            from patients.models import Patient, PatientStatusHistory
            patient = Patient.objects.get(patient_id=consultation.patient_id)

            previous_status = patient.current_status
            previous_location = patient.current_location

            # ALWAYS auto-create PENDING payment for consultation (required in workflow)
            payment_created = False
            
            # Check if payment already exists
            existing_payment = get_pending_payment_for_service(
                patient=patient,
                service_type='CONSULTATION',
                reference_id=consultation.id
            )

            if not existing_payment:
                # Get consultation price (default 5,000 TZS as per workflow)
                consultation_amount = consultation.consultation_fee_amount or get_consultation_price() or Decimal('5000.00')

                # Create PENDING payment
                payment = create_pending_payment(
                    patient=patient,
                    service_type='CONSULTATION',
                    service_name=f'Doctor Consultation - {consultation.diagnosis or "General"}',
                    amount=consultation_amount,
                    reference_id=consultation.id,
                    user=request.user
                )
                payment_created = True
                print(f"✅ Created PENDING consultation payment: {payment.id} for {consultation_amount} TZS")
            else:
                print(f"ℹ️ Consultation payment already exists: {existing_payment.id}")

            # Create medication payment if there are prescriptions with costs
            prescriptions = consultation.prescriptions.all()
            if prescriptions.exists():
                total_medication_cost = sum(p.total_cost for p in prescriptions)
                if total_medication_cost > 0:
                    # Check if medication payment already exists
                    existing_med_payment = get_pending_payment_for_service(
                        patient=patient,
                        service_type='MEDICATION',
                        reference_id=consultation.id
                    )
                    if not existing_med_payment:
                        med_payment = create_pending_payment(
                            patient=patient,
                            service_type='MEDICATION',
                            service_name=f'Medications ({prescriptions.count()} items)',
                            amount=total_medication_cost,
                            reference_id=consultation.id,
                            user=request.user
                        )
                        print(f"✅ Created PENDING medication payment: {med_payment.id} for {total_medication_cost} TZS ({prescriptions.count()} medications)")
                    else:
                        print(f"ℹ️ Medication payment already exists: {existing_med_payment.id}")

            # Create lab test payment if there are lab requests
            lab_requests = consultation.lab_requests.all()
            if lab_requests.exists():
                # Calculate total cost from specific test prices
                from finance.models import ServicePricing

                # Map test IDs to service codes
                test_id_to_code = {
                    'mrdt': 'LAB_MRDT',
                    'bs': 'LAB_BS',
                    'stool_macro': 'LAB_STOOL_ANALYSIS',
                    'stool_micro': 'LAB_STOOL_ANALYSIS',
                    'urine_sed_macro': 'LAB_URINE_SED',
                    'urine_sed_micro': 'LAB_URINE_SED',
                    'urinalysis': 'LAB_URINALYSIS',
                    'rpr': 'LAB_RPR',
                    'h_pylori': 'LAB_H_PYLORI',
                    'hepatitis_b': 'LAB_HEPATITIS_B',
                    'hepatitis_c': 'LAB_HEPATITIS_C',
                    'ssat': 'LAB_SSAT',
                    'upt': 'LAB_UPT',
                    'glucose': 'LAB_BLOOD_SUGAR',
                    'esr': 'LAB_ESR',
                    'b_grouping': 'LAB_BLOOD_GROUPING',
                    'hb': 'LAB_HB',
                    'rheumatoid_factor': 'LAB_RF',
                    'rbg': 'LAB_RBG',
                    'fbg': 'LAB_FBG',
                    'sickling_test': 'LAB_SICKLING_TEST',
                }

                total_lab_cost = Decimal('0')
                test_names = []

                for lab_request in lab_requests:
                    if lab_request.selected_tests:
                        for test_id in lab_request.selected_tests:
                            service_code = test_id_to_code.get(test_id)
                            if service_code:
                                pricing = ServicePricing.objects.filter(service_code=service_code).first()
                                if pricing:
                                    total_lab_cost += pricing.standard_price
                                    test_names.append(pricing.service_name)
                                else:
                                    # Fallback price if not in database
                                    total_lab_cost += Decimal('15000.00')
                                    test_names.append(test_id)

                if total_lab_cost > 0:
                    # Check if lab payment already exists
                    existing_lab_payment = get_pending_payment_for_service(
                        patient=patient,
                        service_type='LAB_TEST',
                        reference_id=consultation.id
                    )
                    if not existing_lab_payment:
                        lab_payment = create_pending_payment(
                            patient=patient,
                            service_type='LAB_TEST',
                            service_name=f'Lab Tests ({len(test_names)} tests)',
                            amount=total_lab_cost,
                            reference_id=consultation.id,
                            user=request.user
                        )
                        print(f"✅ Created PENDING lab test payment: {lab_payment.id} for {total_lab_cost} TZS ({len(test_names)} tests: {', '.join(test_names[:3])}{'...' if len(test_names) > 3 else ''})")
                    else:
                        print(f"ℹ️ Lab test payment already exists: {existing_lab_payment.id}")

            # Update patient status to indicate pending consultation payment
            patient.current_status = 'PENDING_CONSULTATION_PAYMENT'
            patient.current_location = 'Finance - Consultation Payment'
            patient.last_updated_by = request.user
            patient.save()

            # Create status history
            PatientStatusHistory.objects.create(
                patient=patient,
                previous_status=previous_status,
                new_status='PENDING_CONSULTATION_PAYMENT',
                previous_location=previous_location,
                new_location=patient.current_location,
                changed_by=request.user,
                notes=f"Consultation completed by Dr. {request.user.full_name}. Payment pending."
            )
        except Exception as patient_error:
            # Log the error but don't fail the consultation completion
            print(f"Error updating patient status: {patient_error}")

        return Response({
            'message': 'Consultation completed successfully',
            'consultation_id': str(consultation.id),
            'patient_id': consultation.patient_id,
            'completed_at': consultation.completed_at.isoformat(),
            'patient_status_updated': 'PENDING_CONSULTATION_PAYMENT',
            'payment_created': payment_created,
            'note': 'Patient must proceed to Finance for payment before next service'
        })

    except Exception as e:
        return Response(
            {'error': f'Failed to complete consultation: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
