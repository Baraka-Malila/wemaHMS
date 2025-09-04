from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import LabTestResult, LabOrder
from .serializers import LabTestResultSerializer, LabOrderSerializer
from core.permissions import IsLabStaff
from doctor.models import LabTestRequest  # Integration with doctor app


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLabStaff])
def lab_patients_queue(request):
    """
    Get all patients waiting for lab tests.
    Shows pending lab requests from doctors.
    """
    try:
        # Get all pending lab requests that don't have results yet
        pending_requests = LabTestRequest.objects.filter(
            status='PENDING'
        ).exclude(
            id__in=LabTestResult.objects.values_list('lab_request_id', flat=True)
        ).order_by('-created_at')
        
        patients_queue = []
        for request in pending_requests:
            patients_queue.append({
                'request_id': str(request.id),
                'patient_id': request.patient_id,
                'patient_name': request.patient_name,
                'test_type': request.test_type,
                'requested_by': request.doctor.get_full_name(),
                'requested_at': request.created_at,
                'priority': request.priority,
                'instructions': request.instructions
            })
        
        return Response({
            'success': True,
            'queue_count': len(patients_queue),
            'patients_queue': patients_queue
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsLabStaff])
def lab_results_list(request):
    """
    GET: View all lab results
    POST: Create new test result
    """
    if request.method == 'GET':
        results = LabTestResult.objects.all().order_by('-test_completed_at')
        serializer = LabTestResultSerializer(results, many=True)
        return Response({
            'success': True,
            'results': serializer.data
        })
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['processed_by'] = request.user.id
        
        serializer = LabTestResultSerializer(data=data)
        if serializer.is_valid():
            result = serializer.save()
            
            # Update lab request status to COMPLETED
            try:
                lab_request = LabTestRequest.objects.get(id=data['lab_request_id'])
                lab_request.status = 'COMPLETED'
                lab_request.save()
            except LabTestRequest.DoesNotExist:
                pass
            
            return Response({
                'success': True,
                'message': 'Test result saved successfully',
                'result': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsLabStaff])
def lab_result_detail(request, pk):
    """
    GET: View specific result
    PATCH: Update result details
    """
    try:
        result = get_object_or_404(LabTestResult, pk=pk)
        
        if request.method == 'GET':
            serializer = LabTestResultSerializer(result)
            return Response({
                'success': True,
                'result': serializer.data
            })
        
        elif request.method == 'PATCH':
            serializer = LabTestResultSerializer(result, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Result updated successfully',
                    'result': serializer.data
                })
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsLabStaff])
def lab_orders_list(request):
    """
    GET: View all lab orders
    POST: Create new supply order
    """
    if request.method == 'GET':
        orders = LabOrder.objects.filter(requested_by=request.user).order_by('-created_at')
        serializer = LabOrderSerializer(orders, many=True)
        return Response({
            'success': True,
            'orders': serializer.data
        })
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['requested_by'] = request.user.id
        
        serializer = LabOrderSerializer(data=data)
        if serializer.is_valid():
            order = serializer.save()
            return Response({
                'success': True,
                'message': 'Order created successfully',
                'order': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLabStaff])
def submit_lab_order(request, pk):
    """
    Submit lab order to pharmacy for approval.
    """
    try:
        order = get_object_or_404(LabOrder, pk=pk, requested_by=request.user)
        
        if order.status != 'DRAFT':
            return Response({
                'success': False,
                'error': 'Only draft orders can be submitted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'SUBMITTED'
        order.save()
        
        return Response({
            'success': True,
            'message': 'Order submitted to pharmacy successfully',
            'order_id': str(order.id)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
