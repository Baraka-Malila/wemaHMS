#!/usr/bin/env python3
"""
Comprehensive medication and service data population for WEMA HMS
This script creates realistic pharmacy inventory and expands service pricing
"""

import os
import sys
import django
import random
from decimal import Decimal
from datetime import datetime, timedelta

# Add the backend directory to Python path
sys.path.append('/home/cyberpunk/WEMA-HMS/backend')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from pharmacy.models import Medication
from finance.models import ServicePricing
from django.utils import timezone

User = get_user_model()

def get_admin_user():
    """Get or create admin user for data creation"""
    admin = User.objects.filter(is_superuser=True).first()
    if not admin:
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@wema.com', 
            password='admin123'
        )
    return admin

def populate_medications():
    """Create comprehensive medication inventory"""
    print("Creating medication inventory...")
    
    admin = get_admin_user()
    
    # Comprehensive medication database with realistic Tanzanian pricing
    medications = [
        # ANALGESICS (Pain Relief)
        {
            'name': 'Panadol 500mg',
            'generic_name': 'Paracetamol',
            'manufacturer': 'GSK Tanzania',
            'category': 'ANALGESIC',
            'unit_price': Decimal('500.00'),
            'current_stock': 500,
            'reorder_level': 50,
            'supplier': 'Shelys Pharmaceuticals'
        },
        {
            'name': 'Brufen 400mg',
            'generic_name': 'Ibuprofen', 
            'manufacturer': 'Abbott Tanzania',
            'category': 'ANALGESIC',
            'unit_price': Decimal('800.00'),
            'current_stock': 300,
            'reorder_level': 30,
            'supplier': 'Shelys Pharmaceuticals'
        },
        {
            'name': 'Aspirin 300mg',
            'generic_name': 'Acetylsalicylic Acid',
            'manufacturer': 'Bayer East Africa',
            'category': 'ANALGESIC',
            'unit_price': Decimal('400.00'),
            'current_stock': 400,
            'reorder_level': 40,
            'supplier': 'Medics Pharmaceuticals'
        },
        
        # ANTIBIOTICS
        {
            'name': 'Amoxil 500mg',
            'generic_name': 'Amoxicillin',
            'manufacturer': 'GSK Tanzania',
            'category': 'ANTIBIOTIC',
            'unit_price': Decimal('1200.00'),
            'current_stock': 200,
            'reorder_level': 25,
            'supplier': 'Shelys Pharmaceuticals',
            'requires_prescription': True
        },
        {
            'name': 'Augmentin 625mg',
            'generic_name': 'Amoxicillin + Clavulanic Acid',
            'manufacturer': 'GSK Tanzania',
            'category': 'ANTIBIOTIC', 
            'unit_price': Decimal('2500.00'),
            'current_stock': 150,
            'reorder_level': 20,
            'supplier': 'Shelys Pharmaceuticals',
            'requires_prescription': True
        },
        {
            'name': 'Cipro 500mg',
            'generic_name': 'Ciprofloxacin',
            'manufacturer': 'Cipla Tanzania',
            'category': 'ANTIBIOTIC',
            'unit_price': Decimal('1800.00'),
            'current_stock': 100,
            'reorder_level': 15,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': True
        },
        {
            'name': 'Azithromycin 250mg',
            'generic_name': 'Azithromycin',
            'manufacturer': 'Pfizer Tanzania',
            'category': 'ANTIBIOTIC',
            'unit_price': Decimal('3000.00'),
            'current_stock': 80,
            'reorder_level': 10,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': True
        },
        
        # CARDIOVASCULAR
        {
            'name': 'Norvasc 5mg',
            'generic_name': 'Amlodipine',
            'manufacturer': 'Pfizer Tanzania',
            'category': 'CARDIAC',
            'unit_price': Decimal('1500.00'),
            'current_stock': 120,
            'reorder_level': 20,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': True
        },
        {
            'name': 'Lisinopril 10mg',
            'generic_name': 'Lisinopril',
            'manufacturer': 'Lupin Tanzania',
            'category': 'CARDIAC',
            'unit_price': Decimal('1200.00'),
            'current_stock': 100,
            'reorder_level': 15,
            'supplier': 'Shelys Pharmaceuticals',
            'requires_prescription': True
        },
        
        # DIABETES
        {
            'name': 'Glucophage 500mg',
            'generic_name': 'Metformin',
            'manufacturer': 'Merck Tanzania',
            'category': 'DIABETES',
            'unit_price': Decimal('800.00'),
            'current_stock': 200,
            'reorder_level': 30,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': True
        },
        {
            'name': 'Glibenclamide 5mg',
            'generic_name': 'Glibenclamide',
            'manufacturer': 'Cipla Tanzania',
            'category': 'DIABETES',
            'unit_price': Decimal('600.00'),
            'current_stock': 150,
            'reorder_level': 25,
            'supplier': 'Shelys Pharmaceuticals',
            'requires_prescription': True
        },
        
        # RESPIRATORY
        {
            'name': 'Ventolin Inhaler',
            'generic_name': 'Salbutamol',
            'manufacturer': 'GSK Tanzania',
            'category': 'RESPIRATORY',
            'unit_price': Decimal('15000.00'),
            'current_stock': 50,
            'reorder_level': 10,
            'supplier': 'Shelys Pharmaceuticals',
            'requires_prescription': True
        },
        {
            'name': 'Prednisolone 5mg',
            'generic_name': 'Prednisolone',
            'manufacturer': 'Cipla Tanzania',
            'category': 'RESPIRATORY',
            'unit_price': Decimal('700.00'),
            'current_stock': 200,
            'reorder_level': 25,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': True
        },
        
        # VITAMINS & SUPPLEMENTS
        {
            'name': 'Vitamin C 500mg',
            'generic_name': 'Ascorbic Acid',
            'manufacturer': 'Ranbaxy Tanzania',
            'category': 'VITAMIN',
            'unit_price': Decimal('300.00'),
            'current_stock': 500,
            'reorder_level': 50,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': False
        },
        {
            'name': 'Folic Acid 5mg',
            'generic_name': 'Folic Acid',
            'manufacturer': 'Cipla Tanzania',
            'category': 'VITAMIN',
            'unit_price': Decimal('200.00'),
            'current_stock': 300,
            'reorder_level': 40,
            'supplier': 'Shelys Pharmaceuticals',
            'requires_prescription': False
        },
        {
            'name': 'Iron + Folate',
            'generic_name': 'Ferrous Sulfate + Folic Acid',
            'manufacturer': 'Ranbaxy Tanzania',
            'category': 'VITAMIN',
            'unit_price': Decimal('400.00'),
            'current_stock': 250,
            'reorder_level': 30,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': False
        },
        
        # ANTIMALARIALS
        {
            'name': 'Coartem',
            'generic_name': 'Artemether + Lumefantrine',
            'manufacturer': 'Novartis Tanzania',
            'category': 'ANTIVIRAL',
            'unit_price': Decimal('8000.00'),
            'current_stock': 100,
            'reorder_level': 20,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': True
        },
        {
            'name': 'Quinine 300mg',
            'generic_name': 'Quinine Sulfate',
            'manufacturer': 'Cipla Tanzania',
            'category': 'ANTIVIRAL',
            'unit_price': Decimal('1500.00'),
            'current_stock': 80,
            'reorder_level': 15,
            'supplier': 'Shelys Pharmaceuticals',
            'requires_prescription': True
        },
        
        # COMMON OTC MEDICATIONS
        {
            'name': 'ORS Sachets',
            'generic_name': 'Oral Rehydration Salts',
            'manufacturer': 'WHO Standard',
            'category': 'OTHER',
            'unit_price': Decimal('300.00'),
            'current_stock': 500,
            'reorder_level': 100,
            'supplier': 'Multiple Suppliers',
            'requires_prescription': False
        },
        {
            'name': 'Zinc Tablets 20mg',
            'generic_name': 'Zinc Sulfate',
            'manufacturer': 'Ranbaxy Tanzania',
            'category': 'VITAMIN',
            'unit_price': Decimal('250.00'),
            'current_stock': 400,
            'reorder_level': 50,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': False
        },
        
        # TOPICAL MEDICATIONS
        {
            'name': 'Gentamicin Cream',
            'generic_name': 'Gentamicin Sulfate',
            'manufacturer': 'Cipla Tanzania',
            'category': 'ANTIBIOTIC',
            'unit_price': Decimal('2000.00'),
            'current_stock': 80,
            'reorder_level': 15,
            'supplier': 'Shelys Pharmaceuticals',
            'requires_prescription': True
        },
        {
            'name': 'Hydrocortisone Cream 1%',
            'generic_name': 'Hydrocortisone',
            'manufacturer': 'GSK Tanzania',
            'category': 'OTHER',
            'unit_price': Decimal('1800.00'),
            'current_stock': 60,
            'reorder_level': 10,
            'supplier': 'Medics Pharmaceuticals',
            'requires_prescription': True
        }
    ]
    
    created_count = 0
    for med_data in medications:
        try:
            # Generate realistic barcode
            barcode = f"TZ{random.randint(100000, 999999)}"
            
            medication = Medication.objects.create(
                name=med_data['name'],
                generic_name=med_data['generic_name'],
                manufacturer=med_data['manufacturer'],
                category=med_data['category'],
                barcode=barcode,
                unit_price=med_data['unit_price'],
                current_stock=med_data['current_stock'],
                reorder_level=med_data['reorder_level'],
                supplier=med_data['supplier'],
                requires_prescription=med_data.get('requires_prescription', True),
                is_active=True,
                last_restocked=timezone.now() - timedelta(days=random.randint(1, 30)),
                created_by=admin
            )
            
            created_count += 1
            print(f"✅ {medication.name} - {medication.unit_price} TZS (Stock: {medication.current_stock})")
            
        except Exception as e:
            print(f"❌ Error creating {med_data['name']}: {e}")
    
    print(f"\n🎉 Created {created_count} medications successfully!")
    return created_count

