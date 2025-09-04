from django.contrib import admin
from .models import Patient, PatientStatusHistory, PatientNote


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = [
        'patient_id', 'full_name', 'phone_number', 'gender', 'age',
        'current_status', 'file_fee_paid', 'created_at'
    ]
    list_filter = [
        'gender', 'current_status', 'file_fee_paid', 'blood_group',
        'created_at', 'updated_at'
    ]
    search_fields = ['patient_id', 'full_name', 'phone_number']
    readonly_fields = [
        'id', 'patient_id', 'age', 'bmi', 'is_new_patient',
        'created_at', 'updated_at', 'file_fee_payment_date'
    ]
    
    fieldsets = (
        ('Patient Information', {
            'fields': ('patient_id', 'full_name', 'phone_number', 'gender', 'date_of_birth')
        }),
        ('Contact Details', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'address', 'tribe'),
            'classes': ('collapse',)
        }),
        ('Medical Information', {
            'fields': ('weight', 'height', 'blood_group', 'allergies', 'chronic_conditions'),
            'classes': ('collapse',)
        }),
        ('Administrative', {
            'fields': ('file_fee_paid', 'file_fee_amount', 'file_fee_payment_date')
        }),
        ('Status Tracking', {
            'fields': ('current_status', 'current_location')
        }),
        ('Audit Information', {
            'fields': ('created_by', 'last_updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Calculated Fields', {
            'fields': ('age', 'bmi', 'is_new_patient'),
            'classes': ('collapse',)
        }),
    )
    
    def age(self, obj):
        return obj.age
    age.short_description = 'Age'


@admin.register(PatientStatusHistory)
class PatientStatusHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'previous_status', 'new_status', 'new_location',
        'changed_by', 'changed_at'
    ]
    list_filter = ['previous_status', 'new_status', 'changed_at']
    search_fields = ['patient__patient_id', 'patient__full_name']
    readonly_fields = ['changed_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('patient', 'changed_by')


@admin.register(PatientNote)
class PatientNoteAdmin(admin.ModelAdmin):
    list_display = ['patient', 'note_type', 'created_by', 'created_at']
    list_filter = ['note_type', 'created_at']
    search_fields = ['patient__patient_id', 'patient__full_name', 'note']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('patient', 'created_by')
