from rest_framework import serializers
from .models import SystemActivity, PharmacyAlert, DashboardStats, SystemStatus
from auth_portal.models import User


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    patients_today = serializers.IntegerField()
    patients_yesterday = serializers.IntegerField()
    patients_change_percentage = serializers.FloatField()
    
    active_staff = serializers.IntegerField()
    total_staff = serializers.IntegerField()
    staff_breakdown = serializers.DictField()
    
    appointments_today = serializers.IntegerField()
    scheduled_appointments = serializers.IntegerField()
    walk_in_appointments = serializers.IntegerField()


class RevenueDataSerializer(serializers.Serializer):
    """Serializer for daily revenue chart data"""
    day = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    date = serializers.DateField()


class AppointmentBreakdownSerializer(serializers.Serializer):
    """Serializer for donut chart appointment data"""
    total = serializers.IntegerField()
    scheduled = serializers.IntegerField()
    walk_in = serializers.IntegerField()
    breakdown_percentage = serializers.DictField()


class PharmacyAlertSerializer(serializers.ModelSerializer):
    """Serializer for pharmacy inventory alerts"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    days_until_expiry = serializers.SerializerMethodField()
    
    class Meta:
        model = PharmacyAlert
        fields = [
            'id', 'medication_name', 'current_stock', 'threshold', 
            'alert_type', 'alert_type_display', 'expiry_date', 
            'days_until_expiry', 'created_at'
        ]
    
    def get_days_until_expiry(self, obj):
        if obj.expiry_date:
            from django.utils import timezone
            delta = obj.expiry_date - timezone.now().date()
            return delta.days
        return None


class SystemActivitySerializer(serializers.ModelSerializer):
    """Serializer for system activities feed"""
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemActivity
        fields = [
            'id', 'type', 'type_display', 'message', 
            'user_name', 'timestamp', 'time_ago', 'metadata'
        ]
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.timestamp
        
        if delta.days > 0:
            return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
        elif delta.seconds > 3600:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif delta.seconds > 60:
            minutes = delta.seconds // 60
            return f"{minutes} min ago"
        else:
            return "Just now"


class SystemStatusSerializer(serializers.ModelSerializer):
    """Serializer for system status monitoring"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_class = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemStatus
        fields = [
            'id', 'service_name', 'status', 'status_display', 
            'status_class', 'last_checked', 'response_time', 'uptime_percentage'
        ]
    
    def get_status_class(self, obj):
        """Return CSS class for status indicator"""
        status_classes = {
            'online': 'success',
            'offline': 'danger',
            'warning': 'warning',
            'maintenance': 'info'
        }
        return status_classes.get(obj.status, 'secondary')
