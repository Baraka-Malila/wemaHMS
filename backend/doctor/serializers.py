from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Consultation, LabTestRequest, Prescription

User = get_user_model()


class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating consultations"""
    
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    blood_pressure = serializers.ReadOnlyField()
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'patient_id', 'patient_name', 'doctor', 'doctor_name',
            'chief_complaint', 'symptoms', 'examination_findings', 'diagnosis',
            'treatment_plan', 'follow_up_date', 'priority', 'status',
            'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic',
            'heart_rate', 'blood_pressure', 'doctor_notes',
            'consultation_date', 'updated_at', 'completed_at', 'duration_minutes'
        ]
        read_only_fields = [
            'id', 'consultation_date', 'updated_at', 'completed_at',
            'duration_minutes', 'blood_pressure', 'doctor_name'
        ]
    
    def validate_follow_up_date(self, value):
        """Ensure follow-up date is not in the past"""
        if value:
            from datetime import date
            if value < date.today():
                raise serializers.ValidationError("Follow-up date cannot be in the past.")
        return value


class ConsultationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for consultation lists"""
    
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    blood_pressure = serializers.ReadOnlyField()
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'patient_id', 'patient_name', 'doctor_name',
            'chief_complaint', 'diagnosis', 'priority', 'status',
            'consultation_date', 'blood_pressure'
        ]


class LabTestRequestSerializer(serializers.ModelSerializer):
    """Serializer for lab test requests"""
    
    requested_by_name = serializers.CharField(source='requested_by.full_name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)
    patient_id = serializers.CharField(source='consultation.patient_id', read_only=True)
    patient_name = serializers.CharField(source='consultation.patient_name', read_only=True)
    
    class Meta:
        model = LabTestRequest
        fields = [
            'id', 'consultation', 'patient_id', 'patient_name',
            'test_type', 'test_description', 'urgency', 'status',
            'clinical_notes', 'requested_at', 'updated_at', 'completed_at',
            'requested_by_name', 'processed_by_name'
        ]
        read_only_fields = [
            'id', 'requested_at', 'updated_at', 'completed_at',
            'patient_id', 'patient_name', 'requested_by_name', 'processed_by_name'
        ]


class LabTestRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating lab test requests"""
    
    class Meta:
        model = LabTestRequest
        fields = [
            'consultation', 'test_type', 'test_description', 
            'urgency', 'clinical_notes'
        ]


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for prescriptions"""
    
    prescribed_by_name = serializers.CharField(source='prescribed_by.full_name', read_only=True)
    dispensed_by_name = serializers.CharField(source='dispensed_by.full_name', read_only=True)
    patient_id = serializers.CharField(source='consultation.patient_id', read_only=True)
    patient_name = serializers.CharField(source='consultation.patient_name', read_only=True)
    remaining_quantity = serializers.ReadOnlyField()
    frequency_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'consultation', 'patient_id', 'patient_name',
            'medication_name', 'generic_name', 'strength', 'dosage_form',
            'frequency', 'frequency_display', 'custom_frequency', 
            'dosage_instructions', 'duration', 'quantity_prescribed',
            'quantity_dispensed', 'remaining_quantity', 'status',
            'special_instructions', 'prescribed_at', 'updated_at',
            'dispensed_at', 'prescribed_by_name', 'dispensed_by_name'
        ]
        read_only_fields = [
            'id', 'prescribed_at', 'updated_at', 'dispensed_at',
            'quantity_dispensed', 'patient_id', 'patient_name',
            'remaining_quantity', 'frequency_display',
            'prescribed_by_name', 'dispensed_by_name'
        ]


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating prescriptions"""
    
    class Meta:
        model = Prescription
        fields = [
            'consultation', 'medication_name', 'generic_name', 'strength',
            'dosage_form', 'frequency', 'custom_frequency', 'dosage_instructions',
            'duration', 'quantity_prescribed', 'special_instructions'
        ]
    
    def validate(self, data):
        """Validate prescription data"""
        if data.get('frequency') == 'CUSTOM' and not data.get('custom_frequency'):
            raise serializers.ValidationError({
                'custom_frequency': 'Custom frequency is required when frequency is set to CUSTOM.'
            })
        return data


class DoctorDashboardSerializer(serializers.Serializer):
    """Serializer for doctor dashboard data"""
    
    today_consultations = serializers.IntegerField()
    pending_consultations = serializers.IntegerField()
    patients_waiting = serializers.IntegerField()
    lab_requests_pending = serializers.IntegerField()
    prescriptions_today = serializers.IntegerField()
    recent_consultations = ConsultationListSerializer(many=True)
    urgent_cases = ConsultationListSerializer(many=True)