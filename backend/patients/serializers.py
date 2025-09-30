from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Patient, PatientStatusHistory, PatientNote

User = get_user_model()


class PatientSerializer(serializers.ModelSerializer):
    """Main patient serializer with all fields"""
    
    age = serializers.ReadOnlyField()
    bmi = serializers.ReadOnlyField()
    is_new_patient = serializers.ReadOnlyField()
    requires_file_fee = serializers.ReadOnlyField()
    is_nhif_patient = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    last_updated_by_name = serializers.CharField(source='last_updated_by.full_name', read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'first_name', 'middle_name', 'last_name', 'full_name', 'phone_number', 'gender', 'date_of_birth',
            'patient_type', 'patient_category', 'nhif_card_number',
            'emergency_contact_name', 'emergency_contact_phone', 'address', 'tribe', 'occupation',
            'weight', 'height', 'blood_group', 'allergies', 'chronic_conditions',
            'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'pulse_rate', 'respiratory_rate',
            'file_fee_paid', 'file_fee_amount', 'file_fee_payment_date',
            'current_status', 'current_location',
            'created_at', 'updated_at', 'created_by_name', 'last_updated_by_name',
            'age', 'bmi', 'is_new_patient', 'requires_file_fee', 'is_nhif_patient'
        ]
        read_only_fields = [
            'id', 'patient_id', 'full_name', 'created_at', 'updated_at', 'file_fee_payment_date',
            'age', 'bmi', 'is_new_patient', 'requires_file_fee', 'is_nhif_patient',
            'created_by_name', 'last_updated_by_name'
        ]
    
    def validate_date_of_birth(self, value):
        """Ensure date of birth is not in the future"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        return value
    
    def validate_phone_number(self, value):
        """Custom phone number validation"""
        if not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError("Phone number must contain only digits, +, -, and spaces.")
        return value

    def validate(self, data):
        """Cross-field validation for NHIF patients"""
        patient_type = data.get('patient_type', 'NORMAL')
        nhif_card_number = data.get('nhif_card_number')

        if patient_type == 'NHIF' and not nhif_card_number:
            raise serializers.ValidationError({
                'nhif_card_number': 'NHIF card number is required for NHIF patients.'
            })

        if patient_type == 'NORMAL' and nhif_card_number:
            # Clear NHIF card number for normal patients
            data['nhif_card_number'] = None

        return data


class PatientSearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for search results"""

    age = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'full_name', 'phone_number', 'gender',
            'patient_type', 'nhif_card_number',
            'current_status', 'current_location', 'age', 'created_at', 'updated_at'
        ]


class PatientQueueSerializer(serializers.ModelSerializer):
    """Serializer for queue ordering with queue entry time"""

    age = serializers.ReadOnlyField()
    queue_entry_time = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'full_name', 'phone_number', 'gender',
            'patient_type', 'nhif_card_number',
            'current_status', 'current_location', 'age', 'created_at', 'updated_at',
            'queue_entry_time'
        ]

    def get_queue_entry_time(self, obj):
        """Get the time when patient entered the current queue (status changed to WAITING_DOCTOR)"""
        # Find the most recent status change to WAITING_DOCTOR
        waiting_doctor_change = obj.status_history.filter(
            new_status='WAITING_DOCTOR'
        ).order_by('-changed_at').first()

        if waiting_doctor_change:
            return waiting_doctor_change.changed_at.isoformat()

        # If no status change found, use updated_at as fallback
        return obj.updated_at.isoformat()


class PatientDetailSerializer(serializers.ModelSerializer):
    """Detailed patient information with related data"""
    
    age = serializers.ReadOnlyField()
    bmi = serializers.ReadOnlyField()
    is_new_patient = serializers.ReadOnlyField()
    requires_file_fee = serializers.ReadOnlyField()
    is_nhif_patient = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    created_by_role = serializers.CharField(source='created_by.role', read_only=True)
    last_updated_by_name = serializers.CharField(source='last_updated_by.full_name', read_only=True)
    
    # Include recent status history
    recent_status_changes = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'full_name', 'phone_number', 'gender', 'date_of_birth',
            'patient_type', 'nhif_card_number',
            'emergency_contact_name', 'emergency_contact_phone', 'address', 'tribe', 'occupation',
            'weight', 'height', 'blood_group', 'allergies', 'chronic_conditions',
            'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'pulse_rate',
            'file_fee_paid', 'file_fee_amount', 'file_fee_payment_date',
            'current_status', 'current_location',
            'created_at', 'updated_at', 'created_by_name', 'created_by_role',
            'last_updated_by_name', 'age', 'bmi', 'is_new_patient', 'requires_file_fee', 'is_nhif_patient',
            'recent_status_changes'
        ]
    
    def get_recent_status_changes(self, obj):
        """Get last 5 status changes"""
        recent_changes = obj.status_history.all()[:5]
        return PatientStatusHistorySerializer(recent_changes, many=True).data


class PatientStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating patient status only"""
    
    notes = serializers.CharField(required=False, allow_blank=True, help_text="Optional notes about status change")
    
    class Meta:
        model = Patient
        fields = ['current_status', 'current_location', 'notes']
    
    def validate_current_status(self, value):
        """Ensure valid status transitions"""
        if not value:
            raise serializers.ValidationError("Status is required.")
        
        valid_statuses = [choice[0] for choice in Patient.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Valid options: {', '.join(valid_statuses)}")
        
        return value


class PatientStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for patient status history"""
    
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)
    changed_by_role = serializers.CharField(source='changed_by.role', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    
    class Meta:
        model = PatientStatusHistory
        fields = [
            'id', 'previous_status', 'new_status', 'previous_location', 'new_location',
            'changed_at', 'notes', 'changed_by_name', 'changed_by_role', 'patient_name'
        ]


class PatientNoteSerializer(serializers.ModelSerializer):
    """Serializer for patient notes"""
    
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    created_by_role = serializers.CharField(source='created_by.role', read_only=True)
    
    class Meta:
        model = PatientNote
        fields = [
            'id', 'note', 'note_type', 'created_at',
            'created_by_name', 'created_by_role'
        ]
        read_only_fields = ['id', 'created_at', 'created_by_name', 'created_by_role']


class PatientCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new patients (minimal required fields)"""

    class Meta:
        model = Patient
        fields = [
            'first_name', 'middle_name', 'last_name', 'phone_number', 'gender', 'date_of_birth',
            'patient_type', 'patient_category', 'nhif_card_number',
            'emergency_contact_name', 'emergency_contact_phone', 'address', 'tribe', 'occupation',
            'weight', 'height', 'blood_group', 'allergies', 'chronic_conditions',
            'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'pulse_rate', 'respiratory_rate'
        ]

    def validate_date_of_birth(self, value):
        """Ensure date of birth is not in the future"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        return value
