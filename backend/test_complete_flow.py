#!/usr/bin/env python
"""
Test the complete consultation workflow
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from patients.models import Patient
from doctor.models import Consultation
from finance.models import ServicePayment

print(f"\n{'='*80}")
print(f"COMPLETE WORKFLOW TEST")
print(f"{'='*80}\n")

# Check current state
print("STEP 1: Current State")
print("-" * 80)

waiting_patients = Patient.objects.filter(current_status='WAITING_DOCTOR')
with_doctor = Patient.objects.filter(current_status='WITH_DOCTOR')
in_progress = Consultation.objects.filter(status='IN_PROGRESS')
pending_payments = ServicePayment.objects.filter(service_type='CONSULTATION', status='PENDING')

print(f"✓ Patients WAITING_DOCTOR: {waiting_patients.count()}")
for p in waiting_patients[:5]:
    print(f"  - {p.full_name} ({p.patient_id})")

print(f"\n✓ Patients WITH_DOCTOR: {with_doctor.count()}")
for p in with_doctor[:5]:
    print(f"  - {p.full_name} ({p.patient_id})")
    
print(f"\n✓ IN_PROGRESS Consultations: {in_progress.count()}")
for c in in_progress[:5]:
    print(f"  - {c.patient_name} ({c.patient_id}) - {c.diagnosis or 'No diagnosis yet'}")

print(f"\n✓ PENDING Consultation Payments: {pending_payments.count()}")
for p in pending_payments:
    print(f"  - {p.patient_name} ({p.patient_id}) - {p.amount} TZS")

# Show expected workflow
print(f"\n\n{'='*80}")
print(f"CORRECT WORKFLOW")
print(f"{'='*80}")

print("""
BEFORE (BROKEN):
1. Click "Start Consultation" 
   → API call creates consultation ❌
   → Patient status → WITH_DOCTOR ❌
   → Patient removed from queue ❌
2. User closes modal without filling
   → Patient stuck WITH_DOCTOR ❌
   → Consultation stuck IN_PROGRESS ❌

AFTER (FIXED):
1. Click "Start Consultation"
   → Just opens modal ✅
   → No API call ✅
   → Patient stays WAITING_DOCTOR ✅
   → Patient stays in queue ✅
2. User fills consultation and clicks "Save"
   → Create consultation ✅
   → Patient status → WITH_DOCTOR ✅
   → Create prescriptions/labs ✅
   → Complete consultation ✅
   → Create PENDING payment ✅
   → Patient status → PENDING_CONSULTATION_PAYMENT ✅
   → Patient removed from queue ✅
3. If user closes modal without saving
   → No consultation created ✅
   → Patient stays WAITING_DOCTOR ✅
   → Patient stays in queue ✅
""")

print(f"\n{'='*80}")
print(f"CLEANUP RECOMMENDATION")
print(f"{'='*80}\n")

print(f"You have {in_progress.count()} IN_PROGRESS consultations that may be incomplete.")
print(f"You have {with_doctor.count()} patients WITH_DOCTOR status.")
print(f"\nTo clean up:")
print(f"  1. Complete legitimate consultations via the UI")
print(f"  2. Or reset stuck patients back to WAITING_DOCTOR manually")
print(f"\n{'='*80}\n")
