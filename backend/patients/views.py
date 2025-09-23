from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Patient, PatientStatusHistory
from .serializers import (
    PatientSerializer, PatientSearchSerializer, PatientDetailSerializer,
    PatientStatusUpdateSerializer, PatientStatusHistorySerializer, PatientQueueSerializer
)


@swagger_auto_schema(
    method='get',
    operation_summary="Search patients",
    operation_description="Search patients by name, phone number, or patient ID. Returns lightweight patient data for quick access.",
    manual_parameters=[
        openapi.Parameter(
            'q', openapi.IN_QUERY,
            description="Search query (name, phone, or patient ID)",
            type=openapi.TYPE_STRING,
            required=True
        ),
        openapi.Parameter(
            'status', openapi.IN_QUERY,
            description="Filter by current status (optional)",
            type=openapi.TYPE_STRING,
            required=False
        ),
        openapi.Parameter(
            'limit', openapi.IN_QUERY,
            description="Limit number of results (default: 20, max: 100)",
            type=openapi.TYPE_INTEGER,
            required=False
        )
    ],
    responses={
        200: openapi.Response(
            description="Search results",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'results': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_OBJECT)
                    ),
                    'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'query': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        400: openapi.Response(description="Missing or invalid search query"),
        401: openapi.Response(description="Authentication required")
    },
    tags=['Patient Core - Universal APIs']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_patients(request):
    """
    Search patients by name, phone number, or patient ID.
    
    This is the universal search endpoint used by all sectors (reception, doctor, pharmacy, etc.)
    to quickly find patients. Returns lightweight data for performance.
    """
    query = request.query_params.get('q', '').strip()
    status_filter = request.query_params.get('status', '').strip()
    limit = min(int(request.query_params.get('limit', 20)), 100)  # Max 100 results
    
    if not query:
        return Response(
            {'error': 'Search query (q) is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Build search query
    search_filters = Q()
    
    # Search by patient ID (exact match)
    if query.upper().startswith('PAT'):
        search_filters |= Q(patient_id__iexact=query)
    
    # Search by name (case-insensitive, partial match)
    search_filters |= Q(full_name__icontains=query)
    
    # Search by phone number (partial match)
    if query.replace('+', '').replace('-', '').replace(' ', '').isdigit():
        search_filters |= Q(phone_number__icontains=query.replace(' ', '').replace('-', ''))
    
    # Apply filters
    patients = Patient.objects.filter(search_filters)
    
    # Filter by status if provided
    if status_filter:
        patients = patients.filter(current_status=status_filter.upper())
    
    # Apply limit and ordering
    patients = patients.order_by('-created_at')[:limit]
    
    # Serialize results
    serializer = PatientSearchSerializer(patients, many=True)
    
    return Response({
        'results': serializer.data,
        'count': len(serializer.data),
        'query': query,
        'status_filter': status_filter or None,
        'limit': limit
    })


@swagger_auto_schema(
    method='get',
    operation_summary="Get patient details",
    operation_description="Get complete patient information including status history and notes. Used when full patient data is needed.",
    responses={
        200: PatientDetailSerializer,
        404: openapi.Response(description="Patient not found"),
        401: openapi.Response(description="Authentication required")
    },
    tags=['Patient Core - Universal APIs']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_details(request, patient_id):
    """
    Get complete patient information including status history.
    
    This endpoint provides all patient data needed for medical care,
    including calculated fields (age, BMI) and recent status changes.
    """
    try:
        # Try to find by UUID first, then by patient_id
        if len(patient_id) == 36:  # UUID format
            patient = get_object_or_404(Patient, id=patient_id)
        else:
            patient = get_object_or_404(Patient, patient_id=patient_id.upper())
        
        serializer = PatientDetailSerializer(patient)
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {'error': f'Patient not found: {str(e)}'},
            status=status.HTTP_404_NOT_FOUND
        )


@swagger_auto_schema(
    method='patch',
    operation_summary="Update patient status",
    operation_description="Update patient's current status and location. Creates audit trail in status history.",
    request_body=PatientStatusUpdateSerializer,
    responses={
        200: openapi.Response(
            description="Status updated successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'new_status': openapi.Schema(type=openapi.TYPE_STRING),
                    'new_location': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        400: openapi.Response(description="Invalid status or data"),
        404: openapi.Response(description="Patient not found"),
        401: openapi.Response(description="Authentication required")
    },
    tags=['Patient Core - Universal APIs']
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_patient_status(request, patient_id):
    """
    Update patient status and location with audit trail.
    
    This endpoint is used by all sectors to track patient movement
    through the hospital. Automatically creates status history records.
    """
    try:
        # Find patient
        if len(patient_id) == 36:  # UUID format
            patient = get_object_or_404(Patient, id=patient_id)
        else:
            patient = get_object_or_404(Patient, patient_id=patient_id.upper())
        
        # Validate input
        serializer = PatientStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Store previous values for history
        previous_status = patient.current_status
        previous_location = patient.current_location
        
        # Update patient
        new_status = serializer.validated_data.get('current_status')
        new_location = serializer.validated_data.get('current_location', '')
        notes = serializer.validated_data.get('notes', '')
        
        patient.current_status = new_status
        patient.current_location = new_location
        patient.last_updated_by = request.user
        patient.save()
        
        # Create status history record
        PatientStatusHistory.objects.create(
            patient=patient,
            previous_status=previous_status,
            new_status=new_status,
            previous_location=previous_location,
            new_location=new_location,
            changed_by=request.user,
            notes=notes
        )
        
        return Response({
            'message': 'Patient status updated successfully',
            'patient_id': patient.patient_id,
            'previous_status': previous_status,
            'new_status': new_status,
            'previous_location': previous_location,
            'new_location': new_location,
            'updated_by': request.user.full_name,
            'updated_at': timezone.now().isoformat()
        })
    
    except Exception as e:
        return Response(
            {'error': f'Failed to update patient status: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='delete',
    operation_summary="Delete patient record",
    operation_description="Permanently delete a patient record. This action cannot be undone.",
    responses={
        200: openapi.Response(
            description="Patient deleted successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                    'patient_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'deleted_by': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        404: openapi.Response(description="Patient not found"),
        401: openapi.Response(description="Authentication required")
    },
    tags=['Patient Core - Universal APIs']
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_patient(request, patient_id):
    """
    Delete a patient record permanently.
    
    This endpoint completely removes a patient from the system.
    Use with caution as this action cannot be undone.
    """
    try:
        # Find patient
        if len(patient_id) == 36:  # UUID format
            patient = get_object_or_404(Patient, id=patient_id)
        else:
            patient = get_object_or_404(Patient, patient_id=patient_id.upper())
        
        patient_name = patient.full_name
        patient_identifier = patient.patient_id
        
        # Delete the patient (CASCADE will handle related records)
        patient.delete()
        
        return Response({
            'message': f'Patient {patient_name} deleted successfully',
            'patient_id': patient_identifier,
            'deleted_by': getattr(request.user, 'full_name', request.user.username),
            'deleted_at': timezone.now().isoformat()
        })
    
    except Patient.DoesNotExist:
        return Response(
            {'error': f'Patient with ID {patient_id} not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        # Log the actual error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f'Delete patient error for {patient_id}: {str(e)}')

        return Response(
            {'error': f'Failed to delete patient: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method='get',
    operation_summary="Get patient queue with FIFO ordering",
    operation_description="Get all active patients in proper queue order based on when they entered each status, not their ID.",
    manual_parameters=[
        openapi.Parameter(
            'limit', openapi.IN_QUERY,
            description="Limit number of results (default: 100)",
            type=openapi.TYPE_INTEGER,
            required=False
        )
    ],
    responses={
        200: openapi.Response(
            description="Queue data with FIFO ordering",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'results': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_OBJECT)
                    ),
                    'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                }
            )
        ),
        401: openapi.Response(description="Authentication required")
    },
    tags=['Patient Core - Universal APIs']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_queue(request):
    """
    Get all active patients in proper FIFO queue order.

    This endpoint returns patients ordered by their actual queue entry time
    (when they changed to WAITING_DOCTOR status), not by their patient ID.
    """
    limit = min(int(request.query_params.get('limit', 100)), 200)  # Max 200 results

    # Get all non-completed patients
    active_statuses = [
        'REGISTERED', 'WAITING_DOCTOR', 'WITH_DOCTOR',
        'WAITING_LAB', 'IN_LAB', 'LAB_RESULTS_READY',
        'WAITING_PHARMACY', 'IN_PHARMACY', 'PAYMENT_PENDING'
    ]

    patients = Patient.objects.filter(
        current_status__in=active_statuses
    ).prefetch_related('status_history')[:limit]

    # Serialize with queue entry time
    serializer = PatientQueueSerializer(patients, many=True)

    # Sort by queue_entry_time in frontend after serialization
    # (Django can't easily sort by SerializerMethodField)
    sorted_results = sorted(
        serializer.data,
        key=lambda x: x['queue_entry_time'] if x['queue_entry_time'] else '9999-12-31T23:59:59'
    )

    return Response({
        'results': sorted_results,
        'count': len(sorted_results),
        'note': 'Patients ordered by actual queue entry time (FIFO)'
    })
