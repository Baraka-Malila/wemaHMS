from django.db import models
from django.utils import timezone
from auth_portal.models import User


class SystemActivity(models.Model):
    """Track system activities for the admin dashboard"""
    ACTIVITY_TYPES = [
        ('patient_admission', 'Patient Admission'),
        ('staff_update', 'Staff Update'),
        ('medication_added', 'Medication Added'),
        ('user_approval', 'User Approval'),
        ('system_backup', 'System Backup'),
        ('staff_clockin', 'Staff Clock In'),
        ('staff_clockout', 'Staff Clock Out'),
    ]
    
    type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    message = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict, blank=True)  # Additional data
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'System Activities'
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.message[:50]}"


class PharmacyAlert(models.Model):
    """Track pharmacy inventory alerts for the dashboard"""
    ALERT_TYPES = [
        ('critical', 'Critical'),
        ('low_stock', 'Low Stock'),
        ('expired', 'Expired'),
        ('expiring_soon', 'Expiring Soon'),
    ]
    
    medication_name = models.CharField(max_length=100)
    current_stock = models.IntegerField()
    threshold = models.IntegerField()
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    expiry_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['alert_type', '-created_at']
    
    def __str__(self):
        return f"{self.medication_name} - {self.get_alert_type_display()}"


class DashboardStats(models.Model):
    """Cached dashboard statistics for performance"""
    date = models.DateField(unique=True)
    patients_count = models.IntegerField(default=0)
    appointments_count = models.IntegerField(default=0)
    revenue_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    active_staff_count = models.IntegerField(default=0)
    
    # Appointment breakdown for donut chart
    scheduled_appointments = models.IntegerField(default=0)
    walk_in_appointments = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Stats for {self.date}"


class SystemStatus(models.Model):
    """Track system and equipment status"""
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('warning', 'Warning'),
        ('maintenance', 'Maintenance'),
    ]
    
    service_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    last_checked = models.DateTimeField(default=timezone.now)
    response_time = models.FloatField(null=True, blank=True)  # in milliseconds
    uptime_percentage = models.FloatField(default=100.0)
    
    class Meta:
        verbose_name_plural = 'System Status'
        unique_together = ['service_name']
    
    def __str__(self):
        return f"{self.service_name} - {self.get_status_display()}"
