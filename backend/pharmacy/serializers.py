from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Medication, PrescriptionQueue, DispenseRecord, StockMovement

User = get_user_model()


class MedicationSerializer(serializers.ModelSerializer):
    """
    Full medication serializer for pharmacy staff (CRUD operations).
    """
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Medication
        fields = [
            'id', 'name', 'generic_name', 'manufacturer', 'category',
            'barcode', 'qr_code', 'alternative_codes',
            'current_stock', 'reorder_level', 'unit_price',
            'requires_prescription', 'is_active', 'supplier',
            'last_restocked', 'created_at', 'updated_at',
            'created_by', 'created_by_name', 'is_low_stock', 
            'is_available', 'stock_status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_stock_status(self, obj):
        """Return human-readable stock status"""
        if not obj.is_active:
            return 'Inactive'
        elif obj.current_stock == 0:
            return 'Out of Stock'
        elif obj.is_low_stock:
            return 'Low Stock'
        else:
            return 'In Stock'
    
    def create(self, validated_data):
        """Set created_by to current user"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class MedicationListSerializer(serializers.ModelSerializer):
    """
    Simplified medication list for doctors (read-only, available meds only).
    """
    
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Medication
        fields = [
            'id', 'name', 'generic_name', 'category',
            'current_stock', 'unit_price', 'requires_prescription',
            'is_available', 'stock_status'
        ]
    
    def get_stock_status(self, obj):
        if obj.current_stock == 0:
            return 'unavailable'
        elif obj.is_low_stock:
            return 'low'
        else:
            return 'available'


class PrescriptionQueueSerializer(serializers.ModelSerializer):
    """
    Prescription queue serializer for pharmacy staff.
    """
    
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    time_in_queue = serializers.SerializerMethodField()
    
    class Meta:
        model = PrescriptionQueue
        fields = [
            'id', 'prescription_id', 'patient_id', 'patient_name',
            'prescribed_by', 'medications_list', 'status', 'status_display',
            'priority', 'priority_display', 'processed_by', 'processed_by_name',
            'total_amount', 'pharmacist_notes', 'modified_medications',
            'created_at', 'started_processing_at', 'completed_at', 'dispensed_at',
            'time_in_queue'
        ]
        read_only_fields = [
            'id', 'created_at', 'processed_by_name', 'status_display',
            'priority_display', 'time_in_queue'
        ]
    
    def get_time_in_queue(self, obj):
        """Calculate how long prescription has been in queue"""
        from django.utils import timezone
        if obj.dispensed_at:
            return "Completed"
        
        time_diff = timezone.now() - obj.created_at
        hours = int(time_diff.total_seconds() / 3600)
        minutes = int((time_diff.total_seconds() % 3600) / 60)
        
        if hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"


class ScanRequestSerializer(serializers.Serializer):
    """
    Serializer for scanning requests during dispensing.
    """
    
    prescription_id = serializers.UUIDField()
    scanned_code = serializers.CharField(max_length=200)
    quantity = serializers.IntegerField(min_value=1, default=1)


class RestockSerializer(serializers.Serializer):
    """
    Serializer for restocking operations.
    """
    
    medication_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    scanned_codes = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list
    )
    supplier = serializers.CharField(max_length=100, required=False)
    notes = serializers.CharField(required=False)
