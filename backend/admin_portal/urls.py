from django.urls import path
from . import views

app_name = 'admin_portal'

urlpatterns = [
    # Dashboard APIs
    path('dashboard/stats/', views.dashboard_stats_view, name='dashboard_stats'),
    path('dashboard/revenue/', views.revenue_chart_view, name='revenue_chart'),
    path('dashboard/appointments/', views.appointment_breakdown_view, name='appointment_breakdown'),
    
    # Pharmacy & System Monitoring
    path('pharmacy/alerts/', views.pharmacy_alerts_view, name='pharmacy_alerts'),
    path('activities/', views.activities_feed_view, name='activities_feed'),
]
