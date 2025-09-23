from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Consultation(models.Model):
    """
    Medical consultation record for each patient visit to doctor.
    Links to Patient via patients app for shared access across all portals.
    """
    
    CONSULTATION_STATUS_CHOICES = [
        ('IN_PROGRESS', 'Consultation In Progress'),
        ('COMPLETED', 'Consultation Completed'),
        ('FOLLOW_UP_REQUIRED', 'Follow-up Required'),
        ('REFERRED', 'Referred to Specialist'),
    ]
    
    PRIORITY_CHOICES = [
        ('NORMAL', 'Normal'),
        ('URGENT', 'Urgent'),
        ('EMERGENCY', 'Emergency'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to patient (from patients app)
    patient_id = models.CharField(
        max_length=20,
        help_text='Patient ID from patients app (PAT123, etc.)'
    )
    patient_name = models.CharField(
        max_length=100,
        help_text='Patient name cached for performance'
    )
    
    # Doctor and consultation details
    doctor = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='consultations',
        limit_choices_to={'role': 'DOCTOR'}
    )
    
    # Consultation information
    chief_complaint = models.TextField(help_text='Main reason for visit')
    symptoms = models.TextField(
        blank=True,
        default='',
        help_text='Patient symptoms and history'
    )
    examination_findings = models.TextField(
        blank=True,
        null=True,
        help_text='Physical examination results'
    )
    diagnosis = models.TextField(
        blank=True,
        default='',
        help_text='Medical diagnosis'
    )
    treatment_plan = models.TextField(
        blank=True,
        default='',
        help_text='Treatment recommendations'
    )
    
    # Follow-up and priority
    follow_up_date = models.DateField(blank=True, null=True)
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='NORMAL'
    )
    status = models.CharField(
        max_length=20,
        choices=CONSULTATION_STATUS_CHOICES,
        default='IN_PROGRESS'
    )
    
    # Vital signs (optional)
    temperature = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        blank=True,
        null=True,
        validators=[MinValueValidator(30.0), MaxValueValidator(50.0)],
        help_text='Temperature in Celsius'
    )
    blood_pressure_systolic = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(60), MaxValueValidator(300)]
    )
    blood_pressure_diastolic = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(40), MaxValueValidator(200)]
    )
    heart_rate = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(30), MaxValueValidator(200)],
        help_text='Heart rate per minute'
    )
    
    # Timestamps
    consultation_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Notes and additional info
    doctor_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Private notes for doctor'
    )
    
    class Meta:
        db_table = 'consultations'
        ordering = ['-consultation_date']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['doctor', '-consultation_date']),
            models.Index(fields=['status', '-consultation_date']),
            models.Index(fields=['consultation_date']),
        ]
    
    def __str__(self):
        return f"Consultation {self.patient_id} - Dr. {self.doctor.full_name} ({self.consultation_date.date()})"
    
    @property
    def duration_minutes(self):
        """Calculate consultation duration in minutes"""
        if self.completed_at:
            delta = self.completed_at - self.consultation_date
            return int(delta.total_seconds() / 60)
        return None
    
    @property
    def blood_pressure(self):
        """Format blood pressure as string"""
        if self.blood_pressure_systolic and self.blood_pressure_diastolic:
            return f"{self.blood_pressure_systolic}/{self.blood_pressure_diastolic}"
        return None
    
    def save(self, *args, **kwargs):
        # Set completed_at when status changes to completed
        if self.status == 'COMPLETED' and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)


