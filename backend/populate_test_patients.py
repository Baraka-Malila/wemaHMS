#!/usr/bin/env python3
"""
Populate test patients script for WEMA HMS
Run this to create 50 test patients for development/testing
"""

import os
import sys
import django
from datetime import date, timedelta
import random

# Add the backend directory to Python path
sys.path.append('/home/cyberpunk/WEMA-HMS/backend')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from patients.models import Patient
from django.utils import timezone

# Sample data
first_names = [
    'John', 'Mary', 'David', 'Sarah', 'Michael', 'Lisa', 'James', 'Jennifer', 'Robert', 'Patricia',
    'William', 'Linda', 'Richard', 'Barbara', 'Joseph', 'Elizabeth', 'Thomas', 'Jessica', 'Christopher', 'Susan',
    'Charles', 'Margaret', 'Daniel', 'Carol', 'Matthew', 'Dorothy', 'Anthony', 'Nancy', 'Mark', 'Helen',
    'Donald', 'Sharon', 'Steven', 'Michelle', 'Paul', 'Emily', 'Andrew', 'Kimberly', 'Joshua', 'Donna',
    'Kenneth', 'Angela', 'Kevin', 'Amy', 'Brian', 'Brenda', 'George', 'Emma', 'Timothy', 'Olivia'
]

last_names = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
]

streets = ['Main St', 'Oak Ave', 'Park Rd', 'First St', 'Second St', 'Elm St', 'Cedar Ave', 'Pine St', 'Maple Dr', 'Church St']
medical_histories = [
    'No known allergies', 'Allergic to penicillin', 'Hypertension', 'Type 2 diabetes', 
    'Asthma', 'No significant medical history', 'Arthritis', 'Previous surgery - appendix',
    'Heart condition - controlled', 'Migraine headaches'
]
insurance_providers = ['NHIF', 'AAR', 'Jubilee', 'CIC', 'Madison', 'Heritage', 'None']

def create_test_patients():
    print("Starting patient creation...")
    
    # Get or create a default user for patient registration
    try:
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            # Create admin user if none exists
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@wema.com',
                password='admin123',
                is_superuser=True,
                is_staff=True
            )
            print("Created admin user for patient registration")
    except Exception as e:
        print(f"Error with admin user: {e}")
        return

    created_count = 0
    
    for i in range(50):
        try:
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            
            # Generate phone number
            phone = f"+254{random.randint(700000000, 799999999)}"
            
            # Generate age between 18 and 80
            age = random.randint(18, 80)
            birth_date = date.today() - timedelta(days=age * 365 + random.randint(0, 365))
            
            # Create patient
            patient = Patient.objects.create(
                full_name=f"{first_name} {last_name}",
                phone_number=phone,
                gender=random.choice(['MALE', 'FEMALE']),
                date_of_birth=birth_date,
                emergency_contact_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                emergency_contact_phone=f"+254{random.randint(700000000, 799999999)}",
                address=f"{random.randint(1, 999)} {random.choice(streets)}, Dar es Salaam",
                blood_group=random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
                allergies=random.choice(medical_histories),
                chronic_conditions=random.choice(['None', 'Hypertension', 'Diabetes', 'Asthma', 'Heart disease']),
                weight=random.uniform(50.0, 120.0),
                height=random.uniform(150.0, 190.0),
                current_status=random.choice(['REGISTERED', 'WAITING_DOCTOR', 'WITH_DOCTOR', 'COMPLETED']),
                current_location=random.choice(['Reception', 'Doctor Office 1', 'Doctor Office 2', 'Lab', 'Pharmacy']),
                file_fee_paid=random.choice([True, False]),
                created_by=admin_user
            )
            
            created_count += 1
            print(f"Created patient {created_count}: {patient.patient_id} - {patient.full_name}")
            
        except Exception as e:
            print(f"Error creating patient {i+1}: {e}")
            continue
    
    print(f"\n✅ Successfully created {created_count} test patients!")
    print(f"Total patients in database: {Patient.objects.count()}")

if __name__ == "__main__":
    create_test_patients()
