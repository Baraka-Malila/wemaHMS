#!/usr/bin/env python
"""
Fix missing receipt numbers for existing PAID payments
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from finance.models import ServicePayment
from django.utils import timezone

# Get all PAID payments without receipt numbers
payments_without_receipts = ServicePayment.objects.filter(status='PAID', receipt_number__isnull=True)

print(f"\n{'='*60}")
print(f"FIXING MISSING RECEIPT NUMBERS")
print(f"{'='*60}\n")

print(f"Found {payments_without_receipts.count()} PAID payments without receipt numbers")

if payments_without_receipts.count() > 0:
    print("\nGenerating receipt numbers...")
    
    for payment in payments_without_receipts:
        # Use payment_date if available, otherwise created_at
        payment_date = payment.payment_date or payment.created_at
        date_str = payment_date.strftime('%Y%m%d')
        
        # Count payments on this date to get sequential number
        same_date_payments = ServicePayment.objects.filter(
            payment_date__date=payment_date.date() if payment.payment_date else payment.created_at.date(),
            status='PAID',
            receipt_number__isnull=False
        ).count() + 1
        
        payment.receipt_number = f"RCT-{date_str}-{same_date_payments:05d}"
        payment.save()
        
        print(f"  ✓ {payment.patient_name} ({payment.service_type}) → {payment.receipt_number}")

    print(f"\n✅ Successfully generated {payments_without_receipts.count()} receipt numbers!")
else:
    print("\n✅ All PAID payments already have receipt numbers!")

print(f"\n{'='*60}\n")
