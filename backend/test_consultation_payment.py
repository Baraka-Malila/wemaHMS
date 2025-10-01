#!/usr/bin/env python
"""
Test consultation payment creation flow
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from finance.models import ServicePayment
from doctor.models import Consultation
from patients.models import Patient
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

print(f"\n{'='*80}")
print(f"CONSULTATION PAYMENT FLOW TEST")
print(f"{'='*80}\n")

# Get a patient who had a consultation
try:
    # Find the consultation from Sept 29 that has a payment
    consultation_payment = ServicePayment.objects.filter(
        service_type='CONSULTATION',
        status='PAID'
    ).first()
    
    if consultation_payment:
        print(f"Found existing consultation payment:")
        print(f"  Patient: {consultation_payment.patient_name} ({consultation_payment.patient_id})")
        print(f"  Amount: {consultation_payment.amount} TZS")
        print(f"  Payment Date: {consultation_payment.payment_date}")
        print(f"  Status: {consultation_payment.status}")
        print(f"  Reference ID: {consultation_payment.reference_id}")
        
        # Check if consultation exists
        if consultation_payment.reference_id:
            try:
                # Validate it's a proper UUID before querying
                import uuid
                uuid.UUID(str(consultation_payment.reference_id))
                
                consultation = Consultation.objects.get(id=consultation_payment.reference_id)
                print(f"\n  Linked Consultation:")
                print(f"    Diagnosis: {consultation.diagnosis}")
                print(f"    Status: {consultation.status}")
                print(f"    Doctor: {consultation.doctor.full_name if consultation.doctor else 'N/A'}")
                print(f"    Completed: {consultation.completed_at}")
            except (Consultation.DoesNotExist, ValueError):
                print(f"\n  ⚠️ No valid consultation linked (reference_id: {consultation_payment.reference_id})")
        else:
            print(f"\n  ⚠️ No consultation reference")
    else:
        print("No paid consultation payments found in database")
        
    # Check for PENDING consultation payments
    pending_consultations = ServicePayment.objects.filter(
        service_type='CONSULTATION',
        status='PENDING'
    )
    
    print(f"\n{'='*80}")
    print(f"PENDING CONSULTATION PAYMENTS: {pending_consultations.count()}")
    print(f"{'='*80}")
    
    if pending_consultations.count() > 0:
        for payment in pending_consultations:
            print(f"\nPatient: {payment.patient_name} ({payment.patient_id})")
            print(f"  Amount: {payment.amount} TZS")
            print(f"  Service: {payment.service_name}")
            print(f"  Created: {payment.created_at}")
            print(f"  Reference: {payment.reference_id}")
    else:
        print("\nNo pending consultation payments.")
        print("ℹ️ This is expected if no consultations have been completed today.")
        print("   Complete a consultation to test the payment creation flow.")
    
    # Show all consultations
    print(f"\n{'='*80}")
    print(f"ALL CONSULTATIONS")
    print(f"{'='*80}")
    
    consultations = Consultation.objects.all().order_by('-consultation_date')
    print(f"Total consultations: {consultations.count()}\n")
    
    for consultation in consultations[:5]:  # Show first 5
        print(f"Patient: {consultation.patient_name} ({consultation.patient_id})")
        print(f"  Diagnosis: {consultation.diagnosis or 'N/A'}")
        print(f"  Status: {consultation.status}")
        print(f"  Date: {consultation.consultation_date}")
        print(f"  Doctor: {consultation.doctor.full_name if consultation.doctor else 'N/A'}")
        
        # Check if payment exists
        payment = ServicePayment.objects.filter(
            service_type='CONSULTATION',
            reference_id=consultation.id
        ).first()
        
        if payment:
            print(f"  💰 Payment: {payment.status} - {payment.amount} TZS")
        else:
            print(f"  ⚠️ No payment linked")
        print()
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print(f"{'='*80}\n")
