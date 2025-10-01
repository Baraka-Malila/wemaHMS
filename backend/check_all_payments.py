#!/usr/bin/env python
"""
Check all payments with dates
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from finance.models import ServicePayment
from datetime import date

# Get all PAID payments
paid_payments = ServicePayment.objects.filter(status='PAID').order_by('-payment_date')

print(f"\n{'='*80}")
print(f"ALL PAID PAYMENTS CHECK")
print(f"{'='*80}\n")

print(f"Total PAID payments: {paid_payments.count()}")
print(f"Today's date: {date.today()}")

total_amount = 0
today_amount = 0
today_count = 0

if paid_payments.count() > 0:
    print(f"\nAll PAID payments:")
    print(f"{'-'*80}")
    for payment in paid_payments:
        payment_date_only = payment.payment_date.date() if payment.payment_date else None
        is_today = payment_date_only == date.today() if payment_date_only else False
        
        print(f"Patient: {payment.patient_name} ({payment.patient_id})")
        print(f"Service: {payment.service_type} - {payment.service_name}")
        print(f"Amount: {payment.amount} TZS")
        print(f"Payment Date: {payment.payment_date} {'✓ TODAY' if is_today else ''}")
        print(f"Receipt: {payment.receipt_number}")
        print(f"Created: {payment.created_at}")
        print(f"{'-'*80}")
        
        total_amount += float(payment.amount)
        if is_today:
            today_amount += float(payment.amount)
            today_count += 1

print(f"\n{'='*80}")
print(f"SUMMARY:")
print(f"  Total payments: {paid_payments.count()}")
print(f"  Total amount: TZS {total_amount:,.2f}")
print(f"  Today's payments: {today_count}")
print(f"  Today's amount: TZS {today_amount:,.2f}")
print(f"{'='*80}\n")

# Check pending payments
pending_payments = ServicePayment.objects.filter(status='PENDING')
print(f"Pending payments: {pending_payments.count()}")
if pending_payments.count() > 0:
    print(f"\nPending payments:")
    print(f"{'-'*80}")
    for payment in pending_payments.order_by('-created_at'):
        print(f"Patient: {payment.patient_name} ({payment.patient_id})")
        print(f"Service: {payment.service_type} - {payment.service_name}")
        print(f"Amount: {payment.amount} TZS")
        print(f"Created: {payment.created_at}")
        print(f"{'-'*80}")