class LabTestRequest(models.Model):
    """
    Lab test requests created by doctors during consultations.
    Links to consultation and will be processed by lab portal.
    """
    
    TEST_TYPE_CHOICES = [
        ('BLOOD_TEST', 'Blood Test'),
        ('URINE_TEST', 'Urine Test'),
        ('STOOL_TEST', 'Stool Test'),
        ('XRAY', 'X-Ray'),
        ('ULTRASOUND', 'Ultrasound'),
        ('ECG', 'ECG'),
        ('BLOOD_SUGAR', 'Blood Sugar Test'),
        ('MALARIA_TEST', 'Malaria Test'),
        ('HIV_TEST', 'HIV Test'),
        ('OTHER', 'Other Test'),
    ]
    
    URGENCY_CHOICES = [
        ('NORMAL', 'Normal'),
        ('URGENT', 'Urgent'),
        ('STAT', 'STAT (Immediate)'),
    ]
    
    STATUS_CHOICES = [
        ('REQUESTED', 'Test Requested'),
        ('IN_PROGRESS', 'Test In Progress'),
        ('COMPLETED', 'Test Completed'),
        ('CANCELLED', 'Test Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='lab_requests'
    )
    
    # Test details
    test_type = models.CharField(max_length=20, choices=TEST_TYPE_CHOICES)
    test_description = models.TextField(help_text='Specific test requirements')
    urgency = models.CharField(
        max_length=10,
        choices=URGENCY_CHOICES,
        default='NORMAL'
    )
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='REQUESTED'
    )
    
    # Additional instructions
    clinical_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Clinical information for lab technician'
    )
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Staff tracking
    requested_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='lab_requests_made'
    )
    processed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='lab_requests_processed',
        blank=True,
        null=True
    )
    
    class Meta:
        db_table = 'lab_test_requests'
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['consultation']),
            models.Index(fields=['status', '-requested_at']),
            models.Index(fields=['urgency', '-requested_at']),
        ]
    
    def __str__(self):
        return f"{self.test_type} for {self.consultation.patient_id} ({self.status})"


class Prescription(models.Model):
    """
    Medication prescriptions created by doctors.
    Will be processed by pharmacy portal for dispensing.
    """
    
    STATUS_CHOICES = [
        ('PRESCRIBED', 'Prescribed'),
        ('DISPENSED', 'Dispensed'),
        ('PARTIALLY_DISPENSED', 'Partially Dispensed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    FREQUENCY_CHOICES = [
        ('ONCE_DAILY', 'Once Daily'),
        ('TWICE_DAILY', 'Twice Daily'),
        ('THREE_TIMES_DAILY', 'Three Times Daily'),
        ('FOUR_TIMES_DAILY', 'Four Times Daily'),
        ('AS_NEEDED', 'As Needed'),
        ('CUSTOM', 'Custom Schedule'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='prescriptions'
    )
    
    # Medication details
    medication_name = models.CharField(max_length=200)
    generic_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text='Generic medication name'
    )
    strength = models.CharField(
        max_length=50,
        help_text='e.g., 500mg, 250ml'
    )
    dosage_form = models.CharField(
        max_length=50,
        help_text='e.g., tablet, capsule, syrup'
    )
    
    # Prescription instructions
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    custom_frequency = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Custom frequency if not in standard choices'
    )
    dosage_instructions = models.TextField(
        help_text='How to take the medication'
    )
    duration = models.CharField(
        max_length=50,
        help_text='e.g., 7 days, 2 weeks'
    )
    quantity_prescribed = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text='Total quantity prescribed'
    )
    
    # Dispensing tracking
    quantity_dispensed = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PRESCRIBED'
    )
    
    # Additional instructions
    special_instructions = models.TextField(
        blank=True,
        null=True,
        help_text='Special instructions for patient or pharmacist'
    )
    
    # Timestamps
    prescribed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    dispensed_at = models.DateTimeField(blank=True, null=True)
    
    # Staff tracking
    prescribed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='prescriptions_made'
    )
    dispensed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='prescriptions_dispensed',
        blank=True,
        null=True
    )
    
    class Meta:
        db_table = 'prescriptions'
        ordering = ['-prescribed_at']
        indexes = [
            models.Index(fields=['consultation']),
            models.Index(fields=['status', '-prescribed_at']),
            models.Index(fields=['medication_name']),
        ]
    
    def __str__(self):
        return f"{self.medication_name} for {self.consultation.patient_id}"
    
    @property
    def remaining_quantity(self):
        """Calculate remaining quantity to be dispensed"""
        return self.quantity_prescribed - self.quantity_dispensed
    
    @property
    def frequency_display(self):
        """Get human-readable frequency"""
        if self.frequency == 'CUSTOM' and self.custom_frequency:
            return self.custom_frequency
        return self.get_frequency_display()
