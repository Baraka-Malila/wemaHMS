#!/usr/bin/env python
"""
Test date filtering on payments API
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from finance.models import ServicePayment
from datetime import date, datetime
from django.utils import timezone

print(f"\n{'='*80}")
print(f"TESTING DATE FILTER")
print(f"{'='*80}\n")

# Get today's date
today = date.today()
print(f"Today's date: {today}")
print(f"Today as string: {today.isoformat()}\n")

# Test 1: Filter by payment_date__date (exact date)
payments_today_exact = ServicePayment.objects.filter(
    status='PAID',
    payment_date__date=today
)
print(f"✓ Payments with payment_date__date={today}: {payments_today_exact.count()}")

# Test 2: Filter by payment_date__gte and __lte (date range)
start_of_day = datetime.combine(today, datetime.min.time())
end_of_day = datetime.combine(today, datetime.max.time())
# Make timezone aware
start_of_day = timezone.make_aware(start_of_day)
end_of_day = timezone.make_aware(end_of_day)

payments_today_range = ServicePayment.objects.filter(
    status='PAID',
    payment_date__gte=start_of_day,
    payment_date__lte=end_of_day
)
print(f"✓ Payments with payment_date range [{start_of_day} to {end_of_day}]: {payments_today_range.count()}")

# Test 3: Show what the API filter does (just date string without time)
payments_gte = ServicePayment.objects.filter(
    status='PAID',
    payment_date__gte=today
)
print(f"✓ Payments with payment_date__gte={today}: {payments_gte.count()}")

payments_lte = ServicePayment.objects.filter(
    status='PAID',
    payment_date__lte=today
)
print(f"✓ Payments with payment_date__lte={today}: {payments_lte.count()}")

# Test 4: Combined (this is what the API does with payment_date_from and payment_date_to)
payments_combined = ServicePayment.objects.filter(
    status='PAID',
    payment_date__gte=today,
    payment_date__lte=today
)
print(f"✓ Payments with payment_date__gte={today} AND payment_date__lte={today}: {payments_combined.count()}")

print(f"\n{'='*80}")
print(f"DIAGNOSIS:")
if payments_combined.count() == 0 and payments_today_exact.count() > 0:
    print("❌ ISSUE: Using __gte and __lte with just date doesn't work!")
    print("   Reason: __lte with date '2025-10-01' means <= 2025-10-01 00:00:00")
    print("   So any payment made AFTER midnight is EXCLUDED!")
    print("\n💡 SOLUTION: Use __date lookup in the filter")
else:
    print("✅ Date filtering is working correctly")
print(f"{'='*80}\n")

# Show actual payment times
print("Payment times for today:")
for payment in ServicePayment.objects.filter(status='PAID', payment_date__date=today):
    print(f"  - {payment.patient_name}: {payment.payment_date}")
