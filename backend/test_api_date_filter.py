#!/usr/bin/env python
"""
Test the API date filter after fix
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from finance.views import ServicePaymentFilter
from finance.models import ServicePayment
from datetime import date

print(f"\n{'='*80}")
print(f"TESTING API DATE FILTER (After Fix)")
print(f"{'='*80}\n")

today = date.today()
print(f"Today: {today}\n")

# Simulate what the API does with the filter
queryset = ServicePayment.objects.filter(status='PAID')
print(f"Total PAID payments: {queryset.count()}")

# Apply the filter (simulating payment_date_from=today&payment_date_to=today)
filter_params = {
    'payment_date_from': str(today),
    'payment_date_to': str(today),
    'status': 'PAID'
}

filtered = ServicePaymentFilter(filter_params, queryset=ServicePayment.objects.all())
filtered_qs = filtered.qs

print(f"\nFiltered payments (payment_date_from={today}, payment_date_to={today}):")
print(f"  Count: {filtered_qs.count()}")

if filtered_qs.count() > 0:
    print(f"\n  Payments found:")
    for payment in filtered_qs:
        print(f"    - {payment.patient_name}: TZS {payment.amount} at {payment.payment_date}")
    print(f"\n✅ SUCCESS: Date filter now working correctly!")
else:
    print(f"\n❌ STILL BROKEN: No payments found for today")

print(f"\n{'='*80}\n")