def expand_service_pricing():
    """Add comprehensive service pricing matching frontend lab tests exactly"""
    print("\nExpanding service pricing...")
    
    admin = get_admin_user()
    
    additional_services = [
        # ===== PARASITOLOGY LAB TESTS (From Frontend) =====
        {
            'service_name': 'MRDT (Malaria Rapid Diagnostic Test)',
            'service_code': 'LAB_MRDT',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('8000.00'),
            'emergency_price': Decimal('12000.00'),
            'department': 'LAB',
            'description': 'Malaria rapid diagnostic test'
        },
        {
            'service_name': 'BS (Blood Smear)',
            'service_code': 'LAB_BS',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('10000.00'),
            'emergency_price': Decimal('15000.00'),
            'department': 'LAB',
            'description': 'Blood smear for malaria parasites'
        },
        {
            'service_name': 'Stool Analysis',
            'service_code': 'LAB_STOOL_ANALYSIS',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('12000.00'),
            'emergency_price': Decimal('18000.00'),
            'department': 'LAB',
            'description': 'Stool analysis - macroscopic and microscopic examination'
        },
        {
            'service_name': 'Urine SED (Sediment)',
            'service_code': 'LAB_URINE_SED',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('10000.00'),
            'emergency_price': Decimal('15000.00'),
            'department': 'LAB',
            'description': 'Urine sediment examination - macroscopic and microscopic'
        },
        {
            'service_name': 'Urinalysis',
            'service_code': 'LAB_URINALYSIS',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('15000.00'),
            'emergency_price': Decimal('22000.00'),
            'department': 'LAB',
            'description': 'Complete urinalysis - Urobilinogen, Glucose, Bilirubin, Ketones, S.Gravity, Blood, pH, Protein, Nitrite, Leucocytes'
        },
        
        # ===== MICROBIOLOGY LAB TESTS (From Frontend) =====
        {
            'service_name': 'RPR (Rapid Plasma Reagin)',
            'service_code': 'LAB_RPR',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('12000.00'),
            'emergency_price': Decimal('18000.00'),
            'department': 'LAB',
            'description': 'Syphilis screening test'
        },
        {
            'service_name': 'H. Pylori Test',
            'service_code': 'LAB_H_PYLORI',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('18000.00'),
            'emergency_price': Decimal('25000.00'),
            'department': 'LAB',
            'description': 'Helicobacter pylori detection'
        },
        {
            'service_name': 'Hepatitis B Test',
            'service_code': 'LAB_HEPATITIS_B',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('20000.00'),
            'emergency_price': Decimal('30000.00'),
            'department': 'LAB',
            'description': 'Hepatitis B surface antigen test'
        },
        {
            'service_name': 'Hepatitis C Test',
            'service_code': 'LAB_HEPATITIS_C',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('22000.00'),
            'emergency_price': Decimal('32000.00'),
            'department': 'LAB',
            'description': 'Hepatitis C antibody test'
        },
        {
            'service_name': 'SsAT (Salmonella Antibody Test)',
            'service_code': 'LAB_SSAT',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('15000.00'),
            'emergency_price': Decimal('22000.00'),
            'department': 'LAB',
            'description': 'Salmonella serological test'
        },
        {
            'service_name': 'UPT (Urine Pregnancy Test)',
            'service_code': 'LAB_UPT',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('5000.00'),
            'emergency_price': Decimal('8000.00'),
            'department': 'LAB',
            'description': 'Urine pregnancy test'
        },
        
        # ===== CLINICAL CHEMISTRY & HEMATOLOGY (From Frontend) =====
        {
            'service_name': 'ESR (Erythrocyte Sedimentation Rate)',
            'service_code': 'LAB_ESR',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('8000.00'),
            'emergency_price': Decimal('12000.00'),
            'department': 'LAB',
            'description': 'Erythrocyte sedimentation rate test'
        },
        {
            'service_name': 'B/Grouping (Blood Grouping)',
            'service_code': 'LAB_BLOOD_GROUPING',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('10000.00'),
            'emergency_price': Decimal('15000.00'),
            'department': 'LAB',
            'description': 'Blood group and Rh factor determination'
        },
        {
            'service_name': 'Hb (Hemoglobin)',
            'service_code': 'LAB_HB',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('6000.00'),
            'emergency_price': Decimal('9000.00'),
            'department': 'LAB',
            'description': 'Hemoglobin level test'
        },
        {
            'service_name': 'Rheumatoid Factor',
            'service_code': 'LAB_RHEUMATOID_FACTOR',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('18000.00'),
            'emergency_price': Decimal('25000.00'),
            'department': 'LAB',
            'description': 'Rheumatoid arthritis screening test'
        },
        {
            'service_name': 'RBG (Random Blood Glucose)',
            'service_code': 'LAB_RBG',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('8000.00'),
            'emergency_price': Decimal('12000.00'),
            'department': 'LAB',
            'description': 'Random blood glucose test'
        },
        {
            'service_name': 'FBG (Fasting Blood Glucose)',
            'service_code': 'LAB_FBG',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('10000.00'),
            'emergency_price': Decimal('15000.00'),
            'department': 'LAB',
            'description': 'Fasting blood glucose test'
        },
        {
            'service_name': 'Sickling Test',
            'service_code': 'LAB_SICKLING_TEST',
            'service_category': 'LAB_TEST',
            'standard_price': Decimal('12000.00'),
            'emergency_price': Decimal('18000.00'),
            'department': 'LAB',
            'description': 'Sickle cell disease screening test'
        },
        
        # ===== NURSING SERVICES =====
        {
            'service_name': 'Nursing Care - Daily',
            'service_code': 'NURS_DAILY',
            'service_category': 'NURSING',
            'standard_price': Decimal('25000.00'),
            'department': 'NURSING',
            'description': 'Daily nursing care and monitoring'
        },
        {
            'service_name': 'IV Drip Administration',
            'service_code': 'NURS_IV_DRIP',
            'service_category': 'NURSING',
            'standard_price': Decimal('15000.00'),
            'department': 'NURSING',
            'description': 'Intravenous fluid administration'
        },
        {
            'service_name': 'Wound Dressing',
            'service_code': 'NURS_WOUND_DRESS',
            'service_category': 'NURSING',
            'standard_price': Decimal('10000.00'),
            'department': 'NURSING',
            'description': 'Wound cleaning and dressing'
        },
        {
            'service_name': 'Injection Administration',
            'service_code': 'NURS_INJECTION',
            'service_category': 'NURSING',
            'standard_price': Decimal('5000.00'),
            'department': 'NURSING',
            'description': 'IM/IV injection service'
        },
        {
            'service_name': 'Blood Pressure Monitoring',
            'service_code': 'NURS_BP_CHECK',
            'service_category': 'NURSING',
            'standard_price': Decimal('3000.00'),
            'department': 'NURSING',
            'description': 'Vital signs monitoring'
        },
        
        # ===== WARD/ADMISSION SERVICES =====
        {
            'service_name': 'General Ward Bed - Daily',
            'service_code': 'WARD_GENERAL_BED',
            'service_category': 'WARD',
            'standard_price': Decimal('50000.00'),
            'department': 'NURSING',
            'description': 'Daily general ward bed charge'
        },
        {
            'service_name': 'Private Room - Daily',
            'service_code': 'WARD_PRIVATE_ROOM',
            'service_category': 'WARD',
            'standard_price': Decimal('120000.00'),
            'department': 'NURSING',
            'description': 'Daily private room charge'
        },
        {
            'service_name': 'ICU Bed - Daily',
            'service_code': 'WARD_ICU_BED',
            'service_category': 'WARD',
            'standard_price': Decimal('250000.00'),
            'department': 'NURSING',
            'description': 'Intensive care unit daily charge'
        },
        
        # ===== MEDICAL PROCEDURES =====
        {
            'service_name': 'Minor Surgery',
            'service_code': 'PROC_MINOR_SURGERY',
            'service_category': 'PROCEDURE',
            'standard_price': Decimal('150000.00'),
            'emergency_price': Decimal('200000.00'),
            'department': 'DOCTOR',
            'description': 'Minor surgical procedures'
        },
        {
            'service_name': 'Suturing/Stitching',
            'service_code': 'PROC_SUTURING',
            'service_category': 'PROCEDURE',
            'standard_price': Decimal('50000.00'),
            'emergency_price': Decimal('75000.00'),
            'department': 'DOCTOR',
            'description': 'Wound suturing and stitching'
        },
        {
            'service_name': 'Catheterization',
            'service_code': 'PROC_CATHETER',
            'service_category': 'PROCEDURE',
            'standard_price': Decimal('30000.00'),
            'department': 'NURSING',
            'description': 'Urinary catheter insertion'
        },
        
        # ===== EMERGENCY SERVICES =====
        {
            'service_name': 'Ambulance Service',
            'service_code': 'EMRG_AMBULANCE',
            'service_category': 'EMERGENCY',
            'standard_price': Decimal('150000.00'),
            'department': 'EMERGENCY',
            'description': 'Emergency ambulance transport'
        },
        {
            'service_name': 'Emergency Stabilization',
            'service_code': 'EMRG_STABILIZE',
            'service_category': 'EMERGENCY',
            'standard_price': Decimal('200000.00'),
            'department': 'EMERGENCY',
            'description': 'Emergency patient stabilization'
        },
        {
            'service_name': 'Oxygen Therapy',
            'service_code': 'EMRG_OXYGEN',
            'service_category': 'EMERGENCY',
            'standard_price': Decimal('50000.00'),
            'department': 'EMERGENCY',
            'description': 'Oxygen therapy per session'
        },
    ]
    
    created_count = 0
    for service_data in additional_services:
        try:
            service, created = ServicePricing.objects.get_or_create(
                service_code=service_data['service_code'],
                defaults={
                    'service_name': service_data['service_name'],
                    'service_category': service_data['service_category'],
                    'standard_price': service_data['standard_price'],
                    'emergency_price': service_data.get('emergency_price'),
                    'department': service_data['department'],
                    'description': service_data['description'],
                    'is_active': True,
                    'created_by': admin
                }
            )
            
            if created:
                created_count += 1
                price_info = f"{service.standard_price} TZS"
                if service.emergency_price:
                    price_info += f" (Emergency: {service.emergency_price} TZS)"
                print(f"✅ {service.service_name} - {price_info}")
            
        except Exception as e:
            print(f"❌ Error creating {service_data['service_name']}: {e}")
    
    print(f"\n🎉 Added {created_count} new services!")
    return created_count

