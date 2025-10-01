#!/usr/bin/env python
"""
Check patient PAT71 status and consultation
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from patients.models import Patient
from doctor.models import Consultation

print(f"\n{'='*80}")
print(f"PATIENT PAT71 STATUS CHECK")
print(f"{'='*80}\n")

try:
    patient = Patient.objects.get(patient_id='PAT71')
    
    print(f"Patient: {patient.full_name}")
    print(f"Patient ID: {patient.patient_id}")
    print(f"Current Status: {patient.current_status}")
    print(f"Current Location: {patient.current_location}")
    print(f"Last Updated: {patient.updated_at}")
    
    # Get consultations
    consultations = Consultation.objects.filter(patient_id='PAT71').order_by('-consultation_date')
    
    print(f"\n{'='*80}")
    print(f"CONSULTATIONS FOR PAT71: {consultations.count()}")
    print(f"{'='*80}\n")
    
    for consultation in consultations:
        print(f"Consultation ID: {consultation.id}")
        print(f"  Status: {consultation.status}")
        print(f"  Diagnosis: {consultation.diagnosis or 'N/A'}")
        print(f"  Doctor: {consultation.doctor.full_name if consultation.doctor else 'N/A'}")
        print(f"  Date: {consultation.consultation_date}")
        print(f"  Completed: {consultation.completed_at or 'Not completed'}")
        print()
    
    # Check if there's an IN_PROGRESS consultation
    in_progress = consultations.filter(status='IN_PROGRESS').first()
    
    if in_progress:
        print(f"⚠️ PROBLEM FOUND:")
        print(f"  Patient has IN_PROGRESS consultation: {in_progress.id}")
        print(f"  But current_status is: {patient.current_status}")
        print(f"\n💡 SOLUTION:")
        print(f"  Patient status should be: WITH_DOCTOR")
        print(f"  This is why start_consultation fails (duplicate check)")
        
        # Update the patient status
        print(f"\n🔧 FIXING...")
        patient.current_status = 'WITH_DOCTOR'
        patient.current_location = f'Consultation Room - Dr. {in_progress.doctor.full_name}'
        patient.save()
        print(f"✅ Updated patient status to WITH_DOCTOR")
        print(f"✅ Patient should now disappear from queue")
    else:
        print(f"✅ No IN_PROGRESS consultations found")
        
except Patient.DoesNotExist:
    print("Patient PAT71 not found")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print(f"\n{'='*80}\n")
