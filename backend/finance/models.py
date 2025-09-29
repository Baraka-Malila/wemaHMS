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


class ExpenseCategory(models.Model):
    """
    Categories for organizing hospital expenses.
    Simple categorization for expense tracking.
    """
    
    CATEGORY_TYPES = [
        ('STAFF', 'Staff & Payroll'),
        ('MEDICAL', 'Medical Supplies'),
        ('UTILITIES', 'Utilities & Services'),
        ('EQUIPMENT', 'Equipment & Maintenance'),
        ('OFFICE', 'Office Supplies'),
        ('TRANSPORT', 'Transport & Fuel'),
        ('TRAINING', 'Training & Development'),
        ('OTHER', 'Other Expenses'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(
        max_length=100,
        help_text='Category name (e.g., Staff Salaries, Medical Supplies)'
    )
    category_type = models.CharField(
        max_length=20,
        choices=CATEGORY_TYPES
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text='What expenses belong in this category'
    )
    
    # Budget tracking
    monthly_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Monthly budget allocation for this category'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Tracking
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'expense_categories'
        ordering = ['category_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"


class ExpenseRecord(models.Model):
    """
    Record of all hospital expenses.
    Tracks all outgoing money for proper financial management.
    """
    
    EXPENSE_STATUS = [
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('PAID', 'Paid'),
        ('REJECTED', 'Rejected'),
    ]
    
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CHEQUE', 'Cheque'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('CARD', 'Debit/Credit Card'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Expense identification
    expense_number = models.CharField(
        max_length=20,
        unique=True,
        help_text='Unique expense number (EXP20240904001)'
    )
    
    # Categorization
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.PROTECT,
        help_text='What type of expense this is'
    )
    
    # Basic details
    description = models.CharField(
        max_length=200,
        help_text='Brief description of the expense'
    )
    detailed_description = models.TextField(
        blank=True,
        null=True,
        help_text='Detailed description of what was purchased/paid for'
    )
    
    # Financial details
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Total amount of the expense'
    )
    
    # Optional vendor info (simplified)
    vendor_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Name of supplier/vendor (optional)'
    )
    vendor_contact = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Vendor phone/email (optional)'
    )
    
    # Payment details
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default='CASH'
    )
    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Receipt number, transaction ID, etc.'
    )
    
    # Status and dates
    expense_status = models.CharField(
        max_length=15,
        choices=EXPENSE_STATUS,
        default='PENDING'
    )
    expense_date = models.DateField(
        help_text='Date when expense was incurred'
    )
    payment_date = models.DateField(
        blank=True,
        null=True,
        help_text='Date when payment was made'
    )
    
    # Staff tracking
    requested_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='expenses_requested',
        help_text='Staff member who requested this expense'
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='expenses_approved',
        blank=True,
        null=True,
        help_text='Admin who approved this expense'
    )
    paid_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='expenses_paid',
        blank=True,
        null=True,
        help_text='Staff member who processed payment'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expense_records'
        ordering = ['-expense_date', '-created_at']
        indexes = [
            models.Index(fields=['expense_status']),
            models.Index(fields=['expense_date']),
            models.Index(fields=['category']),
            models.Index(fields=['requested_by']),
        ]
    
    def __str__(self):
        return f"{self.expense_number} - {self.description} ({self.amount} TZS)"
    
    def save(self, *args, **kwargs):
        # Auto-generate expense number if not provided
        if not self.expense_number:
            today = timezone.now().date().strftime('%Y%m%d')
            last_expense = ExpenseRecord.objects.filter(
                expense_number__startswith=f'EXP{today}'
            ).order_by('-expense_number').first()
            
            if last_expense:
                last_num = int(last_expense.expense_number[-3:])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.expense_number = f'EXP{today}{new_num:03d}'
        
        super().save(*args, **kwargs)


class StaffSalary(models.Model):
    """
    Staff salary and payroll tracking.
    Simplified payroll management for the hospital.
    """
    
    SALARY_STATUS = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partially Paid'),
        ('ON_HOLD', 'On Hold'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Staff reference
    staff_member = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='Staff member receiving salary'
    )
    
    # Salary period
    salary_month = models.DateField(
        help_text='Month this salary is for (YYYY-MM-01 format)'
    )
    
    # Salary breakdown
    basic_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Basic monthly salary'
    )
    allowances = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Transport, medical, housing allowances'
    )
    overtime_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Overtime payments'
    )
    deductions = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Tax, PAYE, loan deductions, etc.'
    )
    net_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Final amount to be paid'
    )
    
    # Payment details
    payment_status = models.CharField(
        max_length=15,
        choices=SALARY_STATUS,
        default='PENDING'
    )
    payment_date = models.DateField(
        blank=True,
        null=True,
        help_text='Date salary was paid'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=ExpenseRecord.PAYMENT_METHODS,
        default='BANK_TRANSFER'
    )
    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Bank transaction reference'
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Any notes about this salary payment'
    )
    
    # Tracking
    processed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='salaries_processed'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'staff_salaries'
        ordering = ['-salary_month', 'staff_member__full_name']
        unique_together = ['staff_member', 'salary_month']
        indexes = [
            models.Index(fields=['salary_month']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['staff_member']),
        ]
    
    def __str__(self):
        return f"{self.staff_member.full_name} - {self.salary_month.strftime('%B %Y')} - {self.net_salary} TZS"
    
    def save(self, *args, **kwargs):
        # Calculate net salary
        gross_salary = self.basic_salary + self.allowances + self.overtime_amount
        self.net_salary = gross_salary - self.deductions
        super().save(*args, **kwargs)


