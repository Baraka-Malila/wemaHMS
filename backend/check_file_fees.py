#!/usr/bin/env python
"""
Check if file fee payments are being created correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from finance.models import ServicePayment
from patients.models import Patient

# Get all FILE_FEE payments
file_fee_payments = ServicePayment.objects.filter(service_type='FILE_FEE')

print(f"\n{'='*60}")
print(f"FILE FEE PAYMENT CHECK")
print(f"{'='*60}\n")

print(f"Total FILE_FEE payments in database: {file_fee_payments.count()}")

if file_fee_payments.count() > 0:
    print(f"\nShowing all FILE_FEE payments:")
    print(f"{'-'*60}")
    for payment in file_fee_payments:
        print(f"Patient: {payment.patient_name} ({payment.patient_id})")
        print(f"Amount: {payment.amount} TZS")
        print(f"Status: {payment.status}")
        print(f"Payment Date: {payment.payment_date}")
        print(f"Receipt: {payment.receipt_number}")
        print(f"Created: {payment.created_at}")
        print(f"{'-'*60}")
else:
    print("\n⚠️  NO FILE_FEE payments found in the database!")
    print("\nLet's check recent patients:")
    recent_patients = Patient.objects.all().order_by('-created_at')[:5]
    print(f"\nLast 5 registered patients:")
    for patient in recent_patients:
        print(f"  - {patient.full_name} ({patient.patient_id}) - File Fee Paid: {patient.file_fee_paid}")

print(f"\n{'='*60}\n")

# Check if any PAID payments exist at all
paid_payments = ServicePayment.objects.filter(status='PAID')
print(f"Total PAID payments (all types): {paid_payments.count()}")

if paid_payments.count() > 0:
    payment_types = paid_payments.values_list('service_type', flat=True).distinct()
    print(f"Service types with PAID status: {list(payment_types)}")
