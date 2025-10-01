#!/usr/bin/env python
"""
Cleanup script: Reset patients stuck WITH_DOCTOR back to WAITING_DOCTOR
and delete empty/incomplete consultations
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from patients.models import Patient
from doctor.models import Consultation
from django.db.models import Q

print(f"\n{'='*80}")
print(f"CLEANUP: Reset Stuck Patients")
print(f"{'='*80}\n")

# Find incomplete consultations (no diagnosis and IN_PROGRESS)
incomplete_consultations = Consultation.objects.filter(
    Q(status='IN_PROGRESS') & (Q(diagnosis='') | Q(diagnosis__isnull=True))
)

print(f"Found {incomplete_consultations.count()} incomplete consultations (no diagnosis)\n")

reset_count = 0
deleted_count = 0

for consultation in incomplete_consultations:
    try:
        patient = Patient.objects.get(patient_id=consultation.patient_id)
        
        print(f"Patient: {patient.full_name} ({patient.patient_id})")
        print(f"  Current Status: {patient.current_status}")
        print(f"  Consultation: {consultation.id}")
        print(f"  Diagnosis: '{consultation.diagnosis or 'Empty'}'")
        
        # Reset patient to WAITING_DOCTOR
        if patient.current_status == 'WITH_DOCTOR':
            patient.current_status = 'WAITING_DOCTOR'
            patient.current_location = 'Doctor Queue'
            patient.save()
            print(f"  ✅ Reset to WAITING_DOCTOR")
            reset_count += 1
        
        # Delete the empty consultation
        consultation.delete()
        print(f"  ✅ Deleted incomplete consultation")
        deleted_count += 1
        print()
        
    except Patient.DoesNotExist:
        print(f"  ⚠️ Patient {consultation.patient_id} not found")
        print()

print(f"{'='*80}")
print(f"CLEANUP COMPLETE:")
print(f"  Patients reset: {reset_count}")
print(f"  Consultations deleted: {deleted_count}")
print(f"{'='*80}\n")

# Show final state
waiting = Patient.objects.filter(current_status='WAITING_DOCTOR').count()
with_doc = Patient.objects.filter(current_status='WITH_DOCTOR').count()
in_prog = Consultation.objects.filter(status='IN_PROGRESS').count()

print(f"FINAL STATE:")
print(f"  WAITING_DOCTOR: {waiting}")
print(f"  WITH_DOCTOR: {with_doc}")
print(f"  IN_PROGRESS consultations: {in_prog}")
print(f"\n{'='*80}\n")
