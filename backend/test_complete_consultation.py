#!/usr/bin/env python
"""Test the complete consultation endpoint"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from doctor.views import complete_consultation
from doctor.models import Consultation
from patients.models import Patient
from finance.models import ServicePayment
from rest_framework.authtoken.models import Token
import json

print(f"\n{'='*80}")
print("TESTING COMPLETE CONSULTATION ENDPOINT")
print(f"{'='*80}\n")

# Get the consultation
consultation = Consultation.objects.first()
if not consultation:
    print("❌ No consultation found")
    exit(1)

print(f"📋 Consultation Details:")
print(f"   ID: {consultation.id}")
print(f"   Patient: {consultation.patient_id}")
print(f"   Doctor: {consultation.doctor.full_name if consultation.doctor else 'None'}")
print(f"   Status: {consultation.status}")
print(f"   Diagnosis: {consultation.diagnosis}")

# Get patient before
patient_before = Patient.objects.get(patient_id=consultation.patient_id)
print(f"\n👥 Patient BEFORE:")
print(f"   Status: {patient_before.current_status}")
print(f"   Location: {patient_before.current_location}")

# Create request with proper authentication
from rest_framework.test import APIRequestFactory, force_authenticate
factory = APIRequestFactory()
request = factory.post(
    '/api/doctor/consultations/complete/',
    data={'consultation_id': str(consultation.id)},
    format='json'
)

# Add user authentication
force_authenticate(request, user=consultation.doctor)

print(f"\n🚀 Calling complete_consultation view...")

try:
    response = complete_consultation(request)
    
    print(f"\n📊 Response Status: {response.status_code}")
    print(f"   Response Data:")
    print(json.dumps(response.data, indent=2, default=str))
    
    # Check consultation after
    consultation.refresh_from_db()
    print(f"\n📋 Consultation AFTER:")
    print(f"   Status: {consultation.status}")
    print(f"   Completed At: {consultation.completed_at}")
    
    # Check patient after
    patient_after = Patient.objects.get(patient_id=consultation.patient_id)
    print(f"\n👥 Patient AFTER:")
    print(f"   Status: {patient_after.current_status}")
    print(f"   Location: {patient_after.current_location}")
    
    # Check payments
    payments = ServicePayment.objects.filter(patient_id=consultation.patient_id)
    print(f"\n💰 Service Payments:")
    for pay in payments:
        print(f"   - {pay.service_type}: {pay.amount} TZS ({pay.status})")
        if pay.reference_id:
            print(f"     Reference: {pay.reference_id}")
    
    print(f"\n{'='*80}")
    if response.status_code == 200:
        print("✅ CONSULTATION COMPLETION SUCCESSFUL")
    else:
        print("❌ CONSULTATION COMPLETION FAILED")
    print(f"{'='*80}\n")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    print(f"\n{'='*80}\n")
