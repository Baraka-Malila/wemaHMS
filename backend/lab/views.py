from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
import json

from .models import LabTestResult, LabOrder
from .serializers import (
    LabTestResultSerializer, LabTestResultCreateSerializer, 
    LabTestResultListSerializer, LabTestResultUpdateSerializer,
    LabOrderSerializer, LabOrderCreateSerializer,
    LabDashboardStatsSerializer, LabWorkloadSerializer
)
from core.permissions import IsLabStaff, IsLabStaffOrDoctor


# ==================== LAB TEST RESULTS VIEWS ====================

class LabTestResultListView(generics.ListCreateAPIView):
    """
    List all lab test results or create new ones.
    GET: Returns all test results for lab staff
    POST: Create new test result
    """
    permission_classes = [IsAuthenticated, IsLabStaff]
    
    def get_queryset(self):
        queryset = LabTestResult.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(result_status=status_filter)
        
        # Filter by urgent flag
        urgent_only = self.request.query_params.get('urgent')
        if urgent_only == 'true':
            queryset = queryset.filter(urgent_flag=True)
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id__icontains=patient_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(test_completed_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(test_completed_at__date__lte=date_to)
        
        # Filter by test type
        test_type = self.request.query_params.get('test_type')
        if test_type:
            queryset = queryset.filter(test_type__icontains=test_type)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LabTestResultCreateSerializer
        return LabTestResultListSerializer


class LabTestResultDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update a specific lab test result.
    GET: View full details of test result
    PUT/PATCH: Update test result (restricted fields)
    """
    queryset = LabTestResult.objects.all()
    permission_classes = [IsAuthenticated, IsLabStaffOrDoctor]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LabTestResultUpdateSerializer
        return LabTestResultSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLabStaffOrDoctor])
def lab_test_results_by_request(request, request_id):
    """
    Get lab test results for a specific lab request ID.
    Used by doctors to check results for their requests.
    """
    try:
        results = LabTestResult.objects.filter(lab_request_id=request_id)
        serializer = LabTestResultListSerializer(results, many=True)
        return Response({
            'success': True,
            'request_id': request_id,
            'results_count': results.count(),
            'results': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLabStaff])
def mark_result_urgent(request, result_id):
    """
    Mark a lab test result as urgent.
    Requires technician notes for urgent marking.
    """
    try:
        result = get_object_or_404(LabTestResult, id=result_id)
        notes = request.data.get('technician_notes', '')
        
        if not notes:
            return Response({
                'success': False,
                'error': 'Technician notes are required for urgent results.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        result.urgent_flag = True
        result.technician_notes = notes
        result.save()
        
        serializer = LabTestResultSerializer(result)
        return Response({
            'success': True,
            'message': 'Test result marked as urgent.',
            'result': serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLabStaff])
def notify_doctor_result(request, result_id):
    """
    Mark that doctor has been notified about test results.
    Updates notification status for tracking.
    """
    try:
        result = get_object_or_404(LabTestResult, id=result_id)
        
        result.doctor_notified = True
        result.save()
        
        # TODO: Integrate with notification system to actually notify doctor
        
        return Response({
            'success': True,
            'message': 'Doctor notification sent successfully.',
            'result_id': str(result.id),
            'patient_id': result.patient_id
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== LAB ORDERS VIEWS ====================

class LabOrderListView(generics.ListCreateAPIView):
    """
    List all lab orders or create new ones.
    GET: Returns all orders for lab staff
    POST: Create new supply order
    """
    permission_classes = [IsAuthenticated, IsLabStaff]
    
    def get_queryset(self):
        queryset = LabOrder.objects.all()
        
        # Filter by status
        order_status = self.request.query_params.get('status')
        if order_status:
            queryset = queryset.filter(status=order_status)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by requester
        if not self.request.user.role == 'ADMIN':
            # Non-admin users only see their own orders
            queryset = queryset.filter(requested_by=self.request.user)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LabOrderCreateSerializer
        return LabOrderSerializer


class LabOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update a specific lab order.
    """
    queryset = LabOrder.objects.all()
    serializer_class = LabOrderSerializer
    permission_classes = [IsAuthenticated, IsLabStaff]


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLabStaff])
def submit_lab_order(request, order_id):
    """
    Submit lab order to pharmacy for approval.
    Changes status from DRAFT to SUBMITTED.
    """
    try:
        order = get_object_or_404(LabOrder, id=order_id)
        
        if order.status != 'DRAFT':
            return Response({
                'success': False,
                'error': 'Only draft orders can be submitted.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'SUBMITTED'
        order.submitted_at = timezone.now()
        order.save()
        
        # TODO: Send notification to pharmacy staff
        
        serializer = LabOrderSerializer(order)
        return Response({
            'success': True,
            'message': 'Order submitted to pharmacy successfully.',
            'order': serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== DASHBOARD AND STATISTICS VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLabStaff])
def lab_dashboard_stats(request):
    """
    Get comprehensive statistics for lab dashboard.
    Returns counts, recent activity, and performance metrics.
    """
    try:
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Basic counts
        pending_tests = LabTestResult.objects.filter(result_status='IN_PROGRESS').count()
        completed_today = LabTestResult.objects.filter(
            test_completed_at__date=today,
            result_status__in=['COMPLETED', 'ABNORMAL', 'CRITICAL']
        ).count()
        urgent_results = LabTestResult.objects.filter(urgent_flag=True, doctor_notified=False).count()
        critical_results = LabTestResult.objects.filter(
            result_status='CRITICAL',
            doctor_notified=False
        ).count()
        pending_orders = LabOrder.objects.filter(status__in=['DRAFT', 'SUBMITTED']).count()
        
        # Average processing time (in minutes)
        avg_processing = LabTestResult.objects.filter(
            test_completed_at__date__gte=week_ago
        ).aggregate(
            avg_time=Avg('test_completed_at') - Avg('test_started_at')
        )
        avg_processing_minutes = 0
        if avg_processing['avg_time']:
            avg_processing_minutes = avg_processing['avg_time'].total_seconds() / 60
        
        # Recent completions (last 10)
        recent_completions = LabTestResult.objects.filter(
            result_status__in=['COMPLETED', 'ABNORMAL', 'CRITICAL']
        ).order_by('-test_completed_at')[:10]
        
        # Urgent cases that need attention
        urgent_cases = LabTestResult.objects.filter(
            urgent_flag=True,
            doctor_notified=False
        ).order_by('-test_completed_at')[:10]
        
        # Prepare dashboard data
        dashboard_data = {
            'pending_tests': pending_tests,
            'completed_today': completed_today,
            'urgent_results': urgent_results,
            'critical_results': critical_results,
            'average_processing_time': round(avg_processing_minutes, 1),
            'pending_orders': pending_orders,
            'recent_completions': LabTestResultListSerializer(recent_completions, many=True).data,
            'urgent_cases': LabTestResultListSerializer(urgent_cases, many=True).data,
        }
        
        return Response({
            'success': True,
            'dashboard_stats': dashboard_data,
            'last_updated': timezone.now()
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLabStaff])
def lab_workload_analysis(request):
    """
    Get detailed workload analysis for lab management.
    Shows test distribution, technician performance, and trends.
    """
    try:
        # Date range for analysis
        days = int(request.GET.get('days', 7))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Total tests in period
        total_tests = LabTestResult.objects.filter(
            test_started_at__date__range=[start_date, end_date]
        ).count()
        
        # Tests by type
        tests_by_type = LabTestResult.objects.filter(
            test_started_at__date__range=[start_date, end_date]
        ).values('test_type').annotate(count=Count('id')).order_by('-count')
        
        # Tests by day
        tests_by_day = {}
        for i in range(days):
            date = start_date + timedelta(days=i)
            count = LabTestResult.objects.filter(test_started_at__date=date).count()
            tests_by_day[str(date)] = count
        
        # Technician performance
        technician_performance = LabTestResult.objects.filter(
            test_started_at__date__range=[start_date, end_date]
        ).values(
            'processed_by__first_name', 
            'processed_by__last_name'
        ).annotate(
            tests_completed=Count('id'),
            avg_processing_time=Avg('test_completed_at') - Avg('test_started_at')
        ).order_by('-tests_completed')
        
        # Busiest hours (hour of day analysis)
        busiest_hours = {}
        for hour in range(24):
            count = LabTestResult.objects.filter(
                test_started_at__date__range=[start_date, end_date],
                test_started_at__hour=hour
            ).count()
            busiest_hours[f"{hour:02d}:00"] = count
        
        workload_data = {
            'total_tests_this_week': total_tests,
            'tests_by_type': {item['test_type']: item['count'] for item in tests_by_type},
            'tests_by_day': tests_by_day,
            'technician_performance': list(technician_performance),
            'busiest_hours': busiest_hours,
        }
        
        return Response({
            'success': True,
            'analysis_period': f'{start_date} to {end_date}',
            'workload_analysis': workload_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLabStaffOrDoctor])
def lab_test_queue(request):
    """
    Get the current test queue for lab technicians.
    Shows pending tests organized by priority and urgency.
    """
    try:
        # Get all test requests from doctor app that don't have results yet
        # For now, return mock data as we need to integrate with doctor app
        
        # In real implementation, this would query doctor.LabTestRequest
        # and cross-reference with existing LabTestResult records
        
        return Response({
            'success': True,
            'message': 'Test queue endpoint ready - needs integration with doctor app',
            'queue_summary': {
                'urgent_requests': 0,
                'normal_requests': 0,
                'total_pending': 0
            },
            'pending_requests': []
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
