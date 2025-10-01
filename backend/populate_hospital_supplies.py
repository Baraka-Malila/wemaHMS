#!/usr/bin/env python
"""
WEMA HMS - Hospital Supplies Population Script
Populates lab equipment, medical consumables, and hospital supplies
These are expense items - NOT charged to patients
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from pharmacy.models import Medication
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

def populate_lab_equipment_and_supplies():
    """Populate lab equipment and consumables"""
    
    # Get admin user for created_by field
    admin_user = User.objects.filter(role='ADMIN').first()
    if not admin_user:
        print("❌ Error: No admin user found. Please create an admin user first.")
        return 0, 0
    
    lab_supplies = [
        # Lab Equipment (Capital Items)
        {
            'name': 'Microscope - Binocular',
            'generic_name': 'Laboratory Microscope',
            'manufacturer': 'Olympus Medical',
            'barcode': 'LAB-EQUIP-001',
            'category': 'OTHER',
            'unit_price': Decimal('1500000.00'),
            'current_stock': 2,
            'reorder_level': 0,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Centrifuge Machine',
            'generic_name': 'Laboratory Centrifuge',
            'manufacturer': 'Thermo Scientific',
            'barcode': 'LAB-EQUIP-002',
            'category': 'OTHER',
            'unit_price': Decimal('800000.00'),
            'current_stock': 1,
            'reorder_level': 0,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Glucometer',
            'generic_name': 'Blood Glucose Meter',
            'manufacturer': 'Accu-Chek',
            'barcode': 'LAB-EQUIP-003',
            'category': 'OTHER',
            'unit_price': Decimal('45000.00'),
            'current_stock': 5,
            'reorder_level': 2,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Hemoglobinometer',
            'generic_name': 'Hb Testing Device',
            'manufacturer': 'EKF Diagnostics',
            'barcode': 'LAB-EQUIP-004',
            'category': 'OTHER',
            'unit_price': Decimal('350000.00'),
            'current_stock': 2,
            'reorder_level': 1,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # Lab Consumables
        {
            'name': 'Test Tubes (Pack of 100)',
            'generic_name': 'Glass Test Tubes',
            'manufacturer': 'Various Brands',
            'barcode': 'LAB-CONS-001',
            'category': 'OTHER',
            'unit_price': Decimal('15000.00'),
            'current_stock': 50,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Microscope Slides (Box of 72)',
            'generic_name': 'Glass Slides',
            'manufacturer': 'Various Brands',
            'barcode': 'LAB-CONS-002',
            'category': 'OTHER',
            'unit_price': Decimal('8000.00'),
            'current_stock': 40,
            'reorder_level': 15,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'EDTA Blood Collection Tubes (Pack of 100)',
            'generic_name': 'EDTA Vacutainer',
            'manufacturer': 'BD Vacutainer',
            'barcode': 'LAB-CONS-003',
            'category': 'OTHER',
            'unit_price': Decimal('25000.00'),
            'current_stock': 30,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Urine Collection Containers (Pack of 100)',
            'generic_name': 'Sterile Urine Cups',
            'manufacturer': 'Various Brands',
            'barcode': 'LAB-CONS-004',
            'category': 'OTHER',
            'unit_price': Decimal('12000.00'),
            'current_stock': 25,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Rapid Malaria Test Kits (Box of 25)',
            'generic_name': 'RDT Malaria',
            'manufacturer': 'SD Biosensor',
            'barcode': 'LAB-CONS-005',
            'category': 'OTHER',
            'unit_price': Decimal('35000.00'),
            'current_stock': 20,
            'reorder_level': 5,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Pregnancy Test Strips (Box of 50)',
            'generic_name': 'UPT Strips',
            'manufacturer': 'Accu-Test',
            'barcode': 'LAB-CONS-006',
            'category': 'OTHER',
            'unit_price': Decimal('18000.00'),
            'current_stock': 15,
            'reorder_level': 5,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Lancets (Box of 200)',
            'generic_name': 'Blood Lancets',
            'manufacturer': 'Various Brands',
            'barcode': 'LAB-CONS-007',
            'category': 'OTHER',
            'unit_price': Decimal('10000.00'),
            'current_stock': 30,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Lab Gloves - Medium (Box of 100)',
            'generic_name': 'Latex Gloves',
            'manufacturer': 'Medline',
            'barcode': 'LAB-CONS-008',
            'category': 'OTHER',
            'unit_price': Decimal('12000.00'),
            'current_stock': 50,
            'reorder_level': 20,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
    ]
    
    # Medical Consumables (Nursing/General)
    medical_consumables = [
        # Syringes
        {
            'name': 'Syringe 2ml Disposable (Box of 100)',
            'generic_name': 'Syringe 2ml',
            'manufacturer': 'BD Medical',
            'barcode': 'MED-SYR-001',
            'category': 'OTHER',
            'unit_price': Decimal('15000.00'),
            'current_stock': 40,
            'reorder_level': 15,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Syringe 5ml Disposable (Box of 100)',
            'generic_name': 'Syringe 5ml',
            'manufacturer': 'BD Medical',
            'barcode': 'MED-SYR-002',
            'category': 'OTHER',
            'unit_price': Decimal('18000.00'),
            'current_stock': 35,
            'reorder_level': 15,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Syringe 10ml Disposable (Box of 100)',
            'generic_name': 'Syringe 10ml',
            'manufacturer': 'BD Medical',
            'barcode': 'MED-SYR-003',
            'category': 'OTHER',
            'unit_price': Decimal('22000.00'),
            'current_stock': 30,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Insulin Syringe 1ml (Box of 100)',
            'generic_name': 'Insulin Syringe',
            'manufacturer': 'BD Medical',
            'barcode': 'MED-SYR-004',
            'category': 'OTHER',
            'unit_price': Decimal('25000.00'),
            'current_stock': 20,
            'reorder_level': 8,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # Needles
        {
            'name': 'Hypodermic Needles 21G (Box of 100)',
            'generic_name': 'Needle 21G',
            'manufacturer': 'Terumo',
            'barcode': 'MED-NDL-001',
            'category': 'OTHER',
            'unit_price': Decimal('12000.00'),
            'current_stock': 40,
            'reorder_level': 15,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Hypodermic Needles 23G (Box of 100)',
            'generic_name': 'Needle 23G',
            'manufacturer': 'Terumo',
            'barcode': 'MED-NDL-002',
            'category': 'OTHER',
            'unit_price': Decimal('12000.00'),
            'current_stock': 40,
            'reorder_level': 15,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # IV Cannulas
        {
            'name': 'IV Cannula 18G Green (Box of 50)',
            'generic_name': 'Cannula 18G',
            'manufacturer': 'BD Insyte',
            'barcode': 'MED-CAN-001',
            'category': 'OTHER',
            'unit_price': Decimal('35000.00'),
            'current_stock': 25,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'IV Cannula 20G Pink (Box of 50)',
            'generic_name': 'Cannula 20G',
            'manufacturer': 'BD Insyte',
            'barcode': 'MED-CAN-002',
            'category': 'OTHER',
            'unit_price': Decimal('35000.00'),
            'current_stock': 30,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'IV Cannula 22G Blue (Box of 50)',
            'generic_name': 'Cannula 22G',
            'manufacturer': 'BD Insyte',
            'barcode': 'MED-CAN-003',
            'category': 'OTHER',
            'unit_price': Decimal('35000.00'),
            'current_stock': 30,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'IV Cannula 24G Yellow (Box of 50)',
            'generic_name': 'Cannula 24G',
            'manufacturer': 'BD Insyte',
            'barcode': 'MED-CAN-004',
            'category': 'OTHER',
            'unit_price': Decimal('35000.00'),
            'current_stock': 20,
            'reorder_level': 8,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # IV Fluids
        {
            'name': 'Normal Saline 0.9% 500ml',
            'generic_name': 'NS 500ml',
            'manufacturer': 'Fresenius Kabi',
            'barcode': 'MED-IVF-001',
            'category': 'OTHER',
            'unit_price': Decimal('3000.00'),
            'current_stock': 100,
            'reorder_level': 30,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Dextrose 5% 500ml',
            'generic_name': 'D5W 500ml',
            'manufacturer': 'Fresenius Kabi',
            'barcode': 'MED-IVF-002',
            'category': 'OTHER',
            'unit_price': Decimal('3500.00'),
            'current_stock': 80,
            'reorder_level': 25,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Ringers Lactate 500ml',
            'generic_name': 'RL 500ml',
            'manufacturer': 'Fresenius Kabi',
            'barcode': 'MED-IVF-003',
            'category': 'OTHER',
            'unit_price': Decimal('3500.00'),
            'current_stock': 80,
            'reorder_level': 25,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # Giving Sets
        {
            'name': 'IV Giving Set Adult (Box of 50)',
            'generic_name': 'IV Set Adult',
            'manufacturer': 'Fresenius Kabi',
            'barcode': 'MED-GVS-001',
            'category': 'OTHER',
            'unit_price': Decimal('28000.00'),
            'current_stock': 20,
            'reorder_level': 8,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'IV Giving Set Pediatric (Box of 50)',
            'generic_name': 'IV Set Pediatric',
            'manufacturer': 'Fresenius Kabi',
            'barcode': 'MED-GVS-002',
            'category': 'OTHER',
            'unit_price': Decimal('30000.00'),
            'current_stock': 15,
            'reorder_level': 6,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # Bandages & Dressings
        {
            'name': 'Cotton Wool 500g Roll',
            'generic_name': 'Cotton Wool',
            'manufacturer': 'Various Brands',
            'barcode': 'MED-DRS-001',
            'category': 'OTHER',
            'unit_price': Decimal('8000.00'),
            'current_stock': 50,
            'reorder_level': 20,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Gauze Swabs 10x10cm (Pack of 100)',
            'generic_name': 'Gauze Swabs',
            'manufacturer': 'Various Brands',
            'barcode': 'MED-DRS-002',
            'category': 'OTHER',
            'unit_price': Decimal('12000.00'),
            'current_stock': 40,
            'reorder_level': 15,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Elastic Bandage 7.5cm x 4.5m',
            'generic_name': 'Elastic Bandage',
            'manufacturer': 'Medline',
            'barcode': 'MED-DRS-003',
            'category': 'OTHER',
            'unit_price': Decimal('2500.00'),
            'current_stock': 60,
            'reorder_level': 25,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Adhesive Plaster 5cm x 5m',
            'generic_name': 'Medical Tape',
            'manufacturer': '3M Medical',
            'barcode': 'MED-DRS-004',
            'category': 'OTHER',
            'unit_price': Decimal('3000.00'),
            'current_stock': 50,
            'reorder_level': 20,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Surgical Gloves Size 7.5 (Box of 50 pairs)',
            'generic_name': 'Surgical Gloves',
            'manufacturer': 'Ansell',
            'barcode': 'MED-DRS-005',
            'category': 'OTHER',
            'unit_price': Decimal('35000.00'),
            'current_stock': 20,
            'reorder_level': 8,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # Antiseptics & Disinfectants
        {
            'name': 'Surgical Spirit 500ml',
            'generic_name': 'Isopropyl Alcohol 70%',
            'manufacturer': 'Various Brands',
            'barcode': 'MED-ANT-001',
            'category': 'OTHER',
            'unit_price': Decimal('5000.00'),
            'current_stock': 40,
            'reorder_level': 15,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Dettol Antiseptic 500ml',
            'generic_name': 'Chloroxylenol Solution',
            'manufacturer': 'Reckitt Benckiser',
            'barcode': 'MED-ANT-002',
            'category': 'OTHER',
            'unit_price': Decimal('8000.00'),
            'current_stock': 30,
            'reorder_level': 12,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Hydrogen Peroxide 3% 500ml',
            'generic_name': 'H2O2 3%',
            'manufacturer': 'Various Brands',
            'barcode': 'MED-ANT-003',
            'category': 'OTHER',
            'unit_price': Decimal('4000.00'),
            'current_stock': 35,
            'reorder_level': 15,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Povidone Iodine 10% 500ml',
            'generic_name': 'Betadine Solution',
            'manufacturer': 'Mundipharma',
            'barcode': 'MED-ANT-004',
            'category': 'OTHER',
            'unit_price': Decimal('12000.00'),
            'current_stock': 25,
            'reorder_level': 10,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # Catheters & Drainage
        {
            'name': 'Urinary Catheter Foley 16Fr (Box of 10)',
            'generic_name': 'Foley Catheter 16Fr',
            'manufacturer': 'Bard Medical',
            'barcode': 'MED-CAT-001',
            'category': 'OTHER',
            'unit_price': Decimal('25000.00'),
            'current_stock': 15,
            'reorder_level': 6,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Nasogastric Tube 16Fr (Box of 10)',
            'generic_name': 'NG Tube',
            'manufacturer': 'Bard Medical',
            'barcode': 'MED-CAT-002',
            'category': 'OTHER',
            'unit_price': Decimal('18000.00'),
            'current_stock': 12,
            'reorder_level': 5,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Urine Drainage Bag (Box of 20)',
            'generic_name': 'Urine Bag',
            'manufacturer': 'Bard Medical',
            'barcode': 'MED-CAT-003',
            'category': 'OTHER',
            'unit_price': Decimal('22000.00'),
            'current_stock': 10,
            'reorder_level': 4,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        
        # Oxygen & Respiratory
        {
            'name': 'Oxygen Mask Adult',
            'generic_name': 'O2 Mask Adult',
            'manufacturer': 'Teleflex',
            'barcode': 'MED-OXY-001',
            'category': 'OTHER',
            'unit_price': Decimal('4500.00'),
            'current_stock': 20,
            'reorder_level': 8,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
        {
            'name': 'Nebulizer Mask with Tubing',
            'generic_name': 'Nebulizer Mask',
            'manufacturer': 'Teleflex',
            'barcode': 'MED-OXY-002',
            'category': 'OTHER',
            'unit_price': Decimal('6000.00'),
            'current_stock': 15,
            'reorder_level': 6,
            'requires_prescription': False,
            'is_active': True,
            'created_by': admin_user,
        },
    ]
    
    # Combine all supplies
    all_supplies = lab_supplies + medical_consumables
    
    created_count = 0
    updated_count = 0
    
    print("=" * 70)
    print("🏥 WEMA HMS - HOSPITAL SUPPLIES POPULATION")
    print("=" * 70)
    
    for supply_data in all_supplies:
        barcode = supply_data['barcode']
        
        # Check if item already exists
        existing = Medication.objects.filter(barcode=barcode).first()
        
        if existing:
            print(f"⚠️  Updating: {supply_data['name']}")
            for key, value in supply_data.items():
                if key != 'created_by':  # Don't update created_by
                    setattr(existing, key, value)
            existing.save()
            updated_count += 1
        else:
            Medication.objects.create(**supply_data)
            print(f"✅ Created: {supply_data['name']} - {supply_data['unit_price']} TZS")
            created_count += 1
    
    print("\n" + "=" * 70)
    print(f"✅ HOSPITAL SUPPLIES POPULATION COMPLETE")
    print("=" * 70)
    print(f"📦 New items created: {created_count}")
    print(f"🔄 Existing items updated: {updated_count}")
    print(f"📊 Total supplies: {created_count + updated_count}")
    
    # Generate summary
    print("\n" + "=" * 70)
    print("📊 INVENTORY SUMMARY BY CATEGORY")
    print("=" * 70)
    
    print(f"\n🔬 LAB EQUIPMENT & CONSUMABLES: {len(lab_supplies)} items")
    print("   Equipment (Capital Assets):")
    for item in lab_supplies[:4]:
        print(f"     • {item['name']}: {item['unit_price']:,.0f} TZS")
    
    print("\n   Lab Consumables:")
    for item in lab_supplies[4:]:
        print(f"     • {item['name']}: {item['unit_price']:,.0f} TZS")
    
    print(f"\n💉 MEDICAL CONSUMABLES: {len(medical_consumables)} items")
    
    syr_ndl = [s for s in medical_consumables if 'SYR' in s['barcode'] or 'NDL' in s['barcode']]
    print(f"   Syringes & Needles ({len(syr_ndl)} items)")
    
    cannulas = [s for s in medical_consumables if 'CAN' in s['barcode']]
    print(f"   IV Cannulas ({len(cannulas)} items)")
    
    iv_items = [s for s in medical_consumables if 'IVF' in s['barcode'] or 'GVS' in s['barcode']]
    print(f"   IV Fluids & Sets ({len(iv_items)} items)")
    
    dressings = [s for s in medical_consumables if 'DRS' in s['barcode']]
    print(f"   Dressings & Bandages ({len(dressings)} items)")
    
    antiseptics = [s for s in medical_consumables if 'ANT' in s['barcode']]
    print(f"   Antiseptics ({len(antiseptics)} items)")
    
    catheters = [s for s in medical_consumables if 'CAT' in s['barcode']]
    print(f"   Catheters & Drainage ({len(catheters)} items)")
    
    respiratory = [s for s in medical_consumables if 'OXY' in s['barcode']]
    print(f"   Oxygen & Respiratory ({len(respiratory)} items)")
    
    # Calculate total inventory value
    total_value = sum(Decimal(str(s['unit_price'])) * s['current_stock'] for s in all_supplies)
    
    print("\n" + "=" * 70)
    print("💰 FINANCIAL SUMMARY")
    print("=" * 70)
    print(f"Total Inventory Value: {total_value:,.2f} TZS")
    print(f"Total Items Count: {sum(s['current_stock'] for s in all_supplies):,} units")
    
    print("\n" + "=" * 70)
    print("📝 NOTES:")
    print("=" * 70)
    print("• These items are HOSPITAL EXPENSES - NOT charged to patients")
    print("• Lab equipment (microscopes, centrifuges) are capital assets")
    print("• Consumables (syringes, gloves) need regular restocking")
    print("• Stock levels based on typical hospital usage patterns")
    print("• Reorder levels set to prevent stockouts")
    print("=" * 70)
    
    return created_count, updated_count


if __name__ == '__main__':
    populate_lab_equipment_and_supplies()
    
    print("\n✅ Hospital supplies database ready!")
    print("🔬 Lab can now track equipment and consumables")
    print("💉 Nursing can monitor medical supplies")
    print("📊 Finance can track hospital expenses")
