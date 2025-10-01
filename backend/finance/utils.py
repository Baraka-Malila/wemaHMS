"""
Finance utility functions for pricing lookups and billing.
Centralizes all pricing logic to avoid conflicts.
"""
from decimal import Decimal
from django.utils import timezone
from .models import ServicePricing, ServicePayment


def get_medication_price(medication_name, medication_code=None, emergency=False):
    """
    Get medication price from centralized ServicePricing.
    Falls back to medication.unit_price during migration period.
    """
    try:
        # First try to find by service code
        if medication_code:
            service = ServicePricing.objects.filter(
                service_code=medication_code,
                service_category='MEDICATION',
                is_active=True
            ).first()
            if service:
                return service.emergency_price if emergency and service.emergency_price else service.standard_price
        
        # Then try by service name
        service = ServicePricing.objects.filter(
            service_name__icontains=medication_name,
            service_category='MEDICATION',
            is_active=True
        ).first()
        
        if service:
            return service.emergency_price if emergency and service.emergency_price else service.standard_price
        
        # If no service pricing found, we'll need to fallback to medication.unit_price temporarily
        # during migration period
        return None
        
    except Exception:
        return None


def get_lab_test_price(test_name, test_code=None, emergency=False):
    """
    Get lab test price from centralized ServicePricing.
    """
    try:
        # First try by service code
        if test_code:
            service = ServicePricing.objects.filter(
                service_code=test_code,
                service_category='LAB_TEST',
                is_active=True
            ).first()
            if service:
                return service.emergency_price if emergency and service.emergency_price else service.standard_price
        
        # Then try by service name
        service = ServicePricing.objects.filter(
            service_name__icontains=test_name,
            service_category='LAB_TEST',
            is_active=True
        ).first()
        
        if service:
            return service.emergency_price if emergency and service.emergency_price else service.standard_price
        
        return None
        
    except Exception:
        return None


def get_consultation_price(consultation_type='GENERAL', doctor_specialty=None, emergency=False):
    """
    Get consultation price from centralized ServicePricing.
    """
    try:
        # Try specialist consultation first if specialty provided
        if doctor_specialty:
            service = ServicePricing.objects.filter(
                service_name__icontains=doctor_specialty,
                service_category='CONSULTATION',
                is_active=True
            ).first()
            if service:
                return service.emergency_price if emergency and service.emergency_price else service.standard_price
        
        # Fall back to general consultation
        service = ServicePricing.objects.filter(
            service_code='CONSULT_GENERAL',
            service_category='CONSULTATION',
            is_active=True
        ).first()
        
        if service:
            return service.emergency_price if emergency and service.emergency_price else service.standard_price
        
        # Default fallback price
        return Decimal('50000.00')  # 50k TZS default
        
    except Exception:
        return Decimal('50000.00')


def get_nursing_service_price(service_name, service_code=None):
    """
    Get nursing service price from centralized ServicePricing.
    """
    try:
        # First try by service code
        if service_code:
            service = ServicePricing.objects.filter(
                service_code=service_code,
                service_category='NURSING',
                is_active=True
            ).first()
            if service:
                return service.standard_price
        
        # Then try by service name
        service = ServicePricing.objects.filter(
            service_name__icontains=service_name,
            service_category='NURSING',
            is_active=True
        ).first()
        
        if service:
            return service.standard_price
        
        return None
        
    except Exception:
        return None


def get_service_price(service_code):
    """
    Get any service price by service code.
    Universal function for all service types.
    """
    try:
        service = ServicePricing.objects.filter(
            service_code=service_code,
            is_active=True
        ).first()
        
        if service:
            return service.standard_price
        
        return None
        
    except Exception:
        return None


def create_bill_for_prescription(prescription_queue, staff_user):
    """
    Create a patient bill for a completed prescription.
    Called from pharmacy when prescription is completed.
    """
    from .models import PatientBill, BillLineItem
    from django.utils import timezone
    
    try:
        # Create the main bill
        bill = PatientBill.objects.create(
            patient_id=prescription_queue.patient_id,
            patient_name=prescription_queue.patient_name,
            service_date=prescription_queue.created_at.date(),
            due_date=timezone.now().date(),
            created_by=staff_user
        )
        
        # Add line items for each dispensed medication
        total_amount = Decimal('0.00')
        for dispense_record in prescription_queue.dispense_records.all():
            line_item = BillLineItem.objects.create(
                patient_bill=bill,
                service_name=dispense_record.medication.name,
                service_code=f"MED_{dispense_record.medication.barcode}",
                service_category='MEDICATION',
                quantity=dispense_record.quantity_scanned,
                unit_price=dispense_record.unit_price,
                source_department='PHARMACY',
                source_reference=prescription_queue.id,
                service_date=dispense_record.scanned_at,
                provided_by=dispense_record.scanned_by
            )
            total_amount += line_item.line_total
        
        # Update bill totals
        bill.subtotal = total_amount
        bill.save()
        
        return bill
        
    except Exception as e:
        raise Exception(f"Failed to create prescription bill: {str(e)}")


