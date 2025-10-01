#!/usr/bin/env python
"""
Test the payments API endpoint directly
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from finance.views import ServicePaymentViewSet
from rest_framework.test import force_authenticate

User = get_user_model()

# Get a staff user
try:
    staff_user = User.objects.filter(role='FINANCE').first()
    if not staff_user:
        staff_user = User.objects.filter(is_staff=True).first()
    if not staff_user:
        staff_user = User.objects.first()
    
    print(f"\n{'='*70}")
    print(f"TESTING API ENDPOINT: /api/finance/payments/?status=PAID")
    print(f"{'='*70}\n")
    print(f"Authenticated as: {staff_user.full_name} ({staff_user.role})")
    
    # Create request
    factory = RequestFactory()
    request = factory.get('/api/finance/payments/?status=PAID')
    force_authenticate(request, user=staff_user)
    
    # Call viewset
    view = ServicePaymentViewSet.as_view({'get': 'list'})
    response = view(request)
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Data Count: {len(response.data) if isinstance(response.data, list) else 'N/A'}")
    
    if response.status_code == 200:
        if isinstance(response.data, list):
            print(f"\n✅ API returning {len(response.data)} payments")
            for payment in response.data[:3]:  # Show first 3
                print(f"\n  - {payment['patient_name']} ({payment['patient_id']})")
                print(f"    Service: {payment['service_type']}")
                print(f"    Amount: {payment['amount']} TZS")
                print(f"    Status: {payment['status']}")
        else:
            print(f"\n⚠️  Response data is not a list: {type(response.data)}")
            print(json.dumps(response.data, indent=2, default=str))
    else:
        print(f"\n❌ API Error: {response.status_code}")
        print(json.dumps(response.data, indent=2, default=str))
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print(f"\n{'='*70}\n")
