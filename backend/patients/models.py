from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
import uuid
from datetime import date

User = get_user_model()


class PatientManager(models.Manager):
    def _generate_patient_id(self):
        """
        Auto-generate patient ID with unlimited growth.
        Format: PAT1, PAT2, ..., PAT999, PAT1000, PAT10000, etc.
        No fixed padding - grows as needed.
        """
        try:
            # Get the highest patient number (extract number part after PAT)
            from django.db.models import Max
            from django.db.models.functions import Cast, Substr
            from django.db.models import IntegerField
            
            # Find the highest numeric part of existing patient IDs
            max_result = self.exclude(patient_id__isnull=True).exclude(patient_id='').aggregate(
                max_num=Max(
                    Cast(
                        Substr('patient_id', 4),  # Remove 'PAT' prefix
                        IntegerField()
                    )
                )
            )
            
            max_number = max_result['max_num'] or 0
            new_number = max_number + 1
            
            return f"PAT{new_number}"
            
        except Exception:
            # Fallback: Use timestamp-based ID if sequential fails
            from django.utils import timezone
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            return f"PAT{timestamp}"
    
    def _generate_uuid_patient_id(self):
        """
        Alternative UUID-based patient ID (for distributed systems).
        Format: PAT-a1b2c3d4 (PAT + 8-char UUID segment)
        Use this if you need truly distributed ID generation.
        """
        import uuid
        uuid_segment = str(uuid.uuid4()).replace('-', '')[:8]
        return f"PAT-{uuid_segment.upper()}"
    
    def create_patient(self, **extra_fields):
        """Create new patient with auto-generated ID"""
        if 'patient_id' not in extra_fields:
            extra_fields['patient_id'] = self._generate_patient_id()
        
        return self.create(**extra_fields)


