from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Consultation, LabTestRequest, Prescription

User = get_user_model()


class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating consultations"""

    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    blood_pressure = serializers.ReadOnlyField()
    can_proceed_to_completion = serializers.ReadOnlyField()
    payment_status = serializers.ReadOnlyField()

    class Meta:
        model = Consultation
        fields = [
            'id', 'patient_id', 'patient_name', 'doctor', 'doctor_name',
            'chief_complaint', 'symptoms', 'examination_findings', 'diagnosis',
            'treatment_plan', 'general_advice', 'follow_up_date', 'priority', 'status',
            'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic',
            'heart_rate', 'respiratory_rate', 'blood_pressure', 'doctor_notes',

            # New clinical notes fields
            'clinical_notes', 'possible_diagnosis', 'medication_plan',

            # Payment fields
            'consultation_fee_required', 'consultation_fee_amount',
            'consultation_fee_paid', 'consultation_fee_payment_date',
            'can_proceed_to_completion', 'payment_status',

            'consultation_date', 'updated_at', 'completed_at', 'duration_minutes'
        ]
        read_only_fields = [
            'id', 'consultation_date', 'updated_at', 'completed_at',
            'consultation_fee_payment_date', 'duration_minutes', 'blood_pressure',
            'doctor_name', 'can_proceed_to_completion', 'payment_status'
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
    """Comprehensive serializer for lab test requests matching hospital form"""

    requested_by_name = serializers.CharField(source='requested_by.full_name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)
    can_proceed_to_testing = serializers.ReadOnlyField()
    requested_tests_count = serializers.ReadOnlyField()
    payment_status = serializers.ReadOnlyField()

    class Meta:
        model = LabTestRequest
        fields = [
            'id', 'consultation', 'patient_id', 'patient_name', 'patient_age',
            'patient_sex', 'patient_address', 'patient_phone', 'short_clinical_notes',

            # PARASITOLOGY TESTS
            'mrdt_requested', 'mrdt_result', 'bs_requested', 'bs_result',
            'stool_analysis_requested', 'stool_macro_result', 'stool_micro_result',
            'urine_sed_requested', 'urine_sed_macro_result', 'urine_sed_micro_result',
            'urinalysis_requested', 'urinalysis_urobilinogen', 'urinalysis_glucose',
            'urinalysis_bilirubin', 'urinalysis_ketones', 'urinalysis_sg',
            'urinalysis_blood', 'urinalysis_ph', 'urinalysis_protein',
            'urinalysis_nitrite', 'urinalysis_leucocytes',

            # MICROBIOLOGY TESTS
            'rpr_requested', 'rpr_result', 'h_pylori_requested', 'h_pylori_result',
            'hepatitis_b_requested', 'hepatitis_b_result', 'hepatitis_c_requested',
            'hepatitis_c_result', 'ssat_requested', 'ssat_result',
            'upt_requested', 'upt_result',

            # CLINICAL CHEMISTRY & HEMATOLOGY
            'esr_requested', 'esr_result', 'blood_grouping_requested', 'blood_grouping_result',
            'hb_requested', 'hb_result', 'rheumatoid_factor_requested', 'rheumatoid_factor_result',
            'rbg_requested', 'rbg_result', 'fbg_requested', 'fbg_result',
            'sickling_test_requested', 'sickling_test_result',

            # Status and tracking
            'status', 'lab_fee_required', 'lab_fee_amount', 'lab_fee_paid',
            'lab_fee_payment_date', 'reported_by', 'signature',
            'requested_at', 'updated_at', 'investigation_date', 'completed_at',

            # Read-only properties
            'requested_by_name', 'processed_by_name', 'can_proceed_to_testing',
            'requested_tests_count', 'payment_status'
        ]
        read_only_fields = [
            'id', 'requested_at', 'updated_at', 'completed_at', 'lab_fee_payment_date',
            'requested_by_name', 'processed_by_name', 'can_proceed_to_testing',
            'requested_tests_count', 'payment_status'
        ]


class LabTestRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comprehensive lab test requests"""

    consultation_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = LabTestRequest
        fields = [
            'consultation_id', 'patient_id', 'patient_name', 'patient_age',
            'patient_sex', 'patient_address', 'patient_phone', 'short_clinical_notes',

            # All test request fields
            'mrdt_requested', 'bs_requested', 'stool_analysis_requested',
            'urine_sed_requested', 'urinalysis_requested', 'rpr_requested',
            'h_pylori_requested', 'hepatitis_b_requested', 'hepatitis_c_requested',
            'ssat_requested', 'upt_requested', 'esr_requested',
            'blood_grouping_requested', 'hb_requested', 'rheumatoid_factor_requested',
            'rbg_requested', 'fbg_requested', 'sickling_test_requested',

            # Payment info
            'lab_fee_required', 'lab_fee_amount', 'status'
        ]

    def validate(self, data):
        """Ensure at least one test is requested"""
        test_fields = [
            'mrdt_requested', 'bs_requested', 'stool_analysis_requested',
            'urine_sed_requested', 'urinalysis_requested', 'rpr_requested',
            'h_pylori_requested', 'hepatitis_b_requested', 'hepatitis_c_requested',
            'ssat_requested', 'upt_requested', 'esr_requested',
            'blood_grouping_requested', 'hb_requested', 'rheumatoid_factor_requested',
            'rbg_requested', 'fbg_requested', 'sickling_test_requested'
        ]

        requested_tests = sum(1 for field in test_fields if data.get(field, False))
        if requested_tests == 0:
            raise serializers.ValidationError("At least one test must be requested.")

        return data

    def create(self, validated_data):
        """Handle consultation_id conversion to consultation ForeignKey"""
        consultation_id = validated_data.pop('consultation_id', None)

        if consultation_id:
            from .models import Consultation
            try:
                consultation = Consultation.objects.get(id=consultation_id)
                validated_data['consultation'] = consultation
            except Consultation.DoesNotExist:
                raise serializers.ValidationError({"consultation_id": "Consultation not found"})

        return super().create(validated_data)


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for prescriptions"""
    
    prescribed_by_name = serializers.CharField(source='prescribed_by.full_name', read_only=True)
    dispensed_by_name = serializers.CharField(source='dispensed_by.full_name', read_only=True)
    patient_id = serializers.CharField(source='consultation.patient_id', read_only=True)
    patient_name = serializers.CharField(source='consultation.patient_name', read_only=True)
    remaining_quantity = serializers.ReadOnlyField()
    frequency_display = serializers.ReadOnlyField()
    total_cost = serializers.ReadOnlyField()

    class Meta:
        model = Prescription
        fields = [
            'id', 'consultation', 'patient_id', 'patient_name',
            'medication_id', 'medication_name', 'generic_name', 'unit_price', 'total_cost',
            'strength', 'dosage_form', 'frequency', 'frequency_display', 'custom_frequency',
            'dosage_instructions', 'duration', 'quantity_prescribed',
            'quantity_dispensed', 'remaining_quantity', 'status',
            'special_instructions', 'prescribed_at', 'updated_at',
            'dispensed_at', 'prescribed_by_name', 'dispensed_by_name'
        ]
        read_only_fields = [
            'id', 'prescribed_at', 'updated_at', 'dispensed_at',
            'quantity_dispensed', 'patient_id', 'patient_name',
            'remaining_quantity', 'frequency_display', 'total_cost',
            'prescribed_by_name', 'dispensed_by_name'
        ]


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating prescriptions"""

    class Meta:
        model = Prescription
        fields = [
            'consultation', 'medication_id', 'medication_name', 'generic_name',
            'unit_price', 'strength', 'dosage_form', 'frequency', 'custom_frequency',
            'dosage_instructions', 'duration', 'quantity_prescribed', 'special_instructions'
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