"""
Pharmacy utility functions for pricing and medication management.
Integrates with the centralized finance pricing system.
"""
from decimal import Decimal
from finance.utils import get_medication_price, get_service_price


def get_medication_pricing(medication):
    """
    Get medication price from centralized ServicePricing.
    Uses medication barcode to lookup service pricing.
    """
    try:
        # First try using barcode-based service code
        service_code = f"MED_{medication.barcode[:10]}"
        price = get_service_price(service_code)
        
        if price:
            return price
        
        # Fall back to name-based lookup
        price = get_medication_price(medication.name)
        
        if price:
            return price
        
        # Default fallback price for medications
        return Decimal('1000.00')  # 1000 TZS default
        
    except Exception:
        return Decimal('1000.00')


def calculate_prescription_total(dispense_records):
    """
    Calculate total amount for a prescription from dispense records.
    """
    total = Decimal('0.00')
    for record in dispense_records:
        total += record.line_total
    return total


def update_medication_stock(medication, quantity_dispensed):
    """
    Update medication stock after dispensing.
    Returns True if stock is sufficient, False otherwise.
    """
    if medication.current_stock >= quantity_dispensed:
        medication.current_stock -= quantity_dispensed
        medication.save()
        return True
    return False


def check_low_stock_alerts(medication):
    """
    Check if medication is below reorder level.
    Returns alert type: 'critical', 'low', or None
    """
    if medication.current_stock <= 0:
        return 'critical'
    elif medication.current_stock <= medication.reorder_level:
        return 'low'
    return None


def create_medication_service_pricing(medication, price, user):
    """
    Create service pricing entry for a new medication.
    Called when adding new medications to inventory.
    """
    from finance.models import ServicePricing
    
    try:
        service_code = f"MED_{medication.barcode[:10]}"
        
        service_pricing, created = ServicePricing.objects.get_or_create(
            service_code=service_code,
            defaults={
                'service_name': medication.name,
                'service_category': 'MEDICATION',
                'standard_price': price,
                'department': 'PHARMACY',
                'description': f'{medication.generic_name} - {medication.manufacturer}',
                'created_by': user,
                'is_active': True
            }
        )
        
        if not created and service_pricing.standard_price != price:
            # Update price if it has changed
            service_pricing.standard_price = price
            service_pricing.save()
        
        return service_pricing
        
    except Exception as e:
        raise Exception(f"Failed to create service pricing: {str(e)}")