def main():
    print("🏥 WEMA HMS - Comprehensive Data Population")
    print("=" * 50)
    
    # Populate medications
    med_count = populate_medications()
    
    # Expand service pricing
    service_count = expand_service_pricing()
    
    print("\n" + "=" * 50)
    print("📊 POPULATION SUMMARY")
    print("=" * 50)
    print(f"Medications created: {med_count}")
    print(f"Services added: {service_count}")
    
    # Final database summary
    print(f"\n📈 FINAL DATABASE COUNTS")
    print(f"Total Medications: {Medication.objects.count()}")
    print(f"Total Services: {ServicePricing.objects.count()}")
    
    print("\n✅ Database population complete!")
    print("🚀 Ready for full workflow testing!")
    
    # Show some examples
    print(f"\n💊 MEDICATION EXAMPLES:")
    for med in Medication.objects.filter(is_active=True)[:5]:
        stock_status = "LOW STOCK" if med.is_low_stock else "IN STOCK"
        print(f"  • {med.name} - {med.unit_price} TZS ({med.current_stock} units - {stock_status})")
    
    print(f"\n🏥 SERVICE EXAMPLES:")
    for service in ServicePricing.objects.filter(is_active=True)[:5]:
        print(f"  • {service.service_name} - {service.standard_price} TZS ({service.service_category})")

if __name__ == "__main__":
    main()
