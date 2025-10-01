#!/usr/bin/env python
"""
Test script to verify medication payment creation workflow.
Tests the complete flow: prescription creation → consultation completion → payment creation
"""

import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from doctor.models import Consultation, Prescription
from finance.models import ServicePayment
from patients.models import Patient
from auth_portal.models import User

def test_medication_payment_workflow():
    """Test that medication payments are created when prescriptions exist"""

    print("\n" + "="*80)
    print("TESTING MEDICATION PAYMENT WORKFLOW")
    print("="*80)

    # Get a recent completed consultation
    consultation = Consultation.objects.filter(status='COMPLETED').order_by('-completed_at').first()

    if not consultation:
        print("❌ No completed consultations found")
        return

    print(f"\n📋 CONSULTATION: {consultation.id}")
    print(f"   Patient: {consultation.patient_name} ({consultation.patient_id})")
    print(f"   Diagnosis: {consultation.diagnosis}")
    print(f"   Status: {consultation.status}")
    print(f"   Completed: {consultation.completed_at}")

    # Check prescriptions
    prescriptions = consultation.prescriptions.all()
    print(f"\n💊 PRESCRIPTIONS: {prescriptions.count()} total")

    total_med_cost = Decimal('0')
    for i, prescription in enumerate(prescriptions, 1):
        print(f"\n   {i}. {prescription.medication_name}")
        print(f"      Generic: {prescription.generic_name}")
        print(f"      Medication ID: {prescription.medication_id}")
        print(f"      Unit Price: {prescription.unit_price} TZS")
        print(f"      Quantity: {prescription.quantity_prescribed}")
        print(f"      Total Cost: {prescription.total_cost} TZS")
        total_med_cost += prescription.total_cost

    print(f"\n   💰 TOTAL MEDICATION COST: {total_med_cost} TZS")

    # Check payments
    patient = Patient.objects.get(patient_id=consultation.patient_id)
    payments = ServicePayment.objects.filter(
        patient_id=patient.patient_id,
        reference_id=consultation.id
    )

    print(f"\n💳 PAYMENTS for this consultation: {payments.count()} total")

    consultation_payment = payments.filter(service_type='CONSULTATION').first()
    medication_payment = payments.filter(service_type='MEDICATION').first()

    if consultation_payment:
        print(f"\n   ✅ CONSULTATION PAYMENT:")
        print(f"      ID: {consultation_payment.id}")
        print(f"      Amount: {consultation_payment.amount} TZS")
        print(f"      Status: {consultation_payment.status}")
    else:
        print(f"\n   ❌ NO CONSULTATION PAYMENT FOUND")

    if medication_payment:
        print(f"\n   ✅ MEDICATION PAYMENT:")
        print(f"      ID: {medication_payment.id}")
        print(f"      Amount: {medication_payment.amount} TZS")
        print(f"      Status: {medication_payment.status}")
        print(f"      Service: {medication_payment.service_name}")
    else:
        if prescriptions.exists() and total_med_cost > 0:
            print(f"\n   ❌ NO MEDICATION PAYMENT FOUND (but prescriptions exist with cost!)")
            print(f"      Expected amount: {total_med_cost} TZS")
        else:
            print(f"\n   ℹ️  No medication payment (no prescriptions or zero cost)")

    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)

    if prescriptions.exists():
        if medication_payment and medication_payment.amount == total_med_cost:
            print("✅ Medication payment workflow is working correctly!")
        elif medication_payment:
            print(f"⚠️  Medication payment exists but amount mismatch:")
            print(f"   Expected: {total_med_cost} TZS")
            print(f"   Actual: {medication_payment.amount} TZS")
        else:
            print("❌ Medication payment NOT created (BUG!)")
    else:
        print("ℹ️  No prescriptions in this consultation, no medication payment expected")

    if consultation_payment:
        print("✅ Consultation payment created")
    else:
        print("❌ Consultation payment NOT created (BUG!)")

    print("\n")

if __name__ == '__main__':
    test_medication_payment_workflow()
