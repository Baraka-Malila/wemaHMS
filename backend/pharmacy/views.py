from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, F
from django.utils import timezone

from .models import Medication, PrescriptionQueue, DispenseRecord, StockMovement
from .serializers import (
    MedicationSerializer, MedicationListSerializer, PrescriptionQueueSerializer,
    ScanRequestSerializer, RestockSerializer
)
from core.permissions import IsPharmacyStaff, IsDoctorStaff, IsStaffMember


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStaffMember])
def available_medications(request):
    """
    Get all available medications for doctors to use in prescriptions.
    Shared endpoint for doctors and pharmacy staff.
    """
    try:
        # Only show active medications with stock > 0
        medications = Medication.objects.filter(
            is_active=True,
            current_stock__gt=0
        ).order_by('name')
        
        # Use simplified serializer for doctors, full for pharmacy staff
        if hasattr(request.user, 'role') and request.user.role == 'PHARMACY':
            serializer = MedicationSerializer(medications, many=True)
        else:
            serializer = MedicationListSerializer(medications, many=True)
        
        return Response({
            'success': True,
            'count': medications.count(),
            'medications': serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPharmacyStaff])
def prescription_queue(request):
    """
    Get all pending prescriptions waiting to be processed.
    """
    try:
        queue = PrescriptionQueue.objects.filter(
            status__in=['PENDING', 'IN_PROGRESS']
        ).order_by('priority', 'created_at')
        
        serializer = PrescriptionQueueSerializer(queue, many=True)
        
        return Response({
            'success': True,
            'queue_count': queue.count(),
            'prescriptions': serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPharmacyStaff])
