from django.contrib import admin
from .models import Medication, PrescriptionQueue, DispenseRecord, StockMovement


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    """
    Admin interface for medication inventory management.
    """
    
    list_display = [
        'name', 'generic_name', 'category', 'current_stock', 
        'reorder_level', 'unit_price', 'is_active', 'is_low_stock'
    ]
    
    list_filter = [
        'category', 'is_active', 'requires_prescription', 'manufacturer'
    ]
    
    search_fields = [
        'name', 'generic_name', 'barcode', 'qr_code', 'manufacturer'
    ]
    
    readonly_fields = ['id', 'created_at', 'updated_at', 'is_low_stock', 'is_available']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'generic_name', 'manufacturer', 'category')
        }),
        ('Identification Codes', {
            'fields': ('barcode', 'qr_code', 'alternative_codes')
        }),
        ('Inventory', {
            'fields': ('current_stock', 'reorder_level', 'unit_price', 'supplier')
        }),
        ('Settings', {
            'fields': ('requires_prescription', 'is_active')
        }),
        ('Status', {
            'fields': ('is_low_stock', 'is_available', 'last_restocked')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(PrescriptionQueue)
class PrescriptionQueueAdmin(admin.ModelAdmin):
    """
    Admin interface for prescription queue management.
    """
    
    list_display = [
        'patient_id', 'patient_name', 'prescribed_by', 'status',
        'priority', 'total_amount', 'created_at'
    ]
    
    list_filter = [
        'status', 'priority', 'created_at', 'processed_by'
    ]
    
    search_fields = [
        'patient_id', 'patient_name', 'prescribed_by', 'prescription_id'
    ]
    
    readonly_fields = [
        'id', 'created_at', 'started_processing_at', 
        'completed_at', 'dispensed_at'
    ]


@admin.register(DispenseRecord)
class DispenseRecordAdmin(admin.ModelAdmin):
    """
    Admin interface for dispensing audit trail.
    """
    
    list_display = [
        'prescription_queue', 'medication', 'quantity_scanned',
        'unit_price', 'line_total', 'running_total', 'scanned_by', 'scanned_at'
    ]
    
    list_filter = [
        'scanned_at', 'medication', 'scanned_by'
    ]
    
    search_fields = [
        'scanned_code', 'prescription_queue__patient_id', 'medication__name'
    ]
    
    readonly_fields = ['id', 'line_total', 'scanned_at']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    """
    Admin interface for stock movement audit trail.
    """
    
    list_display = [
        'medication', 'movement_type', 'quantity', 'previous_stock',
        'new_stock', 'performed_by', 'timestamp'
    ]
    
    list_filter = [
        'movement_type', 'timestamp', 'performed_by'
    ]
    
    search_fields = [
        'medication__name', 'reference_id', 'notes'
    ]
    
    readonly_fields = ['id', 'timestamp']
