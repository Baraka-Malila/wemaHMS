#!/usr/bin/env python
"""
Test if the payments API endpoint is returning data correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from finance.models import ServicePayment
from finance.serializers import ServicePaymentSerializer

# Get all PAID payments (what the API returns)
paid_payments = ServicePayment.objects.filter(status='PAID').order_by('-created_at')

print(f"\n{'='*70}")
print(f"PAYMENTS API TEST (status=PAID)")
print(f"{'='*70}\n")

print(f"Total PAID payments in database: {paid_payments.count()}")

if paid_payments.count() > 0:
    print(f"\nPayments that should appear in frontend:")
    print(f"{'-'*70}")
    
    # Serialize like the API does
    serializer = ServicePaymentSerializer(paid_payments, many=True)
    
    for payment_data in serializer.data:
        print(f"\nPatient: {payment_data['patient_name']} ({payment_data['patient_id']})")
        print(f"Service: {payment_data['service_type']} - {payment_data['service_name']}")
        print(f"Amount: {payment_data['amount']} TZS")
        print(f"Status: {payment_data['status']}")
        print(f"Payment Date: {payment_data.get('payment_date', 'N/A')}")
        print(f"Receipt: {payment_data.get('receipt_number', 'N/A')}")
        print(f"Created: {payment_data['created_at']}")
        print(f"{'-'*70}")
    
    print(f"\n✅ API should return {paid_payments.count()} payment records")
    print(f"✅ These should be visible in Finance → Payment History")
else:
    print("\n⚠️  NO PAID payments found!")

print(f"\n{'='*70}\n")
