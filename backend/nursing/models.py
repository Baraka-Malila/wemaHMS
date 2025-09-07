from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class NursingService(models.Model):
    """
    Record of nursing services provided to patients.
    Covers ward care, injections, monitoring, etc.
    """
    
    SERVICE_TYPE_CHOICES = [
        ('INJECTION', 'Injection/IV'),
        ('WOUND_CARE', 'Wound Dressing'),
        ('VITAL_SIGNS', 'Vital Signs Monitoring'),
        ('MEDICATION_ADMIN', 'Medication Administration'),
        ('PATIENT_CARE', 'General Patient Care'),
        ('WARD_ROUND', 'Ward Round Assistance'),
        ('EMERGENCY_CARE', 'Emergency Nursing Care'),
    ]
    
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Patient information
    patient_id = models.CharField(
        max_length=20,
        help_text='Patient ID (PAT123, etc.)'
    )
    patient_name = models.CharField(
        max_length=100,
        help_text='Patient name for quick reference'
    )
    
    # Service details
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_TYPE_CHOICES
    )
    service_description = models.TextField(
        help_text='Detailed description of service provided'
    )
    
    # Clinical details
    vital_signs = models.JSONField(
        blank=True,
        null=True,
        help_text='BP, Temperature, Pulse, etc. if applicable'
    )
    medications_given = models.TextField(
        blank=True,
        null=True,
        help_text='Medications administered'
    )
    
    # Service status
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='SCHEDULED'
    )
    priority = models.CharField(
        max_length=10,
        choices=[('LOW', 'Low'), ('NORMAL', 'Normal'), ('HIGH', 'High'), ('URGENT', 'Urgent')],
        default='NORMAL'
    )
    
    # Staff tracking
    assigned_nurse = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='nursing_services_assigned',
        limit_choices_to={'role': 'NURSE'}
    )
    supervised_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='nursing_services_supervised',
        blank=True,
        null=True,
        help_text='Senior nurse or doctor supervision'
    )
    
    # Timestamps
    scheduled_at = models.DateTimeField(
        help_text='When service was scheduled'
    )
    started_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text='When service actually started'
    )
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text='When service was completed'
    )
    
    # Notes and observations
    nurse_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Nurse observations and notes'
    )
    patient_response = models.TextField(
        blank=True,
        null=True,
        help_text='How patient responded to service'
    )
    
    # Billing reference (will link to finance app)
    billed_to_finance = models.BooleanField(
        default=False,
        help_text='Whether this service has been billed'
    )
    
    class Meta:
        db_table = 'nursing_services'
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['service_type', '-scheduled_at']),
            models.Index(fields=['status', '-scheduled_at']),
            models.Index(fields=['assigned_nurse', '-scheduled_at']),
        ]
    
    def __str__(self):
        return f"{self.service_type} for {self.patient_id} by {self.assigned_nurse.get_full_name()}"
    
    @property
    def service_duration_minutes(self):
        """Calculate how long the service took"""
        if self.started_at and self.completed_at:
            delta = self.completed_at - self.started_at
            return int(delta.total_seconds() / 60)
        return None
    
    def save(self, *args, **kwargs):
        # Auto-set timestamps based on status
        if self.status == 'IN_PROGRESS' and not self.started_at:
            self.started_at = timezone.now()
        elif self.status == 'COMPLETED' and not self.completed_at:
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)


class WardAssignment(models.Model):
    """
    Track patient ward assignments and bed management.
    Simple model for bed allocation and nursing assignments.
    """
    
    WARD_TYPE_CHOICES = [
        ('GENERAL', 'General Ward'),
        ('PRIVATE', 'Private Room'),
        ('ICU', 'Intensive Care Unit'),
        ('MATERNITY', 'Maternity Ward'),
        ('PEDIATRIC', 'Pediatric Ward'),
        ('SURGERY', 'Surgical Ward'),
    ]
    
    STATUS_CHOICES = [
        ('ADMITTED', 'Patient Admitted'),
        ('DISCHARGED', 'Patient Discharged'),
        ('TRANSFERRED', 'Transferred to Another Ward'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Patient information
    patient_id = models.CharField(
        max_length=20,
        help_text='Patient ID (PAT123, etc.)'
    )
    patient_name = models.CharField(
        max_length=100,
        help_text='Patient name'
    )
    
    # Ward details
    ward_type = models.CharField(
        max_length=15,
        choices=WARD_TYPE_CHOICES
    )
    bed_number = models.CharField(
        max_length=10,
        help_text='Bed identifier (A1, B2, etc.)'
    )
    
    # Assignment details
    admission_date = models.DateTimeField()
    discharge_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='ADMITTED'
    )
    
    # Staff assignments
    primary_nurse = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='ward_assignments_primary',
        limit_choices_to={'role': 'NURSE'}
    )
    attending_doctor = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='ward_assignments_doctor',
        limit_choices_to={'role': 'DOCTOR'}
    )
    
    # Clinical notes
    admission_notes = models.TextField(
        help_text='Notes from admission'
    )
    discharge_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Notes from discharge'
    )
    
    # Billing tracking
    daily_ward_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Daily charge for this ward type'
    )
    
    class Meta:
        db_table = 'ward_assignments'
        ordering = ['-admission_date']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['ward_type', 'status']),
            models.Index(fields=['bed_number']),
        ]
    
    def __str__(self):
        return f"{self.patient_id} in {self.ward_type} bed {self.bed_number}"
    
    @property
    def days_admitted(self):
        """Calculate number of days in ward"""
        end_date = self.discharge_date or timezone.now()
        delta = end_date.date() - self.admission_date.date()
        return delta.days + 1  # Include admission day
    
    @property
    def total_ward_charges(self):
        """Calculate total ward charges based on days"""
        return self.daily_ward_fee * self.days_admitted
