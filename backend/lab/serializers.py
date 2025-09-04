from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import LabTestResult, LabOrder

User = get_user_model()


class LabTestResultSerializer(serializers.ModelSerializer):
    """
    Serializer for lab test results.
    Used for creating, updating, and displaying test results.
    """
    
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    processing_time_display = serializers.SerializerMethodField()
    
    class Meta:
        model = LabTestResult
        fields = [
            'id',
            'lab_request_id',
            'patient_id',
            'patient_name',
            'test_type',
            'test_description',
            'result_summary',
            'result_details',
            'normal_range',
            'result_status',
            'urgent_flag',
            'technician_notes',
            'result_image',
            'test_started_at',
            'test_completed_at',
            'processed_by',
            'processed_by_name',
            'doctor_notified',
            'doctor_viewed',
            'processing_time_display',
        ]
        read_only_fields = ['id', 'test_started_at', 'processed_by_name', 'processing_time_display']
    
    def get_processing_time_display(self, obj):
        """Return processing time in human-readable format"""
        minutes = obj.processing_time_minutes
        if minutes is None:
            return "In progress"
        
        if minutes < 60:
            return f"{minutes} minutes"
        elif minutes < 1440:  # Less than 24 hours
            hours = minutes // 60
            remaining_minutes = minutes % 60
            if remaining_minutes > 0:
                return f"{hours}h {remaining_minutes}m"
            return f"{hours} hours"
        else:  # More than 24 hours
            days = minutes // 1440
            remaining_hours = (minutes % 1440) // 60
            if remaining_hours > 0:
                return f"{days}d {remaining_hours}h"
            return f"{days} days"
    
    def validate(self, data):
        """Custom validation for test results"""
        
        # If marking as urgent, require technician notes
        if data.get('urgent_flag') and not data.get('technician_notes'):
            raise serializers.ValidationError({
                'technician_notes': 'Technician notes are required for urgent results.'
            })
        
        # If status is CRITICAL or ABNORMAL, require result details
        if data.get('result_status') in ['CRITICAL', 'ABNORMAL'] and not data.get('result_details'):
            raise serializers.ValidationError({
                'result_details': 'Detailed results are required for abnormal or critical findings.'
            })
        
        return data


class LabTestResultCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for creating new lab test results.
    Auto-populates some fields from the test request.
    """
    
    class Meta:
        model = LabTestResult
        fields = [
            'lab_request_id',
            'patient_id',
            'patient_name',
            'test_type',
            'test_description',
            'result_summary',
            'result_details',
            'normal_range',
            'result_status',
            'urgent_flag',
            'technician_notes',
            'result_image',
        ]
    
    def create(self, validated_data):
        """Create lab result with current user as processor"""
        validated_data['processed_by'] = self.context['request'].user
        return super().create(validated_data)


class LabTestResultListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing lab test results.
    Only includes essential fields for dashboard views.
    """
    
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_result_status_display', read_only=True)
    
    class Meta:
        model = LabTestResult
        fields = [
            'id',
            'patient_id',
            'patient_name',
            'test_type',
            'result_status',
            'status_display',
            'urgent_flag',
            'test_completed_at',
            'processed_by_name',
            'doctor_notified',
            'doctor_viewed',
        ]


class LabOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for lab supply orders.
    Used for creating orders to be sent to pharmacy.
    """
    
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = LabOrder
        fields = [
            'id',
            'order_title',
            'items_list',
            'justification',
            'priority',
            'priority_display',
            'status',
            'status_display',
            'estimated_cost',
            'requested_by',
            'requested_by_name',
            'approved_by',
            'approved_by_name',
            'created_at',
            'updated_at',
            'submitted_at',
            'approved_at',
        ]
        read_only_fields = [
            'id', 'requested_by_name', 'approved_by_name', 
            'status_display', 'priority_display', 'created_at', 
            'updated_at', 'submitted_at', 'approved_at'
        ]


class LabOrderCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for creating lab orders.
    Auto-populates requester from current user.
    """
    
    class Meta:
        model = LabOrder
        fields = [
            'order_title',
            'items_list',
            'justification',
            'priority',
            'estimated_cost',
        ]
    
    def create(self, validated_data):
        """Create lab order with current user as requester"""
        validated_data['requested_by'] = self.context['request'].user
        return super().create(validated_data)


class LabTestResultUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating existing lab test results.
    Restricts which fields can be updated after creation.
    """
    
    class Meta:
        model = LabTestResult
        fields = [
            'result_summary',
            'result_details',
            'normal_range',
            'result_status',
            'urgent_flag',
            'technician_notes',
            'result_image',
            'doctor_notified',
        ]
    
    def validate(self, data):
        """Prevent modification of completed critical results"""
        instance = self.instance
        
        # If result is already critical and completed, restrict changes
        if (instance.result_status == 'CRITICAL' and 
            instance.doctor_notified and 
            data.get('result_status') != 'CRITICAL'):
            raise serializers.ValidationError({
                'result_status': 'Cannot change status of notified critical results.'
            })
        
        return data


# Dashboard-specific serializers
class LabDashboardStatsSerializer(serializers.Serializer):
    """
    Serializer for lab dashboard statistics.
    Returns summary data for lab portal dashboard.
    """
    
    pending_tests = serializers.IntegerField()
    completed_today = serializers.IntegerField()
    urgent_results = serializers.IntegerField()
    critical_results = serializers.IntegerField()
    average_processing_time = serializers.FloatField()
    pending_orders = serializers.IntegerField()
    
    # Recent activity
    recent_completions = LabTestResultListSerializer(many=True)
    urgent_cases = LabTestResultListSerializer(many=True)


class LabWorkloadSerializer(serializers.Serializer):
    """
    Serializer for lab workload analysis.
    Shows test distribution and technician performance.
    """
    
    total_tests_this_week = serializers.IntegerField()
    tests_by_type = serializers.DictField()
    tests_by_day = serializers.DictField()
    technician_performance = serializers.DictField()
    busiest_hours = serializers.DictField()
