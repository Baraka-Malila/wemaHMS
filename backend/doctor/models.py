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
    respiratory_rate = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(5), MaxValueValidator(60)],
        help_text='Respiratory rate (breaths per minute)'
    )

    # Private doctor notes
    doctor_notes = models.TextField(
        blank=True,
        default='',
        help_text='Private notes for doctor reference only'
    )

    # Timestamps
    consultation_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Clinical notes matching hospital form
    clinical_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Free-form clinical notes as in hospital form'
    )
    possible_diagnosis = models.TextField(
        blank=True,
        null=True,
        help_text='Possible/differential diagnosis'
    )
    medication_plan = models.TextField(
        blank=True,
        null=True,
        help_text='Medication plan and prescriptions'
    )

    # Payment tracking
    consultation_fee_required = models.BooleanField(default=True)
    consultation_fee_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=5000.00,
        help_text='Consultation fee in TZS'
    )
    consultation_fee_paid = models.BooleanField(default=False)
    consultation_fee_payment_date = models.DateTimeField(blank=True, null=True)
    consultation_fee_paid_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='consultation_payments',
        null=True,
        blank=True,
        help_text='Staff who processed payment'
    )

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

        # Set payment date when fee is marked as paid
        if self.consultation_fee_paid and not self.consultation_fee_payment_date:
            self.consultation_fee_payment_date = timezone.now()

        super().save(*args, **kwargs)

    @property
    def can_proceed_to_completion(self):
        """Check if consultation can be completed (payment made)"""
        return not self.consultation_fee_required or self.consultation_fee_paid

    @property
    def payment_status(self):
        """Get payment status string"""
        if not self.consultation_fee_required:
            return "NOT_REQUIRED"
        return "PAID" if self.consultation_fee_paid else "UNPAID"


