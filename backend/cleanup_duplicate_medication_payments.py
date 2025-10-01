#!/usr/bin/env python
"""
Cleanup script to remove duplicate medication payments.
Keeps the consultation-level medication payment (reference_id = consultation_id)
Deletes individual prescription payments (reference_id = prescription_id)
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from finance.models import ServicePayment
from doctor.models import Prescription, Consultation

def cleanup_duplicate_medication_payments():
    print("\n" + "="*80)
    print("CLEANING UP DUPLICATE MEDICATION PAYMENTS")
    print("="*80)

    # Find all PENDING medication payments
    medication_payments = ServicePayment.objects.filter(
        service_type='MEDICATION',
        status='PENDING'
    ).order_by('patient_id', 'created_at')

    print(f"\n📊 Found {medication_payments.count()} pending medication payments")

    # Group by patient
    patients = {}
    for payment in medication_payments:
        if payment.patient_id not in patients:
            patients[payment.patient_id] = []
        patients[payment.patient_id].append(payment)

    # Analyze each patient
    to_delete = []
    to_keep = []

    for patient_id, payments in patients.items():
        print(f"\n👤 Patient: {patient_id} - {len(payments)} medication payments")

        for payment in payments:
            # Check if reference_id is a consultation or prescription
            is_consultation_payment = Consultation.objects.filter(id=payment.reference_id).exists()
            is_prescription_payment = Prescription.objects.filter(id=payment.reference_id).exists()

            print(f"   Payment {payment.id}:")
            print(f"     Service: {payment.service_name}")
            print(f"     Amount: {payment.amount} TZS")
            print(f"     Reference: {payment.reference_id}")

            if is_consultation_payment:
                print(f"     Type: ✅ CONSULTATION-LEVEL (KEEP)")
                to_keep.append(payment)
            elif is_prescription_payment:
                print(f"     Type: ❌ PRESCRIPTION-LEVEL (DELETE - duplicate)")
                to_delete.append(payment)
            else:
                print(f"     Type: ⚠️  UNKNOWN REFERENCE")

    # Summary
    print("\n" + "="*80)
    print("CLEANUP SUMMARY")
    print("="*80)
    print(f"Payments to KEEP: {len(to_keep)}")
    print(f"Payments to DELETE: {len(to_delete)}")

    if to_delete:
        print("\n⚠️  The following payments will be DELETED:")
        for payment in to_delete:
            print(f"  - {payment.patient_id}: {payment.service_name} ({payment.amount} TZS)")

        print("\n🔥 Auto-deleting duplicates...")
        for payment in to_delete:
            print(f"Deleting payment {payment.id}...")
            payment.delete()
        print(f"\n✅ Deleted {len(to_delete)} duplicate payments")
    else:
        print("\n✅ No duplicate payments to delete")

if __name__ == '__main__':
    cleanup_duplicate_medication_payments()
