from django.contrib import admin
from .models import LabTestResult, LabOrder


@admin.register(LabTestResult)
class LabTestResultAdmin(admin.ModelAdmin):
    """
    Admin interface for Lab Test Results.
    Provides comprehensive view and filtering for lab management.
    """
    
    list_display = [
        'patient_id', 'patient_name', 'test_type', 'result_status',
        'urgent_flag', 'processed_by', 'test_completed_at', 'doctor_notified'
    ]
    
    list_filter = [
        'result_status', 'urgent_flag', 'test_type', 'doctor_notified',
        'test_completed_at', 'processed_by'
    ]
    
    search_fields = [
        'patient_id', 'patient_name', 'test_type', 'lab_request_id'
    ]
    
    readonly_fields = [
        'id', 'test_started_at', 'processing_time_minutes'
    ]
    
    fieldsets = (
        ('Test Information', {
            'fields': ('lab_request_id', 'patient_id', 'patient_name', 'test_type', 'test_description')
        }),
        ('Results', {
            'fields': ('result_summary', 'result_details', 'normal_range', 'result_status')
        }),
        ('Status & Priority', {
            'fields': ('urgent_flag', 'technician_notes', 'result_image')
        }),
        ('Processing Info', {
            'fields': ('processed_by', 'test_started_at', 'test_completed_at', 'processing_time_minutes')
        }),
        ('Doctor Communication', {
            'fields': ('doctor_notified', 'doctor_viewed')
        }),
    )
    
    def processing_time_minutes(self, obj):
        """Display processing time in admin"""
        return obj.processing_time_minutes
    processing_time_minutes.short_description = 'Processing Time (min)'


@admin.register(LabOrder)
class LabOrderAdmin(admin.ModelAdmin):
    """
    Admin interface for Lab Orders.
    Manages supply orders from lab to pharmacy.
    """
    
    list_display = [
        'order_title', 'priority', 'status', 'requested_by',
        'estimated_cost', 'created_at', 'submitted_at'
    ]
    
    list_filter = [
        'status', 'priority', 'requested_by', 'created_at'
    ]
    
    search_fields = [
        'order_title', 'items_list', 'justification'
    ]
    
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'submitted_at', 'approved_at'
    ]
    
    fieldsets = (
        ('Order Details', {
            'fields': ('order_title', 'items_list', 'justification', 'estimated_cost')
        }),
        ('Status & Priority', {
            'fields': ('priority', 'status')
        }),
        ('Staff Tracking', {
            'fields': ('requested_by', 'approved_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'submitted_at', 'approved_at')
        }),
    )
