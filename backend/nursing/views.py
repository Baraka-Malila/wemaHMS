from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import NursingService, WardAssignment
from core.permissions import IsStaffMember


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsStaffMember])
def nursing_services(request):
    """
    GET: List nursing services (filtered by nurse if not admin)
    POST: Create new nursing service
    """
    if request.method == 'GET':
        services = NursingService.objects.all()
        
        # Non-admin nurses only see their own services
        if hasattr(request.user, 'role') and request.user.role == 'NURSE':
            services = services.filter(assigned_nurse=request.user)
        
        # Filter by patient if requested
        patient_id = request.GET.get('patient_id')
        if patient_id:
            services = services.filter(patient_id=patient_id)
        
        # Filter by status
        service_status = request.GET.get('status')
        if service_status:
            services = services.filter(status=service_status)
        
        services_data = []
        for service in services:
            services_data.append({
                'id': str(service.id),
                'patient_id': service.patient_id,
                'patient_name': service.patient_name,
                'service_type': service.service_type,
                'service_description': service.service_description,
                'status': service.status,
                'priority': service.priority,
                'assigned_nurse': service.assigned_nurse.get_full_name(),
                'scheduled_at': service.scheduled_at,
                'completed_at': service.completed_at,
                'nurse_notes': service.nurse_notes
            })
        
        return Response({
            'success': True,
            'count': len(services_data),
            'services': services_data
        })
    
    elif request.method == 'POST':
        try:
            service = NursingService.objects.create(
                patient_id=request.data['patient_id'],
                patient_name=request.data['patient_name'],
                service_type=request.data['service_type'],
                service_description=request.data['service_description'],
                assigned_nurse=request.user,
                scheduled_at=request.data['scheduled_at'],
                priority=request.data.get('priority', 'NORMAL')
            )
            
            return Response({
                'success': True,
                'message': 'Nursing service scheduled successfully',
                'service_id': str(service.id)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsStaffMember])
def update_nursing_service(request, service_id):
    """
    Update nursing service (complete, add notes, etc.)
    """
    try:
        service = get_object_or_404(NursingService, id=service_id)
        
        # Update allowed fields
        if 'status' in request.data:
            service.status = request.data['status']
        if 'nurse_notes' in request.data:
            service.nurse_notes = request.data['nurse_notes']
        if 'patient_response' in request.data:
            service.patient_response = request.data['patient_response']
        if 'vital_signs' in request.data:
            service.vital_signs = request.data['vital_signs']
        if 'medications_given' in request.data:
            service.medications_given = request.data['medications_given']
        
        service.save()
        
        return Response({
            'success': True,
            'message': 'Nursing service updated successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsStaffMember])
def ward_assignments(request):
    """
    GET: List ward assignments and bed status
    POST: Admit patient to ward
    """
    if request.method == 'GET':
        assignments = WardAssignment.objects.filter(status='ADMITTED')
        
        assignments_data = []
        for assignment in assignments:
            assignments_data.append({
                'id': str(assignment.id),
                'patient_id': assignment.patient_id,
                'patient_name': assignment.patient_name,
                'ward_type': assignment.ward_type,
                'bed_number': assignment.bed_number,
                'admission_date': assignment.admission_date,
                'days_admitted': assignment.days_admitted,
                'primary_nurse': assignment.primary_nurse.get_full_name(),
                'attending_doctor': assignment.attending_doctor.get_full_name(),
                'daily_ward_fee': float(assignment.daily_ward_fee),
                'total_charges': float(assignment.total_ward_charges)
            })
        
        return Response({
            'success': True,
            'current_patients': len(assignments_data),
            'ward_assignments': assignments_data
        })
    
    elif request.method == 'POST':
        try:
            assignment = WardAssignment.objects.create(
                patient_id=request.data['patient_id'],
                patient_name=request.data['patient_name'],
                ward_type=request.data['ward_type'],
                bed_number=request.data['bed_number'],
                admission_date=request.data['admission_date'],
                primary_nurse_id=request.data['primary_nurse_id'],
                attending_doctor_id=request.data['attending_doctor_id'],
                admission_notes=request.data['admission_notes'],
                daily_ward_fee=request.data['daily_ward_fee']
            )
            
            return Response({
                'success': True,
                'message': 'Patient admitted to ward successfully',
                'assignment_id': str(assignment.id)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStaffMember])
def discharge_patient(request, assignment_id):
    """
    Discharge patient from ward
    """
    try:
        assignment = get_object_or_404(WardAssignment, id=assignment_id)
        
        assignment.status = 'DISCHARGED'
        assignment.discharge_date = request.data['discharge_date']
        assignment.discharge_notes = request.data.get('discharge_notes', '')
        assignment.save()
        
        # TODO: Send to finance for final ward billing
        
        return Response({
            'success': True,
            'message': 'Patient discharged successfully',
            'total_days': assignment.days_admitted,
            'total_ward_charges': float(assignment.total_ward_charges)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
