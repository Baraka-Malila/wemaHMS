#!/usr/bin/env python
"""
Test start_consultation API endpoint
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from patients.models import Patient
from doctor.models import Consultation

User = get_user_model()

print(f"\n{'='*80}")
print(f"TESTING START_CONSULTATION API ENDPOINT")
print(f"{'='*80}\n")

# Get a doctor user
try:
    doctor = User.objects.filter(role='DOCTOR').first()
    if not doctor:
        print("❌ No doctor found in database")
        exit(1)
    
    print(f"Using doctor: {doctor.full_name} ({doctor.email})")
    
    # Get a patient who is WAITING_DOCTOR
    waiting_patient = Patient.objects.filter(current_status='WAITING_DOCTOR').first()
    
    if not waiting_patient:
        print("\n❌ No patients with WAITING_DOCTOR status found")
        print("   Creating a test patient...")
        
        # Create a test patient
        waiting_patient = Patient.objects.create(
            patient_id='TEST99',
            full_name='Test Patient for API',
            phone_number='0700000000',
            date_of_birth='1990-01-01',
            gender='MALE',
            current_status='WAITING_DOCTOR',
            current_location='Doctor Queue'
        )
        print(f"✅ Created test patient: {waiting_patient.patient_id}")
    
    print(f"\nTesting with patient: {waiting_patient.full_name} ({waiting_patient.patient_id})")
    print(f"Patient status: {waiting_patient.current_status}")
    
    # Create API client
    client = Client()
    
    # Login to get token
    from rest_framework.authtoken.models import Token
    token, created = Token.objects.get_or_create(user=doctor)
    
    print(f"\nAuth token: {token.key[:20]}...")
    
    # Test 1: Call start_consultation API
    print(f"\n{'='*80}")
    print(f"TEST 1: Start consultation for WAITING_DOCTOR patient")
    print(f"{'='*80}")
    
    url = '/api/doctor/start-consultation/'
    headers = {
        'HTTP_AUTHORIZATION': f'Token {token.key}',
    }
    data = {'patient_id': waiting_patient.patient_id}
    
    response = client.post(url, data=data, content_type='application/json', **headers)
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Content-Type: {response.get('Content-Type')}")
    
    if response.status_code in [200, 201]:
        response_data = json.loads(response.content)
        print(f"✅ SUCCESS - Response JSON:")
        print(json.dumps(response_data, indent=2))
        
        # Verify patient status changed
        waiting_patient.refresh_from_db()
        print(f"\nPatient status after API call: {waiting_patient.current_status}")
        if waiting_patient.current_status == 'WITH_DOCTOR':
            print(f"✅ Patient status correctly updated to WITH_DOCTOR")
        else:
            print(f"❌ Patient status NOT updated (still {waiting_patient.current_status})")
    else:
        print(f"❌ FAILED - Status {response.status_code}")
        try:
            response_data = json.loads(response.content)
            print(f"Error JSON:")
            print(json.dumps(response_data, indent=2))
        except:
            print(f"Non-JSON Response:")
            print(response.content.decode('utf-8')[:500])
    
    # Test 2: Try to start consultation again (should fail with proper JSON error)
    print(f"\n{'='*80}")
    print(f"TEST 2: Try to start consultation again (duplicate check)")
    print(f"{'='*80}")
    
    response2 = client.post(url, data=data, content_type='application/json', **headers)
    
    print(f"Response Status: {response2.status_code}")
    print(f"Response Content-Type: {response2.get('Content-Type')}")
    
    if response2.status_code == 400:
        try:
            response_data = json.loads(response2.content)
            print(f"✅ Proper JSON error returned:")
            print(json.dumps(response_data, indent=2))
        except:
            print(f"❌ Non-JSON response (this is the bug!):")
            print(response2.content.decode('utf-8')[:500])
    else:
        print(f"Unexpected status: {response2.status_code}")
    
    # Test 3: Call without auth token (should return proper error)
    print(f"\n{'='*80}")
    print(f"TEST 3: Call without auth token")
    print(f"{'='*80}")
    
    response3 = client.post(url, data=data, content_type='application/json')
    
    print(f"Response Status: {response3.status_code}")
    print(f"Response Content-Type: {response3.get('Content-Type')}")
    
    if response3.status_code == 401 or response3.status_code == 403:
        print(f"✅ Correctly returns auth error")
        # Check if it's JSON or HTML
        if 'application/json' in response3.get('Content-Type', ''):
            print(f"✅ Returns JSON")
        else:
            print(f"⚠️ Returns HTML (this causes JSON.parse error in frontend)")
            print(f"First 200 chars: {response3.content.decode('utf-8')[:200]}")
    
    print(f"\n{'='*80}\n")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