class LabTestRequest(models.Model):
    """
    Comprehensive lab test requests matching hospital lab form.
    Links to consultation and tracks all possible tests with results.
    """

    STATUS_CHOICES = [
        ('PENDING_PAYMENT', 'Pending Payment'),
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

    # Basic patient info (cached for lab use)
    patient_id = models.CharField(max_length=20, default='')
    patient_name = models.CharField(max_length=100, default='')
    patient_age = models.IntegerField(default=0)
    patient_sex = models.CharField(max_length=10, default='')
    patient_address = models.TextField(blank=True, null=True)
    patient_phone = models.CharField(max_length=15, blank=True, null=True)

    # Clinical notes
    short_clinical_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Short clinical notes for lab'
    )

    # PARASITOLOGY TESTS (Checkboxes + Results)
    # MRDT
    mrdt_requested = models.BooleanField(default=False)
    mrdt_result = models.TextField(blank=True, null=True)

    # BS (Blood Smear)
    bs_requested = models.BooleanField(default=False)
    bs_result = models.TextField(blank=True, null=True)

    # Stool Analysis
    stool_analysis_requested = models.BooleanField(default=False)
    stool_macro_result = models.TextField(blank=True, null=True)
    stool_micro_result = models.TextField(blank=True, null=True)

    # Urine SED
    urine_sed_requested = models.BooleanField(default=False)
    urine_sed_macro_result = models.TextField(blank=True, null=True)
    urine_sed_micro_result = models.TextField(blank=True, null=True)

    # Urinalysis
    urinalysis_requested = models.BooleanField(default=False)
    urinalysis_urobilinogen = models.TextField(blank=True, null=True)
    urinalysis_glucose = models.TextField(blank=True, null=True)
    urinalysis_bilirubin = models.TextField(blank=True, null=True)
    urinalysis_ketones = models.TextField(blank=True, null=True)
    urinalysis_sg = models.TextField(blank=True, null=True)
    urinalysis_blood = models.TextField(blank=True, null=True)
    urinalysis_ph = models.TextField(blank=True, null=True)
    urinalysis_protein = models.TextField(blank=True, null=True)
    urinalysis_nitrite = models.TextField(blank=True, null=True)
    urinalysis_leucocytes = models.TextField(blank=True, null=True)

    # MICROBIOLOGY TESTS
    # RPR
    rpr_requested = models.BooleanField(default=False)
    rpr_result = models.TextField(blank=True, null=True)

    # H. Pylori
    h_pylori_requested = models.BooleanField(default=False)
    h_pylori_result = models.TextField(blank=True, null=True)

    # Hepatitis B
    hepatitis_b_requested = models.BooleanField(default=False)
    hepatitis_b_result = models.TextField(blank=True, null=True)

    # Hepatitis C
    hepatitis_c_requested = models.BooleanField(default=False)
    hepatitis_c_result = models.TextField(blank=True, null=True)

    # SsAT
    ssat_requested = models.BooleanField(default=False)
    ssat_result = models.TextField(blank=True, null=True)

    # UPT (Pregnancy Test)
    upt_requested = models.BooleanField(default=False)
    upt_result = models.TextField(blank=True, null=True)

    # CLINICAL CHEMISTRY & HEMATOLOGY
    # ESR
    esr_requested = models.BooleanField(default=False)
    esr_result = models.TextField(blank=True, null=True)

    # B/Grouping
    blood_grouping_requested = models.BooleanField(default=False)
    blood_grouping_result = models.TextField(blank=True, null=True)

    # Hb (Hemoglobin)
    hb_requested = models.BooleanField(default=False)
    hb_result = models.TextField(blank=True, null=True)

    # Rheumatoid factor
    rheumatoid_factor_requested = models.BooleanField(default=False)
    rheumatoid_factor_result = models.TextField(blank=True, null=True)

    # RBG (Random Blood Glucose)
    rbg_requested = models.BooleanField(default=False)
    rbg_result = models.TextField(blank=True, null=True)

    # FBG (Fasting Blood Glucose)
    fbg_requested = models.BooleanField(default=False)
    fbg_result = models.TextField(blank=True, null=True)

    # Sickling test
    sickling_test_requested = models.BooleanField(default=False)
    sickling_test_result = models.TextField(blank=True, null=True)

    # Status and tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING_PAYMENT'
    )

    # Payment tracking
    lab_fee_required = models.BooleanField(default=True)
    lab_fee_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text='Total lab fee based on requested tests'
    )
    lab_fee_paid = models.BooleanField(default=False)
    lab_fee_payment_date = models.DateTimeField(blank=True, null=True)
    lab_fee_paid_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='lab_fee_payments',
        null=True,
        blank=True,
        help_text='Staff who processed payment'
    )

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
    reported_by = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Lab technician name who reported results'
    )
    signature = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Lab technician signature'
    )

    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    investigation_date = models.DateField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'lab_test_requests'
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['consultation']),
            models.Index(fields=['patient_id']),
            models.Index(fields=['status', '-requested_at']),
        ]

    def __str__(self):
        return f"Lab Request for {self.patient_name} ({self.patient_id}) - {self.status}"

    def save(self, *args, **kwargs):
        # Set payment date when fee is marked as paid
        if self.lab_fee_paid and not self.lab_fee_payment_date:
            self.lab_fee_payment_date = timezone.now()

        # Auto-advance status when paid
        if self.lab_fee_paid and self.status == 'PENDING_PAYMENT':
            self.status = 'REQUESTED'

        # Set investigation date when results start being entered
        if not self.investigation_date and self.status == 'IN_PROGRESS':
            from datetime import date
            self.investigation_date = date.today()

        super().save(*args, **kwargs)

    @property
    def can_proceed_to_testing(self):
        """Check if testing can proceed (payment made)"""
        return not self.lab_fee_required or self.lab_fee_paid

    @property
    def requested_tests_count(self):
        """Count how many tests were requested"""
        test_fields = [
            'mrdt_requested', 'bs_requested', 'stool_analysis_requested',
            'urine_sed_requested', 'urinalysis_requested', 'rpr_requested',
            'h_pylori_requested', 'hepatitis_b_requested', 'hepatitis_c_requested',
            'ssat_requested', 'upt_requested', 'esr_requested',
            'blood_grouping_requested', 'hb_requested', 'rheumatoid_factor_requested',
            'rbg_requested', 'fbg_requested', 'sickling_test_requested'
        ]
        return sum(1 for field in test_fields if getattr(self, field))

    @property
    def payment_status(self):
        """Get payment status string"""
        if not self.lab_fee_required:
            return "NOT_REQUIRED"
        return "PAID" if self.lab_fee_paid else "UNPAID"


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