def create_bill_for_lab_tests(lab_test_request, staff_user):
    """
    Create a patient bill for completed lab tests.
    Called from lab when tests are completed.
    """
    from .models import PatientBill, BillLineItem
    from django.utils import timezone
    
    try:
        # Create the main bill
        bill = PatientBill.objects.create(
            patient_id=lab_test_request.patient_id,
            patient_name=lab_test_request.patient_name,
            service_date=lab_test_request.requested_at.date(),
            due_date=timezone.now().date(),
            created_by=staff_user
        )
        
        # Add line item for lab tests
        # Use estimated_cost or lookup from ServicePricing
        test_price = get_lab_test_price(lab_test_request.test_type)
        if not test_price and lab_test_request.estimated_cost:
            test_price = lab_test_request.estimated_cost
        if not test_price:
            test_price = Decimal('25000.00')  # Default lab test price
        
        line_item = BillLineItem.objects.create(
            patient_bill=bill,
            service_name=f"Lab Test: {lab_test_request.test_type}",
            service_code=f"LAB_{lab_test_request.test_type.upper()}",
            service_category='LAB_TEST',
            quantity=1,
            unit_price=test_price,
            source_department='LAB',
            source_reference=lab_test_request.id,
            service_date=lab_test_request.requested_at,
            provided_by=staff_user
        )
        
        # Update bill totals
        bill.subtotal = line_item.line_total
        bill.save()
        
        return bill
        
    except Exception as e:
        raise Exception(f"Failed to create lab test bill: {str(e)}")


def create_bill_for_consultation(consultation, staff_user):
    """
    Create a patient bill for doctor consultation.
    Called from doctor app when consultation is completed.
    """
    from .models import PatientBill, BillLineItem
    from django.utils import timezone

    try:
        # Get consultation price
        consultation_price = get_consultation_price(
            consultation_type='GENERAL',
            doctor_specialty=getattr(consultation.doctor, 'specialty', None)
        )

        # Create the main bill
        bill = PatientBill.objects.create(
            patient_id=consultation.patient_id,
            patient_name=consultation.patient_name,
            service_date=consultation.consultation_date,
            due_date=timezone.now().date(),
            created_by=staff_user
        )

        # Add line item for consultation
        line_item = BillLineItem.objects.create(
            patient_bill=bill,
            service_name=f"Doctor Consultation - {consultation.consultation_type}",
            service_code='CONSULT_GENERAL',
            service_category='CONSULTATION',
            quantity=1,
            unit_price=consultation_price,
            source_department='DOCTOR',
            source_reference=consultation.id,
            service_date=consultation.created_at,
            provided_by=consultation.doctor
        )

        # Update bill totals
        bill.subtotal = line_item.line_total
        bill.save()

        return bill

    except Exception as e:
        raise Exception(f"Failed to create consultation bill: {str(e)}")


# ============================================================================
# PAYMENT AUTO-CREATION FUNCTIONS (Option 1 - Unified Payment Flow)
# ============================================================================

def create_pending_payment(patient, service_type, service_name, amount, reference_id=None, user=None):
    """
    Create a PENDING ServicePayment record with auto-NHIF detection.

    This is the centralized function for creating payments across all portals.
    All service-related payments should go through this function.

    Args:
        patient: Patient object
        service_type (str): One of ServicePayment.SERVICE_TYPES choices
        service_name (str): Human-readable service description
        amount (Decimal or float): Payment amount in TZS
        reference_id (str, optional): Reference to consultation_id, lab_request_id, etc.
        user (User, optional): User creating the payment

    Returns:
        ServicePayment: Created payment object

    Example:
        >>> payment = create_pending_payment(
        ...     patient=patient,
        ...     service_type='CONSULTATION',
        ...     service_name='Doctor Consultation Fee',
        ...     amount=5000.00,
        ...     reference_id=consultation.id,
        ...     user=request.user
        ... )
    """
    # Auto-detect payment method based on patient type
    payment_method = 'NHIF' if patient.patient_type == 'NHIF' else 'CASH'

    # Create the payment record
    payment = ServicePayment.objects.create(
        patient_id=patient.patient_id,
        patient_name=patient.full_name,
        service_type=service_type,
        service_name=service_name,
        reference_id=str(reference_id) if reference_id else None,
        amount=Decimal(str(amount)),
        payment_method=payment_method,
        status='PENDING',
        processed_by=user,
        notes=f'Auto-created for {service_name}'
    )

    return payment


def get_pending_payment_for_service(patient, service_type, reference_id=None):
    """
    Check if a pending payment already exists for a service.
    Prevents duplicate payment creation.

    Args:
        patient: Patient object
        service_type (str): Service type to check
        reference_id (str, optional): Specific reference ID

    Returns:
        ServicePayment or None
    """
    query = ServicePayment.objects.filter(
        patient_id=patient.patient_id,
        service_type=service_type,
        status='PENDING'
    )

    if reference_id:
        query = query.filter(reference_id=str(reference_id))

    return query.first()


def calculate_daily_revenue(date=None):
    """
    Calculate total revenue for a given date.

    Args:
        date: Date object (defaults to today)

    Returns:
        dict: Revenue breakdown
    """
    if date is None:
        date = timezone.now().date()

    payments = ServicePayment.objects.filter(
        payment_date__date=date,
        status='PAID'
    )

    # Calculate totals
    total_revenue = sum(p.amount for p in payments)

    # Breakdown by service type
    by_service = {}
    for service_type, _ in ServicePayment.SERVICE_TYPES:
        service_payments = payments.filter(service_type=service_type)
        by_service[service_type] = sum(p.amount for p in service_payments)

    # Breakdown by payment method
    by_method = {}
    for method, _ in ServicePayment.PAYMENT_METHODS:
        method_payments = payments.filter(payment_method=method)
        by_method[method] = sum(p.amount for p in method_payments)

    return {
        'date': date,
        'total_revenue': total_revenue,
        'by_service_type': by_service,
        'by_payment_method': by_method,
        'payment_count': payments.count()
    }