class Patient(models.Model):
    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]

    PATIENT_TYPE_CHOICES = [
        ('NORMAL', 'Normal Patient'),
        ('NHIF', 'NHIF Insured Patient'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A Positive'),
        ('A-', 'A Negative'),
        ('B+', 'B Positive'),
        ('B-', 'B Negative'),
        ('O+', 'O Positive'),
        ('O-', 'O Negative'),
        ('AB+', 'AB Positive'),
        ('AB-', 'AB Negative'),
        ('UNKNOWN', 'Unknown'),
    ]
    
    STATUS_CHOICES = [
        ('REGISTERED', 'Just Registered'),
        ('WAITING_DOCTOR', 'Waiting for Doctor'),
        ('WITH_DOCTOR', 'Currently with Doctor'),
        ('WAITING_LAB', 'Waiting for Lab Tests'),
        ('IN_LAB', 'Currently in Laboratory'),
        ('LAB_RESULTS_READY', 'Lab Results Ready'),
        ('WAITING_PHARMACY', 'Waiting for Pharmacy'),
        ('IN_PHARMACY', 'Currently in Pharmacy'),
        ('PAYMENT_PENDING', 'Payment Required'),
        ('COMPLETED', 'Visit Completed'),
        ('DISCHARGED', 'Discharged'),
    ]
    
    # Validators
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must be valid format (9-15 digits)'
    )
    
    patient_id_validator = RegexValidator(
        regex=r'^PAT([1-9][0-9]*|[A-F0-9]{8})$',
        message='Patient ID must be in format: PAT1, PAT123, or PAT-A1B2C3D4'
    )
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.CharField(
        max_length=20,
        unique=True,
        validators=[patient_id_validator],
        help_text='Auto-generated format: PAT1, PAT123, or PAT-A1B2C3D4'
    )
    
    # Required fields
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(
        max_length=15,
        validators=[phone_validator],
        help_text='Primary contact number'
    )
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()

    # Patient type and insurance
    patient_type = models.CharField(
        max_length=10,
        choices=PATIENT_TYPE_CHOICES,
        default='NORMAL',
        help_text='Normal patient pays fees, NHIF patient has insurance coverage'
    )
    nhif_card_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text='NHIF insurance card number (required for NHIF patients)'
    )
    
    # Optional personal details
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(
        max_length=15,
        validators=[phone_validator],
        blank=True,
        null=True
    )
    address = models.TextField(blank=True, null=True)
    tribe = models.CharField(max_length=50, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True, help_text='Patient occupation/job')
    
    # Optional medical details
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0.5), MaxValueValidator(999.99)],
        blank=True,
        null=True,
        help_text='Weight in kg'
    )
    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(30.0), MaxValueValidator(300.0)],
        blank=True,
        null=True,
        help_text='Height in cm'
    )
    blood_group = models.CharField(
        max_length=10,
        choices=BLOOD_GROUP_CHOICES,
        default='UNKNOWN',
        blank=True
    )
    allergies = models.TextField(
        blank=True,
        null=True,
        help_text='Known allergies (medications, foods, etc.)'
    )
    chronic_conditions = models.TextField(
        blank=True,
        null=True,
        help_text='Diabetes, hypertension, etc.'
    )

    # Vital signs (recorded at registration/check-in)
    temperature = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(30.0), MaxValueValidator(50.0)],
        blank=True,
        null=True,
        help_text='Body temperature in Celsius'
    )
    blood_pressure_systolic = models.IntegerField(
        validators=[MinValueValidator(50), MaxValueValidator(300)],
        blank=True,
        null=True,
        help_text='Systolic blood pressure (mmHg)'
    )
    blood_pressure_diastolic = models.IntegerField(
        validators=[MinValueValidator(30), MaxValueValidator(200)],
        blank=True,
        null=True,
        help_text='Diastolic blood pressure (mmHg)'
    )
    pulse_rate = models.IntegerField(
        validators=[MinValueValidator(30), MaxValueValidator(250)],
        blank=True,
        null=True,
        help_text='Pulse rate (beats per minute)'
    )
    
    # Administrative fields
    file_fee_paid = models.BooleanField(default=False)
    file_fee_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=2000.00,
        help_text='File creation fee in TZS'
    )
    file_fee_payment_date = models.DateTimeField(blank=True, null=True)
    
    # Status tracking
    current_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='REGISTERED'
    )
    current_location = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Current department or staff member handling patient'
    )
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='registered_patients',
        help_text='Staff member who registered this patient'
    )
    last_updated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='updated_patients',
        null=True,
        blank=True
    )
    
    objects = PatientManager()
    
    class Meta:
        db_table = 'patients'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['full_name']),
            models.Index(fields=['current_status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.patient_id} - {self.full_name}"
    
    @property
    def age(self):
        """Calculate age from date of birth"""
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def bmi(self):
        """Calculate BMI if height and weight are available"""
        if self.height and self.weight:
            height_m = float(self.height) / 100  # Convert cm to meters
            return round(float(self.weight) / (height_m ** 2), 2)
        return None
    
    @property
    def is_new_patient(self):
        """Check if this is a new patient (registered today)"""
        return self.created_at.date() == timezone.now().date()

    @property
    def requires_file_fee(self):
        """Check if this patient type requires file fee payment"""
        return self.patient_type == 'NORMAL'

    @property
    def is_nhif_patient(self):
        """Check if this is an NHIF insured patient"""
        return self.patient_type == 'NHIF' and bool(self.nhif_card_number)

    @property
    def blood_pressure(self):
        """Get formatted blood pressure (e.g., '120/80')"""
        if self.blood_pressure_systolic and self.blood_pressure_diastolic:
            return f"{self.blood_pressure_systolic}/{self.blood_pressure_diastolic}"
        return None
    
    def save(self, *args, **kwargs):
        # Auto-generate patient_id if not provided
        if not self.patient_id:
            self.patient_id = Patient.objects._generate_patient_id()
        
        # Set file fee payment date if fee is marked as paid
        if self.file_fee_paid and not self.file_fee_payment_date:
            self.file_fee_payment_date = timezone.now()

        # NHIF patients don't pay file fees - auto-mark as paid
        if self.patient_type == 'NHIF' and not self.file_fee_paid:
            self.file_fee_paid = True
            self.file_fee_amount = 0.00  # NHIF covers file fee
            self.file_fee_payment_date = timezone.now()
        
        super().save(*args, **kwargs)


class PatientStatusHistory(models.Model):
    """Track patient status changes for audit and timeline"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    previous_status = models.CharField(
        max_length=20,
        choices=Patient.STATUS_CHOICES,
        null=True,
        blank=True
    )
    new_status = models.CharField(max_length=20, choices=Patient.STATUS_CHOICES)
    previous_location = models.CharField(max_length=100, blank=True, null=True)
    new_location = models.CharField(max_length=100, blank=True, null=True)
    
    # Who made the change
    changed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='patient_status_changes'
    )
    
    # When the change occurred
    changed_at = models.DateTimeField(auto_now_add=True)
    
    # Optional notes about the status change
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'patient_status_history'
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['patient', '-changed_at']),
            models.Index(fields=['new_status', '-changed_at']),
        ]
    
    def __str__(self):
        return f"{self.patient.patient_id}: {self.previous_status} → {self.new_status}"


class PatientNote(models.Model):
    """General notes about patients (not medical records)"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    note = models.TextField()
    note_type = models.CharField(
        max_length=20,
        choices=[
            ('GENERAL', 'General Note'),
            ('CONTACT', 'Contact Update'),
            ('PAYMENT', 'Payment Note'),
            ('ADMINISTRATIVE', 'Administrative Note'),
        ],
        default='GENERAL'
    )
    
    # Audit fields
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='patient_notes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'patient_notes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note for {self.patient.patient_id} by {self.created_by.employee_id}"
