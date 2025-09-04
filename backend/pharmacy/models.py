from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class Medication(models.Model):
    """
    Central medication inventory.
    Shared between doctors (for prescribing) and pharmacists (for dispensing).
    """
    
    CATEGORY_CHOICES = [
        ('ANALGESIC', 'Pain Relief'),
        ('ANTIBIOTIC', 'Antibiotic'),
        ('ANTIVIRAL', 'Antiviral'),
        ('VITAMIN', 'Vitamin/Supplement'),
        ('CARDIAC', 'Heart Medication'),
        ('DIABETES', 'Diabetes Medication'),
        ('RESPIRATORY', 'Respiratory'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic medication info
    name = models.CharField(max_length=200, help_text='Brand/Trade name (e.g., Panadol 500mg)')
    generic_name = models.CharField(max_length=200, help_text='Generic name (e.g., Paracetamol)')
    manufacturer = models.CharField(max_length=100, help_text='Manufacturer company')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OTHER')
    
    # Scanning codes (flexible for any format)
    barcode = models.CharField(max_length=50, unique=True, help_text='Primary barcode for scanning')
    qr_code = models.CharField(max_length=200, blank=True, null=True, help_text='QR code data if available')
    alternative_codes = models.JSONField(
        default=list,
        blank=True,
        help_text='Additional codes that identify this medication'
    )
    
    # Inventory management
    current_stock = models.IntegerField(default=0, help_text='Current available quantity')
    reorder_level = models.IntegerField(default=10, help_text='Minimum stock before reorder alert')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Price per unit in TZS')
    
    # Usage control
    requires_prescription = models.BooleanField(default=True, help_text='Requires doctor prescription')
    is_active = models.BooleanField(default=True, help_text='Available for prescribing/dispensing')
    
    # Restocking info
    supplier = models.CharField(max_length=100, blank=True, help_text='Primary supplier')
    last_restocked = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='medications_created')
    
    class Meta:
        db_table = 'pharmacy_medications'
        ordering = ['name']
        indexes = [
            models.Index(fields=['barcode']),
            models.Index(fields=['qr_code']),
            models.Index(fields=['is_active', 'current_stock']),
            models.Index(fields=['category', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.current_stock} units)"
    
    @property
    def is_low_stock(self):
        """Check if medication is below reorder level"""
        return self.current_stock <= self.reorder_level
    
    @property
    def is_available(self):
        """Check if medication is available for prescribing/dispensing"""
        return self.is_active and self.current_stock > 0


class PrescriptionQueue(models.Model):
    """
    Queue of prescriptions from doctors waiting to be processed by pharmacy.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Waiting to be processed'),
        ('IN_PROGRESS', 'Being prepared by pharmacist'),
        ('COMPLETED', 'Ready for patient pickup'),
        ('DISPENSED', 'Given to patient'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low Priority'),
        ('NORMAL', 'Normal Priority'),
        ('HIGH', 'High Priority'),
        ('URGENT', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to doctor's prescription
    prescription_id = models.CharField(max_length=36, help_text='UUID from doctor.Prescription')
    
    # Patient info (cached for performance)
    patient_id = models.CharField(max_length=20, help_text='Patient ID (PAT123)')
    patient_name = models.CharField(max_length=100, help_text='Patient name for quick reference')
    prescribed_by = models.CharField(max_length=100, help_text='Doctor name')
    
    # Prescription details (cached from doctor app)
    medications_list = models.JSONField(
        help_text='List of prescribed medications with quantities'
    )
    
    # Processing info
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='NORMAL')
    
    # Pharmacy staff processing
    processed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='prescriptions_processed',
        blank=True,
        null=True,
        limit_choices_to={'role': 'PHARMACY'}
    )
    
    # Financial tracking
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text='Total cost of prescription'
    )
    
    # Pharmacist modifications (expert review)
    pharmacist_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Pharmacist notes about substitutions, dosage changes, etc.'
    )
    modified_medications = models.JSONField(
        default=list,
        blank=True,
        help_text='Medications modified by pharmacist'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    started_processing_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    dispensed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'pharmacy_prescription_queue'
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['priority', '-created_at']),
            models.Index(fields=['patient_id']),
            models.Index(fields=['prescription_id']),
        ]
    
    def __str__(self):
        return f"Prescription for {self.patient_id} ({self.status})"


class DispenseRecord(models.Model):
    """
    Record of each medication scan during dispensing.
    Creates audit trail and running total calculation.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Links
    prescription_queue = models.ForeignKey(
        PrescriptionQueue,
        on_delete=models.CASCADE,
        related_name='dispense_records'
    )
    medication = models.ForeignKey(Medication, on_delete=models.PROTECT)
    
    # Scanning details
    scanned_code = models.CharField(max_length=200, help_text='The actual code that was scanned')
    quantity_scanned = models.IntegerField(help_text='Number of units scanned')
    
    # Financial details at time of scan
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    running_total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Staff and timing
    scanned_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='scans_performed',
        limit_choices_to={'role': 'PHARMACY'}
    )
    scanned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pharmacy_dispense_records'
        ordering = ['-scanned_at']
        indexes = [
            models.Index(fields=['prescription_queue', '-scanned_at']),
            models.Index(fields=['medication', '-scanned_at']),
            models.Index(fields=['scanned_code']),
        ]
    
    def __str__(self):
        return f"{self.medication.name} x{self.quantity_scanned} - {self.line_total} TZS"
    
    def save(self, *args, **kwargs):
        # Calculate line total
        self.line_total = self.quantity_scanned * self.unit_price
        super().save(*args, **kwargs)


class StockMovement(models.Model):
    """
    Audit trail for all inventory movements.
    Tracks restocking, dispensing, adjustments, and expiry.
    """
    
    MOVEMENT_TYPES = [
        ('RESTOCK', 'New stock added'),
        ('DISPENSE', 'Medication dispensed to patient'),
        ('EXPIRE', 'Expired medication removed'),
        ('ADJUST', 'Stock adjustment (count correction)'),
        ('DAMAGE', 'Damaged stock removed'),
        ('RETURN', 'Patient return'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # What moved
    medication = models.ForeignKey(Medication, on_delete=models.PROTECT)
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField(help_text='Positive for additions, negative for removals')
    
    # Stock levels
    previous_stock = models.IntegerField(help_text='Stock before this movement')
    new_stock = models.IntegerField(help_text='Stock after this movement')
    
    # Reference and codes
    reference_id = models.CharField(
        max_length=36,
        blank=True,
        null=True,
        help_text='Prescription ID, Purchase Order, etc.'
    )
    scanned_codes = models.JSONField(
        default=list,
        blank=True,
        help_text='Codes scanned during this movement'
    )
    
    # Staff and timing
    performed_by = models.ForeignKey(User, on_delete=models.PROTECT)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'pharmacy_stock_movements'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['medication', '-timestamp']),
            models.Index(fields=['movement_type', '-timestamp']),
            models.Index(fields=['reference_id']),
        ]
    
    def __str__(self):
        return f"{self.medication.name}: {self.movement_type} {self.quantity} units"