def scan_medication(request):
    """
    Process scanned medication during dispensing.
    Updates running total and creates dispense record.
    """
    try:
        serializer = ScanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Find medication by scanned code
        medication = Medication.objects.filter(
            Q(barcode=data['scanned_code']) | 
            Q(qr_code=data['scanned_code']) |
            Q(alternative_codes__contains=[data['scanned_code']])
        ).first()
        
        if not medication:
            return Response({
                'success': False,
                'item_found': False,
                'error': 'Medication not found for scanned code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not medication.is_available:
            return Response({
                'success': False,
                'item_found': True,
                'error': f'{medication.name} is not available (out of stock or inactive)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get prescription queue
        prescription = get_object_or_404(PrescriptionQueue, id=data['prescription_id'])
        
        # Check if enough stock
        if medication.current_stock < data['quantity']:
            return Response({
                'success': False,
                'item_found': True,
                'error': f'Insufficient stock. Available: {medication.current_stock}, Requested: {data["quantity"]}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        line_total = data['quantity'] * medication.unit_price
        
        # Get current running total
        current_total = DispenseRecord.objects.filter(
            prescription_queue=prescription
        ).aggregate(total=Sum('line_total'))['total'] or 0
        
        new_running_total = current_total + line_total
        
        # Create dispense record
        dispense_record = DispenseRecord.objects.create(
            prescription_queue=prescription,
            medication=medication,
            scanned_code=data['scanned_code'],
            quantity_scanned=data['quantity'],
            unit_price=medication.unit_price,
            line_total=line_total,
            running_total=new_running_total,
            scanned_by=request.user
        )
        
        # Update medication stock
        medication.current_stock -= data['quantity']
        medication.save()
        
        # Create stock movement record
        StockMovement.objects.create(
            medication=medication,
            movement_type='DISPENSE',
            quantity=-data['quantity'],
            previous_stock=medication.current_stock + data['quantity'],
            new_stock=medication.current_stock,
            reference_id=str(prescription.id),
            scanned_codes=[data['scanned_code']],
            performed_by=request.user
        )
        
        # Update prescription status
        if prescription.status == 'PENDING':
            prescription.status = 'IN_PROGRESS'
            prescription.started_processing_at = timezone.now()
            prescription.processed_by = request.user
        
        prescription.total_amount = new_running_total
        prescription.save()
        
        return Response({
            'success': True,
            'item_found': True,
            'medication_id': str(medication.id),
            'medication_name': medication.name,
            'unit_price': medication.unit_price,
            'quantity': data['quantity'],
            'line_total': line_total,
            'running_total': new_running_total,
            'remaining_stock': medication.current_stock
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPharmacyStaff])
def complete_prescription(request, prescription_id):
    """
    Mark prescription as completed and ready for patient pickup.
    Sends total amount to finance system.
    """
    try:
        prescription = get_object_or_404(PrescriptionQueue, id=prescription_id)
        
        if prescription.status not in ['IN_PROGRESS']:
            return Response({
                'success': False,
                'error': 'Prescription is not being processed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        prescription.status = 'COMPLETED'
        prescription.completed_at = timezone.now()
        prescription.save()
        
        # TODO: Send billing information to finance system
        # finance_integration.create_prescription_bill(prescription)
        
        return Response({
            'success': True,
            'message': 'Prescription completed successfully',
            'prescription_id': str(prescription.id),
            'patient_id': prescription.patient_id,
            'total_amount': prescription.total_amount
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAuthenticated, IsPharmacyStaff])
def medications_crud(request, medication_id=None):
    """
    CRUD operations for medications (pharmacy staff only).
    GET: List all medications or get specific medication
    POST: Add new medication
    PATCH: Update medication details
    """
    try:
        if request.method == 'GET':
            if medication_id:
                # Get specific medication
                medication = get_object_or_404(Medication, id=medication_id)
                serializer = MedicationSerializer(medication)
                return Response({
                    'success': True,
                    'medication': serializer.data
                })
            else:
                # List all medications (including inactive and out of stock)
                medications = Medication.objects.all().order_by('name')
                serializer = MedicationSerializer(medications, many=True)
                return Response({
                    'success': True,
                    'count': medications.count(),
                    'medications': serializer.data
                })
        
        elif request.method == 'POST':
            # Add new medication
            serializer = MedicationSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                medication = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Medication added successfully',
                    'medication': serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'PATCH':
            # Update medication
            if not medication_id:
                return Response({
                    'success': False,
                    'error': 'Medication ID required for update'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            medication = get_object_or_404(Medication, id=medication_id)
            serializer = MedicationSerializer(medication, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Medication updated successfully',
                    'medication': serializer.data
                })
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPharmacyStaff])
def restock_medication(request):
    """
    Add new stock to existing medication.
    Can scan multiple codes during restocking.
    """
    try:
        serializer = RestockSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        medication = get_object_or_404(Medication, id=data['medication_id'])
        
        # Update stock
        previous_stock = medication.current_stock
        medication.current_stock += data['quantity']
        medication.last_restocked = timezone.now()
        
        if 'supplier' in data:
            medication.supplier = data['supplier']
        
        medication.save()
        
        # Create stock movement record
        StockMovement.objects.create(
            medication=medication,
            movement_type='RESTOCK',
            quantity=data['quantity'],
            previous_stock=previous_stock,
            new_stock=medication.current_stock,
            scanned_codes=data.get('scanned_codes', []),
            performed_by=request.user,
            notes=data.get('notes', '')
        )
        
        return Response({
            'success': True,
            'message': f'Successfully restocked {medication.name}',
            'medication_id': str(medication.id),
            'previous_stock': previous_stock,
            'new_stock': medication.current_stock,
            'quantity_added': data['quantity']
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPharmacyStaff])
def low_stock_alert(request):
    """
    Get medications that are running low on stock.
    """
    try:
        low_stock_meds = Medication.objects.filter(
            is_active=True,
            current_stock__lte=F('reorder_level')
        ).order_by('current_stock')
        
        serializer = MedicationListSerializer(low_stock_meds, many=True)
        
        return Response({
            'success': True,
            'low_stock_count': low_stock_meds.count(),
            'medications': serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
