from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid
from decimal import Decimal

User = get_user_model()


class ServicePricing(models.Model):
    """
    Master pricing table for all hospital services.
    Admin can add/edit all service prices here.
    """
    
    SERVICE_CATEGORIES = [
        ('CONSULTATION', 'Doctor Consultation'),
        ('LAB_TEST', 'Laboratory Test'),
        ('MEDICATION', 'Medication/Pharmacy'),
        ('NURSING', 'Nursing Service'),
        ('WARD', 'Ward/Admission'),
        ('PROCEDURE', 'Medical Procedure'),
        ('EMERGENCY', 'Emergency Service'),
        ('OTHER', 'Other Services'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Service identification
    service_name = models.CharField(
        max_length=200,
        help_text='Name of the service (e.g., Blood Test, General Consultation)'
    )
    service_code = models.CharField(
        max_length=20,
        unique=True,
        help_text='Unique code for this service (e.g., LAB001, DOC001)'
    )
    service_category = models.CharField(
        max_length=20,
        choices=SERVICE_CATEGORIES
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Detailed description of what\'s included'
    )
    
    # Pricing
    standard_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Regular price for this service'
    )
    emergency_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Price for emergency/after-hours service'
    )
    
    # Service details
    department = models.CharField(
        max_length=20,
        help_text='Which department provides this service'
    )
    duration_minutes = models.IntegerField(
        blank=True,
        null=True,
        help_text='Average time required for this service'
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text='Whether this service is currently offered'
    )
    requires_approval = models.BooleanField(
        default=False,
        help_text='Whether this service needs admin approval'
    )
    
    # Tracking
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='service_pricing_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'service_pricing'
        ordering = ['service_category', 'service_name']
        indexes = [
            models.Index(fields=['service_category']),
            models.Index(fields=['service_code']),
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"{self.service_name} - {self.standard_price} TZS"


class PatientBill(models.Model):
    """
    Main billing record for each patient.
    Consolidates all services provided.
    """
    
    BILL_STATUS_CHOICES = [
        ('DRAFT', 'Draft - Being Prepared'),
        ('OPEN', 'Open - Awaiting Payment'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Fully Paid'),
        ('OVERDUE', 'Payment Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Bill identification
    bill_number = models.CharField(
        max_length=20,
        unique=True,
        help_text='Unique bill number (BILL20240904001)'
    )
    
    # Patient information
    patient_id = models.CharField(
        max_length=20,
        help_text='Patient ID (PAT123, etc.)'
    )
    patient_name = models.CharField(
        max_length=100,
        help_text='Patient name for reference'
    )
    
    # Financial totals
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Sum of all line items'
    )
    insurance_covered = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Amount covered by insurance'
    )
    patient_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Amount patient needs to pay'
    )
    total_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Amount already paid'
    )
    balance_due = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Outstanding amount'
    )
    
    # Status tracking
    bill_status = models.CharField(
        max_length=15,
        choices=BILL_STATUS_CHOICES,
        default='DRAFT'
    )
    
    # Important dates
    service_date = models.DateField(
        help_text='Date when services were provided'
    )
    bill_date = models.DateField(
        auto_now_add=True,
        help_text='Date when bill was created'
    )
    due_date = models.DateField(
        help_text='Payment due date'
    )
    
    # Insurance information
    insurance_provider = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Insurance company name'
    )
    insurance_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Insurance policy number'
    )
    
    # Staff tracking
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='bills_created'
    )
    
    class Meta:
        db_table = 'patient_bills'
        ordering = ['-bill_date']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['bill_status']),
            models.Index(fields=['bill_date']),
        ]
    
    def __str__(self):
        return f"{self.bill_number} - {self.patient_id} ({self.bill_status})"
    
    def save(self, *args, **kwargs):
        # Auto-generate bill number if not provided
        if not self.bill_number:
            today = timezone.now().date().strftime('%Y%m%d')
            last_bill = PatientBill.objects.filter(
                bill_number__startswith=f'BILL{today}'
            ).order_by('-bill_number').first()
            
            if last_bill:
                last_num = int(last_bill.bill_number[-3:])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.bill_number = f'BILL{today}{new_num:03d}'
        
        # Calculate patient amount
        self.patient_amount = self.subtotal - self.insurance_covered
        self.balance_due = self.patient_amount - self.total_paid
        
        # Update status based on payments
        if self.balance_due <= 0:
            self.bill_status = 'PAID'
        elif self.total_paid > 0:
            self.bill_status = 'PARTIAL'
        elif self.due_date < timezone.now().date():
            self.bill_status = 'OVERDUE'
        
        super().save(*args, **kwargs)


class BillLineItem(models.Model):
    """
    Individual service charges within a patient bill.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Bill reference
    patient_bill = models.ForeignKey(
        PatientBill,
        on_delete=models.CASCADE,
        related_name='line_items'
    )
    
    # Service reference
    service_pricing = models.ForeignKey(
        ServicePricing,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        help_text='Link to service pricing if available'
    )
    
    # Service details (cached for performance and history)
    service_name = models.CharField(
        max_length=200,
        help_text='Name of service provided'
    )
    service_code = models.CharField(
        max_length=20,
        help_text='Service code at time of billing'
    )
    service_category = models.CharField(
        max_length=20,
        help_text='Category of service'
    )
    
    # Pricing details
    quantity = models.IntegerField(
        default=1,
        help_text='Number of units of this service'
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Price per unit at time of service'
    )
    line_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='quantity * unit_price'
    )
    
    # Source tracking
    source_department = models.CharField(
        max_length=20,
        help_text='Department that provided the service'
    )
    source_reference = models.UUIDField(
        help_text='ID of the original record (consultation, prescription, etc.)'
    )
    service_date = models.DateTimeField(
        help_text='When the service was actually provided'
    )
    
    # Staff who provided service
    provided_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='Staff member who provided the service'
    )
    
    class Meta:
        db_table = 'bill_line_items'
        ordering = ['service_date']
    
    def save(self, *args, **kwargs):
        # Calculate line total
        self.line_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        
        # Update parent bill subtotal
        self.patient_bill.subtotal = self.patient_bill.line_items.aggregate(
            total=models.Sum('line_total')
        )['total'] or Decimal('0.00')
        self.patient_bill.save()


class DailyBalance(models.Model):
    """
    End-of-day financial summary and closure.
    Must be completed daily for proper accounting.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    balance_date = models.DateField(unique=True)
    
    # Department revenue
    consultation_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    pharmacy_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    lab_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    nursing_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    other_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # Payment methods
    cash_collected = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    card_payments = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    mobile_payments = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    insurance_payments = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_collected = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # Outstanding tracking
    bills_created_today = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    outstanding_start = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    outstanding_end = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # Balance verification
    is_balanced = models.BooleanField(default=False)
    variance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    variance_notes = models.TextField(blank=True, null=True)
    
    # Closure tracking
    closed_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='daily_balances_closed')
    closed_at = models.DateTimeField()
    approved_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='daily_balances_approved', blank=True, null=True)
    
    class Meta:
        db_table = 'daily_balances'
        ordering = ['-balance_date']
    
    def __str__(self):
        return f"Daily Balance {self.balance_date} - {self.total_revenue} TZS"
