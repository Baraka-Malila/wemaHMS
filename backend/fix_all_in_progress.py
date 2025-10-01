#!/usr/bin/env python
"""
Check all patients with IN_PROGRESS consultations and fix their status
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from patients.models import Patient
from doctor.models import Consultation

print(f"\n{'='*80}")
print(f"FIXING ALL PATIENTS WITH IN_PROGRESS CONSULTATIONS")
print(f"{'='*80}\n")

# Get all IN_PROGRESS consultations
in_progress_consultations = Consultation.objects.filter(status='IN_PROGRESS')

print(f"Found {in_progress_consultations.count()} IN_PROGRESS consultations\n")

fixed_count = 0

for consultation in in_progress_consultations:
    try:
        patient = Patient.objects.get(patient_id=consultation.patient_id)
        
        print(f"Patient: {patient.full_name} ({patient.patient_id})")
        print(f"  Current Status: {patient.current_status}")
        print(f"  Consultation ID: {consultation.id}")
        print(f"  Doctor: {consultation.doctor.full_name if consultation.doctor else 'N/A'}")
        
        # If patient is not WITH_DOCTOR but has IN_PROGRESS consultation, fix it
        if patient.current_status != 'WITH_DOCTOR':
            print(f"  ⚠️ Status mismatch! Should be WITH_DOCTOR")
            print(f"  🔧 Fixing...")
            
            patient.current_status = 'WITH_DOCTOR'
            patient.current_location = f'Consultation Room - Dr. {consultation.doctor.full_name}'
            patient.save()
            
            print(f"  ✅ Fixed! Status updated to WITH_DOCTOR")
            fixed_count += 1
        else:
            print(f"  ✅ Status correct (WITH_DOCTOR)")
        
        print()
        
    except Patient.DoesNotExist:
        print(f"  ❌ Patient {consultation.patient_id} not found")
        print()
    except Exception as e:
        print(f"  ❌ Error: {e}")
        print()

print(f"{'='*80}")
print(f"SUMMARY:")
print(f"  Total IN_PROGRESS consultations: {in_progress_consultations.count()}")
print(f"  Patients fixed: {fixed_count}")
print(f"{'='*80}\n")
