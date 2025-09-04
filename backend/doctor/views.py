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
        
        # Create consultation
        consultation_data = {
            'patient_id': patient.patient_id,
            'patient_name': patient.full_name,
            'doctor': request.user.id,
            'chief_complaint': request.data.get('chief_complaint'),
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
    Request lab test for a patient.
    
    Test request will be available to lab technicians for processing.
    """
    try:
        serializer = LabTestRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        lab_request = serializer.save(requested_by=request.user)
        
        return Response({
            'message': 'Lab test requested successfully',
            'request_id': str(lab_request.id),
            'test_type': lab_request.test_type,
            'patient_id': lab_request.consultation.patient_id,
            'urgency': lab_request.urgency,
            'requested_at': lab_request.requested_at.isoformat()
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to request lab test: {str(e)}'},
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
            status='REQUESTED'
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
