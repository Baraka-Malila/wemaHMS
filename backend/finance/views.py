from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q
from django.utils import timezone
from decimal import Decimal

from .models import ServicePricing, PatientBill, BillLineItem, DailyBalance
from core.permissions import IsAdminUser, IsStaffMember


# ==================== SERVICE PRICING (ADMIN CONTROLLED) ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsStaffMember])
def service_pricing(request):
    """
    GET: List all service prices (for all departments)
    POST: Add new service pricing (admin only)
    """
    if request.method == 'GET':
        services = ServicePricing.objects.filter(is_active=True)
        
        # Filter by category if requested
        category = request.GET.get('category')
        if category:
            services = services.filter(service_category=category)
        
        # Filter by department
        department = request.GET.get('department')
        if department:
            services = services.filter(department=department)
        
        services_data = []
        for service in services:
            services_data.append({
                'id': str(service.id),
                'service_name': service.service_name,
                'service_code': service.service_code,
                'service_category': service.service_category,
                'standard_price': float(service.standard_price),
                'emergency_price': float(service.emergency_price) if service.emergency_price else None,
                'department': service.department,
                'description': service.description
            })
        
        return Response({
            'success': True,
            'count': len(services_data),
            'services': services_data
        })
    
    elif request.method == 'POST':
        # Only admin can add new services
        if not (hasattr(request.user, 'role') and request.user.role == 'ADMIN'):
            return Response({
                'success': False,
                'error': 'Only admin can add new services'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            service = ServicePricing.objects.create(
                service_name=request.data['service_name'],
                service_code=request.data['service_code'],
                service_category=request.data['service_category'],
                standard_price=request.data['standard_price'],
                emergency_price=request.data.get('emergency_price'),
                department=request.data['department'],
                description=request.data.get('description', ''),
                created_by=request.user
            )
            
            return Response({
                'success': True,
                'message': 'Service pricing added successfully',
                'service_id': str(service.id)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_service_pricing(request, service_id):
    """
    Update service pricing (admin only)
    """
    try:
        service = get_object_or_404(ServicePricing, id=service_id)
        
        # Update allowed fields
        if 'standard_price' in request.data:
            service.standard_price = request.data['standard_price']
        if 'emergency_price' in request.data:
            service.emergency_price = request.data['emergency_price']
        if 'service_name' in request.data:
            service.service_name = request.data['service_name']
        if 'description' in request.data:
            service.description = request.data['description']
        if 'is_active' in request.data:
            service.is_active = request.data['is_active']
        
        service.save()
        
        return Response({
            'success': True,
            'message': 'Service pricing updated successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== BILLING OPERATIONS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStaffMember])
def create_bill(request):
    """
    Create new patient bill (called by all departments)
    """
    try:
        # Create the bill
        bill = PatientBill.objects.create(
            patient_id=request.data['patient_id'],
            patient_name=request.data['patient_name'],
            service_date=request.data['service_date'],
            due_date=request.data.get('due_date', timezone.now().date()),
            insurance_provider=request.data.get('insurance_provider'),
            insurance_number=request.data.get('insurance_number'),
            created_by=request.user
        )
        
        # Add line items
        total_amount = Decimal('0.00')
        for item_data in request.data['line_items']:
            # Get service pricing if service_code provided
            service = None
            if 'service_code' in item_data:
                service = ServicePricing.objects.filter(
                    service_code=item_data['service_code']
                ).first()
            
            line_item = BillLineItem.objects.create(
                patient_bill=bill,
                service_pricing=service,
                service_name=item_data['service_name'],
                service_code=item_data.get('service_code', 'CUSTOM'),
                service_category=item_data.get('service_category', 'OTHER'),
                quantity=item_data.get('quantity', 1),
                unit_price=item_data['unit_price'],
                source_department=item_data.get('source_department', 'UNKNOWN'),
                source_reference=item_data.get('source_reference', ''),
                service_date=request.data['service_date'],
                provided_by=request.user
            )
            total_amount += line_item.line_total
        
        # Update bill totals
        bill.subtotal = total_amount
        bill.save()
        
        return Response({
            'success': True,
            'message': 'Bill created successfully',
            'bill_number': bill.bill_number,
            'bill_id': str(bill.id),
            'total_amount': float(bill.patient_amount)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStaffMember])
def patient_bills(request, patient_id):
    """
    Get all bills for a specific patient
    """
    try:
        bills = PatientBill.objects.filter(patient_id=patient_id).order_by('-bill_date')
        
        bills_data = []
        for bill in bills:
            bills_data.append({
                'id': str(bill.id),
                'bill_number': bill.bill_number,
                'service_date': bill.service_date,
                'bill_date': bill.bill_date,
                'subtotal': float(bill.subtotal),
                'insurance_covered': float(bill.insurance_covered),
                'patient_amount': float(bill.patient_amount),
                'total_paid': float(bill.total_paid),
                'balance_due': float(bill.balance_due),
                'bill_status': bill.bill_status,
                'due_date': bill.due_date
            })
        
        # Calculate totals
        total_outstanding = sum(bill.balance_due for bill in bills if bill.balance_due > 0)
        
        return Response({
            'success': True,
            'patient_id': patient_id,
            'bills_count': len(bills_data),
            'total_outstanding': float(total_outstanding),
            'bills': bills_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStaffMember])
def process_payment(request):
    """
    Process payment for a patient bill
    """
    try:
        bill = get_object_or_404(PatientBill, id=request.data['bill_id'])
        payment_amount = Decimal(str(request.data['payment_amount']))
        
        # Update bill payment
        bill.total_paid += payment_amount
        bill.save()  # This will auto-update status and balance
        
        # TODO: Create payment record for audit trail
        
        return Response({
            'success': True,
            'message': 'Payment processed successfully',
            'bill_number': bill.bill_number,
            'amount_paid': float(payment_amount),
            'new_balance': float(bill.balance_due),
            'bill_status': bill.bill_status
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== DAILY OPERATIONS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def close_daily_balance(request):
    """
    Close the day and create daily balance record
    """
    try:
        close_date = request.data['close_date']
        
        # Check if already closed
        if DailyBalance.objects.filter(balance_date=close_date).exists():
            return Response({
                'success': False,
                'error': 'Day already closed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate department revenues for the day
        day_bills = PatientBill.objects.filter(service_date=close_date)
        
        consultation_revenue = day_bills.filter(
            line_items__service_category='CONSULTATION'
        ).aggregate(total=Sum('line_items__line_total'))['total'] or Decimal('0.00')
        
        pharmacy_revenue = day_bills.filter(
            line_items__service_category='MEDICATION'
        ).aggregate(total=Sum('line_items__line_total'))['total'] or Decimal('0.00')
        
        lab_revenue = day_bills.filter(
            line_items__service_category='LAB_TEST'
        ).aggregate(total=Sum('line_items__line_total'))['total'] or Decimal('0.00')
        
        nursing_revenue = day_bills.filter(
            line_items__service_category='NURSING'
        ).aggregate(total=Sum('line_items__line_total'))['total'] or Decimal('0.00')
        
        total_revenue = consultation_revenue + pharmacy_revenue + lab_revenue + nursing_revenue
        
        # Create daily balance record
        daily_balance = DailyBalance.objects.create(
            balance_date=close_date,
            consultation_revenue=consultation_revenue,
            pharmacy_revenue=pharmacy_revenue,
            lab_revenue=lab_revenue,
            nursing_revenue=nursing_revenue,
            total_revenue=total_revenue,
            cash_collected=request.data.get('cash_collected', 0),
            card_payments=request.data.get('card_payments', 0),
            mobile_payments=request.data.get('mobile_payments', 0),
            closed_by=request.user,
            closed_at=timezone.now(),
            is_balanced=True  # Assume balanced for now
        )
        
        return Response({
            'success': True,
            'message': 'Daily balance closed successfully',
            'balance_date': close_date,
            'total_revenue': float(total_revenue),
            'balance_id': str(daily_balance.id)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStaffMember])
def daily_status(request):
    """
    Get current day financial status
    """
    try:
        today = timezone.now().date()
        
        # Check if today is closed
        is_closed = DailyBalance.objects.filter(balance_date=today).exists()
        
        # Get today's totals
        today_bills = PatientBill.objects.filter(service_date=today)
        total_billed = today_bills.aggregate(total=Sum('subtotal'))['total'] or Decimal('0.00')
        total_collected = today_bills.aggregate(total=Sum('total_paid'))['total'] or Decimal('0.00')
        outstanding = today_bills.aggregate(total=Sum('balance_due'))['total'] or Decimal('0.00')
        
        # Bills by status
        open_bills = today_bills.filter(bill_status='OPEN').count()
        paid_bills = today_bills.filter(bill_status='PAID').count()
        partial_bills = today_bills.filter(bill_status='PARTIAL').count()
        
        return Response({
            'success': True,
            'date': today,
            'is_closed': is_closed,
            'summary': {
                'total_billed': float(total_billed),
                'total_collected': float(total_collected),
                'outstanding': float(outstanding),
                'open_bills': open_bills,
                'paid_bills': paid_bills,
                'partial_bills': partial_bills
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
