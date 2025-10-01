#!/usr/bin/env python
"""
COMPLETE DATABASE RESET - Removes all patient data but keeps users and schema
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from patients.models import Patient, PatientStatusHistory
from doctor.models import Consultation, Prescription, LabTestRequest
from finance.models import ServicePayment, RevenueRecord
from django.db import connection

print(f"\n{'='*80}")
print(f"DATABASE RESET - COMPLETE CLEAN SLATE")
print(f"{'='*80}\n")

# Show current state
print("CURRENT DATABASE STATE:")
print("-" * 80)
print(f"Patients: {Patient.objects.count()}")
print(f"Consultations: {Consultation.objects.count()}")
print(f"Prescriptions: {Prescription.objects.count()}")
print(f"Lab Requests: {LabTestRequest.objects.count()}")
print(f"Service Payments: {ServicePayment.objects.count()}")
print(f"Revenue Records: {RevenueRecord.objects.count()}")
print(f"Patient Status History: {PatientStatusHistory.objects.count()}")

print(f"\n{'='*80}")
confirm = input("⚠️  WARNING: This will DELETE ALL patient data!\nType 'YES DELETE EVERYTHING' to confirm: ")

if confirm != "YES DELETE EVERYTHING":
    print("\n❌ Reset cancelled. No changes made.")
    exit(0)

print(f"\n{'='*80}")
print("DELETING ALL PATIENT DATA...")
print("-" * 80)

try:
    # Delete in correct order to avoid foreign key constraints
    
    print("\n1. Deleting Lab Requests...")
    count = LabTestRequest.objects.all().delete()[0]
    print(f"   ✅ Deleted {count} lab requests")
    
    print("\n2. Deleting Prescriptions...")
    count = Prescription.objects.all().delete()[0]
    print(f"   ✅ Deleted {count} prescriptions")
    
    print("\n3. Deleting Consultations...")
    count = Consultation.objects.all().delete()[0]
    print(f"   ✅ Deleted {count} consultations")
    
    print("\n4. Deleting Service Payments...")
    count = ServicePayment.objects.all().delete()[0]
    print(f"   ✅ Deleted {count} service payments")
    
    print("\n5. Deleting Revenue Records...")
    count = RevenueRecord.objects.all().delete()[0]
    print(f"   ✅ Deleted {count} revenue records")
    
    print("\n6. Deleting Patient Status History...")
    count = PatientStatusHistory.objects.all().delete()[0]
    print(f"   ✅ Deleted {count} status history records")
    
    print("\n7. Deleting Patients...")
    count = Patient.objects.all().delete()[0]
    print(f"   ✅ Deleted {count} patients")
    
    # Reset auto-increment sequences
    print("\n8. Resetting ID sequences...")
    with connection.cursor() as cursor:
        tables = [
            'patients_patient',
            'doctor_consultation',
            'doctor_prescription',
            'doctor_labrequest',
            'finance_servicepayment',
            'finance_revenuerecord',
            'patients_patientstatushistory'
        ]
        for table in tables:
            try:
                cursor.execute(f"ALTER SEQUENCE {table}_id_seq RESTART WITH 1")
                print(f"   ✅ Reset sequence for {table}")
            except Exception as e:
                print(f"   ⚠️  Could not reset {table}: {e}")
    
    print(f"\n{'='*80}")
    print("DATABASE RESET COMPLETE!")
    print("-" * 80)
    print("✅ All patient data deleted")
    print("✅ All consultations deleted")
    print("✅ All prescriptions deleted")
    print("✅ All lab requests deleted")
    print("✅ All payments deleted")
    print("✅ All patient history deleted")
    print("✅ ID sequences reset")
    print("\n✨ Database is now clean and ready for fresh testing!")
    
    # Show final state
    print(f"\n{'='*80}")
    print("FINAL DATABASE STATE:")
    print("-" * 80)
    print(f"Patients: {Patient.objects.count()}")
    print(f"Consultations: {Consultation.objects.count()}")
    print(f"Prescriptions: {Prescription.objects.count()}")
    print(f"Lab Requests: {LabTestRequest.objects.count()}")
    print(f"Service Payments: {ServicePayment.objects.count()}")
    print(f"Revenue Records: {RevenueRecord.objects.count()}")
    print(f"Patient Status History: {PatientStatusHistory.objects.count()}")
    print(f"{'='*80}\n")
    
    print("🎯 NEXT STEPS:")
    print("1. Go to Reception → Register a new patient (this will be PAT1)")
    print("2. Pay file fee (2,000 TZS)")
    print("3. Doctor → Start consultation → Fill & save")
    print("4. Finance → Process consultation payment (5,000 TZS)")
    print("5. Check Payment History → Should see both payments")
    print("\n✅ Everything will work cleanly with the new code!")
    
except Exception as e:
    print(f"\n❌ ERROR during reset: {e}")
    import traceback
    traceback.print_exc()
    print("\n⚠️  Database may be in inconsistent state. Check errors above.")

print(f"\n{'='*80}\n")