# ==============================================================================
# REVENUE TRACKING
# ==============================================================================

class RevenueRecord(models.Model):
    """
    Record of all hospital revenue/income.
    Tracks all incoming money including file fees, consultations, etc.
    """
    
    REVENUE_TYPES = [
        ('FILE_FEE', 'File Fee (New Patient)'),
        ('CONSULTATION', 'Doctor Consultation'),
        ('LAB_TEST', 'Laboratory Test'),
        ('MEDICATION', 'Medication Sale'),
        ('PROCEDURE', 'Medical Procedure'),
        ('ADMISSION', 'Ward Admission'),
        ('OTHER', 'Other Revenue'),
    ]
    
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('CARD', 'Debit/Credit Card'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Revenue identification
    revenue_number = models.CharField(
        max_length=20,
        unique=True,
        help_text='Unique revenue number (REV20240904001)'
    )
    
    # Patient reference (for patient-related revenue)
    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text='Patient this revenue is related to (if applicable)'
    )
    
    # Revenue details
    revenue_type = models.CharField(
        max_length=20,
        choices=REVENUE_TYPES,
        help_text='Type of revenue/service'
    )
    description = models.CharField(
        max_length=200,
        help_text='Description of the service/revenue'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Amount received'
    )
    
    # Payment details
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default='CASH'
    )
    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Receipt number, transaction ID, etc.'
    )
    
    # Tracking
    collected_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text='Staff member who collected the payment'
    )
    revenue_date = models.DateField(
        default=timezone.now,
        help_text='Date when revenue was collected'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'revenue_records'
        ordering = ['-revenue_date', '-created_at']
        indexes = [
            models.Index(fields=['revenue_date']),
            models.Index(fields=['revenue_type']),
            models.Index(fields=['patient']),
        ]
    
    def __str__(self):
        return f"{self.revenue_number} - {self.get_revenue_type_display()} - {self.amount} TZS"
    
    def save(self, *args, **kwargs):
        if not self.revenue_number:
            # Auto-generate revenue number
            today = timezone.now().date()
            prefix = f"REV{today.strftime('%Y%m%d')}"
            
            # Get the latest revenue number for today
            latest = RevenueRecord.objects.filter(
                revenue_number__startswith=prefix
            ).order_by('-revenue_number').first()
            
            if latest:
                # Extract number and increment
                try:
                    latest_num = int(latest.revenue_number[-3:])
                    new_num = latest_num + 1
                except:
                    new_num = 1
            else:
                new_num = 1
            
            self.revenue_number = f"{prefix}{new_num:03d}"
        
        super().save(*args, **kwargs)


# ==============================================================================
# EXISTING BILLING MODELS (KEEP AS-IS, WORKING IN PRODUCTION)
# ==============================================================================
# These models were created from the initial migrations and are working fine.
# They use different field names than my new definitions, but that's OK.
# PatientBill, BillLineItem, and DailyBalance models exist in the database
# with the original structure from the first migrations.
# ==============================================================================


class ServicePayment(models.Model):
    """
    Unified payment tracking for all hospital services.
    Links to specific service records (consultations, lab requests, etc.)
    """

    SERVICE_TYPES = [
        ('FILE_FEE', 'Patient File Fee'),
        ('CONSULTATION', 'Doctor Consultation'),
        ('LAB_TEST', 'Laboratory Test'),
        ('MEDICATION', 'Medication/Pharmacy'),
        ('NURSING', 'Nursing Service'),
        ('WARD', 'Ward/Admission'),
        ('PROCEDURE', 'Medical Procedure'),
        ('OTHER', 'Other Service'),
    ]

    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('INSURANCE', 'Insurance'),
        ('CREDIT', 'Credit/Deferred'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Payment Pending'),
        ('PAID', 'Payment Completed'),
        ('REFUNDED', 'Payment Refunded'),
        ('WAIVED', 'Payment Waived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Patient and service info
    patient_id = models.CharField(max_length=20, help_text='Patient ID (PAT123)')
    patient_name = models.CharField(max_length=100, help_text='Patient name for quick reference')

    # Service details
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    service_name = models.CharField(max_length=200, help_text='Name of the service provided')
    reference_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Reference to consultation_id, lab_request_id, etc.'
    )

    # Payment details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Payment amount in TZS'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default='CASH'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    # Processing info
    payment_date = models.DateTimeField(blank=True, null=True)
    processed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='payments_processed',
        null=True,
        blank=True,
        help_text='Staff who processed the payment'
    )

    # Additional details
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Payment notes or special instructions'
    )
    receipt_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Receipt or transaction number'
    )

    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'service_payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['service_type', 'status']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['payment_date']),
        ]

    def __str__(self):
        return f"{self.service_name} - {self.patient_name} ({self.amount} TZS) - {self.status}"

    def save(self, *args, **kwargs):
        # Set payment date when status changes to PAID
        if self.status == 'PAID' and not self.payment_date:
            self.payment_date = timezone.now()

        super().save(*args, **kwargs)

    @property
    def is_paid(self):
        """Check if payment is completed"""
        return self.status == 'PAID'

    @property
    def amount_formatted(self):
        """Format amount with currency"""
        return f"{self.amount:,.2f} TZS"
