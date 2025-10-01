#!/usr/bin/env python
"""
Test API to see the actual 500 error
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from patients.models import Patient
from rest_framework.authtoken.models import Token

User = get_user_model()

print(f"\n{'='*80}")
print(f"TESTING API CALL THAT CAUSES 500 ERROR")
print(f"{'='*80}\n")

try:
    # Get doctor
    doctor = User.objects.filter(role='DOCTOR').first()
    token, _ = Token.objects.get_or_create(user=doctor)
    
    # Get a waiting patient
    patient = Patient.objects.filter(current_status='WAITING_DOCTOR').first()
    
    if not patient:
        print("No WAITING_DOCTOR patient found. Creating one...")
        patient = Patient.objects.create(
            patient_id='TEST_API',
            full_name='Test API Patient',
            phone_number='0700000001',
            date_of_birth='1990-01-01',
            gender='MALE',
            current_status='WAITING_DOCTOR'
        )
    
    print(f"Patient: {patient.full_name} ({patient.patient_id})")
    print(f"Status: {patient.current_status}")
    print(f"Doctor: {doctor.full_name}")
    
    # Make the API call
    client = Client()
    url = '/api/doctor/start-consultation/'
    
    response = client.post(
        url,
        data={'patient_id': patient.patient_id},
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Token {token.key}'
    )
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Content-Type: {response.get('Content-Type')}")
    
    if response.status_code == 500:
        print(f"\n❌ 500 ERROR RESPONSE:")
        print(response.content.decode('utf-8'))
    elif response.status_code == 201:
        print(f"\n✅ SUCCESS")
        import json
        print(json.dumps(json.loads(response.content), indent=2))
    else:
        print(f"\nResponse ({response.status_code}):")
        print(response.content.decode('utf-8')[:500])
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

print(f"\n{'='*80}\n")
