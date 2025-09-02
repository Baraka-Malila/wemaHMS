from django.shortcuts import render
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from datetime import datetime, timedelta
from decimal import Decimal

from auth_portal.models import User
from .models import SystemActivity, PharmacyAlert, DashboardStats, SystemStatus
from .serializers import (
    DashboardStatsSerializer, RevenueDataSerializer, AppointmentBreakdownSerializer,
    PharmacyAlertSerializer, SystemActivitySerializer, SystemStatusSerializer
)


@swagger_auto_schema(
    method='get',
    operation_description="Get dashboard statistics including patient counts, staff numbers, and appointments",
    responses={
        200: openapi.Response(
            description="Dashboard statistics retrieved successfully",
            schema=DashboardStatsSerializer(),
            examples={
                'application/json': {
                    'patients_today': 145,
                    'patients_yesterday': 127,
                    'patients_change_percentage': 18.0,
                    'active_staff': 89,
                    'total_staff': 120,
                    'staff_breakdown': {
                        'DOCTOR': 25,
                        'NURSE': 40,
                        'ADMIN': 4,
                        'PHARMACY': 8,
                        'LAB': 7,
                        'RECEPTION': 3,
                        'FINANCE': 2
                    },
                    'appointments_today': 23,
                    'scheduled_appointments': 15,
                    'walk_in_appointments': 8
                }
            }
        ),
        401: 'Unauthorized - Admin access required',
        403: 'Forbidden - Insufficient permissions'
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    """
    Retrieve comprehensive dashboard statistics for admin portal.
    
    Returns patient counts, staff statistics, and appointment data
    that powers the main dashboard cards and metrics.
    """
    # Check admin permissions
    if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    
    # Get or create today's stats
    today_stats, created = DashboardStats.objects.get_or_create(
        date=today,
        defaults={
            'patients_count': 145,  # This will be calculated from actual patient model later
            'appointments_count': 23,
            'scheduled_appointments': 15,
            'walk_in_appointments': 8,
            'revenue_amount': Decimal('24500.00')
        }
    )
    
    # Get yesterday's stats for comparison
    yesterday_stats = DashboardStats.objects.filter(date=yesterday).first()
    yesterday_patients = yesterday_stats.patients_count if yesterday_stats else 127
    
    # Calculate percentage change
    if yesterday_patients > 0:
        change_percentage = ((today_stats.patients_count - yesterday_patients) / yesterday_patients) * 100
    else:
        change_percentage = 0.0
    
    # Get staff statistics
    total_staff = User.objects.count()
    active_staff = User.objects.filter(is_active=True).count()
    
    # Staff breakdown by role
    staff_breakdown = User.objects.filter(is_active=True).values('role').annotate(
        count=Count('role')
    )
    staff_breakdown_dict = {item['role']: item['count'] for item in staff_breakdown}
    
    # Prepare response data
    data = {
        'patients_today': today_stats.patients_count,
        'patients_yesterday': yesterday_patients,
        'patients_change_percentage': round(change_percentage, 1),
        'active_staff': active_staff,
        'total_staff': total_staff,
        'staff_breakdown': staff_breakdown_dict,
        'appointments_today': today_stats.appointments_count,
        'scheduled_appointments': today_stats.scheduled_appointments,
        'walk_in_appointments': today_stats.walk_in_appointments,
    }
    
    serializer = DashboardStatsSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='get',
    operation_description="Get daily revenue data for the revenue chart (last 7 days)",
    responses={
        200: openapi.Response(
            description="Revenue data retrieved successfully",
            schema=RevenueDataSerializer(many=True),
            examples={
                'application/json': [
                    {'day': 'Mon', 'amount': '15000.00', 'date': '2025-08-26'},
                    {'day': 'Tue', 'amount': '18000.00', 'date': '2025-08-27'},
                    {'day': 'Wed', 'amount': '22000.00', 'date': '2025-08-28'},
                    {'day': 'Thu', 'amount': '19500.00', 'date': '2025-08-29'},
                    {'day': 'Fri', 'amount': '25000.00', 'date': '2025-08-30'},
                    {'day': 'Sat', 'amount': '21000.00', 'date': '2025-08-31'},
                    {'day': 'Sun', 'amount': '24500.00', 'date': '2025-09-01'}
                ]
            }
        ),
        401: 'Unauthorized - Admin access required',
        403: 'Forbidden - Insufficient permissions'
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_chart_view(request):
    """
    Retrieve daily revenue data for the last 7 days for the revenue chart.
    
    Returns revenue amounts with corresponding days and dates.
    """
    # Check admin permissions
    if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    today = timezone.now().date()
    revenue_data = []
    
    # Get last 7 days of revenue data
    for i in range(6, -1, -1):  # 6 days ago to today
        date = today - timedelta(days=i)
        day_name = date.strftime('%a')  # Mon, Tue, etc.
        
        # Get stats for this date or use default values
        day_stats = DashboardStats.objects.filter(date=date).first()
        amount = day_stats.revenue_amount if day_stats else Decimal('0.00')
        
        # Generate realistic revenue data if no real data exists
        if not day_stats:
            base_amount = 20000
            variation = (i * 1500) + (hash(str(date)) % 5000)
            amount = Decimal(str(base_amount + variation))
        
        revenue_data.append({
            'day': day_name,
            'amount': amount,
            'date': date
        })
    
    serializer = RevenueDataSerializer(revenue_data, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='get',
    operation_description="Get appointment breakdown data for the donut chart",
    responses={
        200: openapi.Response(
            description="Appointment breakdown retrieved successfully",
            schema=AppointmentBreakdownSerializer(),
            examples={
                'application/json': {
                    'total': 23,
                    'scheduled': 15,
                    'walk_in': 8,
                    'breakdown_percentage': {
                        'scheduled': 65.2,
                        'walk_in': 34.8
                    }
                }
            }
        ),
        401: 'Unauthorized - Admin access required',
        403: 'Forbidden - Insufficient permissions'
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_breakdown_view(request):
    """
    Retrieve appointment breakdown for today's donut chart.
    
    Returns scheduled vs walk-in appointment counts and percentages.
    """
    # Check admin permissions
    if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    today = timezone.now().date()
    today_stats = DashboardStats.objects.filter(date=today).first()
    
    if today_stats:
        scheduled = today_stats.scheduled_appointments
        walk_in = today_stats.walk_in_appointments
        total = today_stats.appointments_count
    else:
        # Default values if no data exists
        scheduled = 15
        walk_in = 8
        total = 23
    
    # Calculate percentages
    scheduled_percentage = (scheduled / total * 100) if total > 0 else 0
    walk_in_percentage = (walk_in / total * 100) if total > 0 else 0
    
    data = {
        'total': total,
        'scheduled': scheduled,
        'walk_in': walk_in,
        'breakdown_percentage': {
            'scheduled': round(scheduled_percentage, 1),
            'walk_in': round(walk_in_percentage, 1)
        }
    }
    
    serializer = AppointmentBreakdownSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='get',
    operation_description="Get pharmacy inventory alerts (critical and low stock items)",
    responses={
        200: openapi.Response(
            description="Pharmacy alerts retrieved successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'critical': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_OBJECT, ref='#/components/schemas/PharmacyAlert')
                    ),
                    'low_stock': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_OBJECT, ref='#/components/schemas/PharmacyAlert')
                    ),
                    'count': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'critical': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'low_stock': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'total': openapi.Schema(type=openapi.TYPE_INTEGER)
                        }
                    )
                }
            )
        ),
        401: 'Unauthorized - Admin access required',
        403: 'Forbidden - Insufficient permissions'
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pharmacy_alerts_view(request):
    """
    Retrieve pharmacy inventory alerts for the dashboard.
    
    Returns critical and low stock medication alerts.
    """
    # Check admin permissions
    if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get active alerts
    critical_alerts = PharmacyAlert.objects.filter(
        alert_type='critical', 
        is_active=True
    ).order_by('-created_at')[:5]  # Limit to 5 most recent
    
    low_stock_alerts = PharmacyAlert.objects.filter(
        alert_type='low_stock', 
        is_active=True
    ).order_by('-created_at')[:5]  # Limit to 5 most recent
    
    # Create default alerts if none exist (for demo purposes)
    if not critical_alerts.exists() and not low_stock_alerts.exists():
        # Create sample alerts
        PharmacyAlert.objects.get_or_create(
            medication_name='Amoxicillin',
            defaults={
                'current_stock': 8,
                'threshold': 10,
                'alert_type': 'critical'
            }
        )
        PharmacyAlert.objects.get_or_create(
            medication_name='Insulin',
            defaults={
                'current_stock': 5,
                'threshold': 10,
                'alert_type': 'critical'
            }
        )
        PharmacyAlert.objects.get_or_create(
            medication_name='Paracetamol',
            defaults={
                'current_stock': 15,
                'threshold': 20,
                'alert_type': 'low_stock'
            }
        )
        PharmacyAlert.objects.get_or_create(
            medication_name='Bandages',
            defaults={
                'current_stock': 30,
                'threshold': 50,
                'alert_type': 'low_stock'
            }
        )
        
        # Refetch after creation
        critical_alerts = PharmacyAlert.objects.filter(alert_type='critical', is_active=True)
        low_stock_alerts = PharmacyAlert.objects.filter(alert_type='low_stock', is_active=True)
    
    data = {
        'critical': PharmacyAlertSerializer(critical_alerts, many=True).data,
        'low_stock': PharmacyAlertSerializer(low_stock_alerts, many=True).data,
        'count': {
            'critical': critical_alerts.count(),
            'low_stock': low_stock_alerts.count(),
            'total': critical_alerts.count() + low_stock_alerts.count()
        }
    }
    
    return Response(data, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='get',
    operation_description="Get recent system activities for the activity feed",
    manual_parameters=[
        openapi.Parameter(
            'limit',
            openapi.IN_QUERY,
            description="Number of activities to return (default: 10, max: 50)",
            type=openapi.TYPE_INTEGER,
            default=10
        )
    ],
    responses={
        200: openapi.Response(
            description="Activities retrieved successfully",
            schema=SystemActivitySerializer(many=True)
        ),
        401: 'Unauthorized - Admin access required',
        403: 'Forbidden - Insufficient permissions'
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activities_feed_view(request):
    """
    Retrieve recent system activities for the dashboard feed.
    
    Returns a chronological list of recent system activities.
    """
    # Check admin permissions
    if not hasattr(request.user, 'role') or request.user.role != 'ADMIN':
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get limit parameter with validation
    limit = request.GET.get('limit', 10)
    try:
        limit = int(limit)
        limit = min(limit, 50)  # Max 50 activities
        limit = max(limit, 1)   # Min 1 activity
    except (ValueError, TypeError):
        limit = 10
    
    activities = SystemActivity.objects.select_related('user')[:limit]
    
    # Create sample activities if none exist
    if not activities.exists():
        now = timezone.now()
        sample_activities = [
            {
                'type': 'patient_admission',
                'message': 'Patient John Doe admitted to Ward 3A',
                'timestamp': now - timedelta(minutes=10)
            },
            {
                'type': 'staff_update',
                'message': 'Dr. Jane Smith updated patient record for #P203005',
                'timestamp': now - timedelta(minutes=30)
            },
            {
                'type': 'medication_added',
                'message': 'New medication "XYZ Drug" added to inventory',
                'timestamp': now - timedelta(hours=1)
            },
            {
                'type': 'staff_clockin',
                'message': 'Nurse Alice Johnson clocked in for shift',
                'timestamp': now - timedelta(hours=2)
            },
            {
                'type': 'system_backup',
                'message': 'System backup completed successfully',
                'timestamp': now - timedelta(hours=4)
            }
        ]
        
        for activity_data in sample_activities:
            SystemActivity.objects.get_or_create(
                type=activity_data['type'],
                message=activity_data['message'],
                timestamp=activity_data['timestamp']
            )
        
        # Refetch activities
        activities = SystemActivity.objects.select_related('user')[:limit]
    
    serializer = SystemActivitySerializer(activities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
