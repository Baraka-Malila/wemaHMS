from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class LabTestResult(models.Model):
    """
    Lab test results created by lab technicians.
    Links to LabTestRequest from doctor app and sends results back to doctors.
    Minimal model focusing only on essential result recording.
    """
    
    RESULT_STATUS_CHOICES = [
        ('IN_PROGRESS', 'Test In Progress'),
        ('COMPLETED', 'Test Completed'),
        ('ABNORMAL', 'Abnormal Results'),
        ('CRITICAL', 'Critical Results - Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to test request from doctor app
    lab_request_id = models.CharField(
        max_length=36,
        help_text='UUID of LabTestRequest from doctor app'
    )
    
    # Patient info (cached for performance)
    patient_id = models.CharField(
        max_length=20,
        help_text='Patient ID (PAT123, etc.)'
    )
    patient_name = models.CharField(
        max_length=100,
        help_text='Patient name for quick reference'
    )
    
    # Test details (from original request)
    test_type = models.CharField(
        max_length=50,
        help_text='Type of test performed'
    )
    test_description = models.TextField(
        help_text='Original test description from doctor'
    )
    
    # Results - Simple and flexible
    result_summary = models.TextField(
        help_text='Main test results summary'
    )
    result_details = models.TextField(
        blank=True,
        null=True,
        help_text='Detailed results if needed'
    )
    normal_range = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text='Normal range for this test'
    )
    
    # Status and priority
    result_status = models.CharField(
        max_length=15,
        choices=RESULT_STATUS_CHOICES,
        default='COMPLETED'
    )
    urgent_flag = models.BooleanField(
        default=False,
        help_text='Mark as urgent if results need immediate doctor attention'
    )
    
    # Lab technician notes
    technician_notes = models.TextField(
        blank=True,
        null=True,
        help_text='Additional notes from lab technician'
    )
    
    # File attachments (optional)
    result_image = models.ImageField(
        upload_to='lab_results/',
        blank=True,
        null=True,
        help_text='Image of test results (X-ray, etc.)'
    )
    
    # Timestamps
    test_started_at = models.DateTimeField(auto_now_add=True)
    test_completed_at = models.DateTimeField(auto_now=True)
    
    # Staff tracking
    processed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='lab_results_processed',
        limit_choices_to={'role': 'LAB'}
    )
    
    # Doctor notification tracking
    doctor_notified = models.BooleanField(
        default=False,
        help_text='Whether doctor has been notified of results'
    )
    doctor_viewed = models.BooleanField(
        default=False,
        help_text='Whether doctor has viewed the results'
    )
    
    class Meta:
        db_table = 'lab_test_results'
        ordering = ['-test_completed_at']
        indexes = [
            models.Index(fields=['lab_request_id']),
            models.Index(fields=['patient_id']),
            models.Index(fields=['result_status', '-test_completed_at']),
            models.Index(fields=['urgent_flag', '-test_completed_at']),
        ]
    
    def __str__(self):
        return f"{self.test_type} results for {self.patient_id} ({self.result_status})"
    
    @property
    def processing_time_minutes(self):
        """Calculate how long the test took to process"""
        if self.test_completed_at and self.test_started_at:
            delta = self.test_completed_at - self.test_started_at
            return int(delta.total_seconds() / 60)
        return None
    
    def save(self, *args, **kwargs):
        # Auto-set completion time when status changes to completed
        if self.result_status in ['COMPLETED', 'ABNORMAL', 'CRITICAL']:
            if not self.test_completed_at or self.test_completed_at == self.test_started_at:
                self.test_completed_at = timezone.now()
        
        super().save(*args, **kwargs)


class LabOrder(models.Model):
    """
    Lab supply orders that will be sent to pharmacy.
    Simple model for lab equipment/supplies ordering.
    Will integrate with pharmacy ordering system.
    """
    
    ORDER_STATUS_CHOICES = [
        ('DRAFT', 'Draft Order'),
        ('SUBMITTED', 'Submitted to Pharmacy'),
        ('APPROVED', 'Approved'),
        ('COMPLETED', 'Order Completed'),
        ('CANCELLED', 'Order Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low Priority'),
        ('NORMAL', 'Normal Priority'),
        ('HIGH', 'High Priority'),
        ('URGENT', 'Urgent - Out of Stock'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Order details
    order_title = models.CharField(
        max_length=200,
        help_text='Brief description of order'
    )
    items_list = models.TextField(
        help_text='List of items needed (simple text format for now)'
    )
    justification = models.TextField(
        help_text='Why these items are needed'
    )
    
    # Priority and status
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='NORMAL'
    )
    status = models.CharField(
        max_length=15,
        choices=ORDER_STATUS_CHOICES,
        default='DRAFT'
    )
    
    # Estimated cost (optional)
    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Estimated total cost in TZS'
    )
    
    # Staff tracking
    requested_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='lab_orders_requested',
        limit_choices_to={'role': 'LAB'}
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='lab_orders_approved',
        blank=True,
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'lab_orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['priority', '-created_at']),
        ]
    
    def __str__(self):
        return f"Lab Order: {self.order_title} ({self.status})"
