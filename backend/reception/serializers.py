from rest_framework import serializers
from patients.models import Patient
from patients.serializers import PatientCreateSerializer


class PatientRegistrationSerializer(PatientCreateSerializer):
    """Serializer specifically for patient registration at reception"""
    
    file_fee_paid = serializers.BooleanField(default=False)
    
    class Meta(PatientCreateSerializer.Meta):
        fields = PatientCreateSerializer.Meta.fields + ['file_fee_paid']
    
    def validate(self, data):
        """Additional validation for patient registration"""
        # Check if patient with same phone already exists
        phone = data.get('phone_number')
        if phone and Patient.objects.filter(phone_number=phone).exists():
            raise serializers.ValidationError({
                'phone_number': 'A patient with this phone number already exists.'
            })
        
        return data


class PatientUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating patient details at reception"""
    
    class Meta:
        model = Patient
        fields = [
            'full_name', 'phone_number', 'gender', 'date_of_birth',
            'emergency_contact_name', 'emergency_contact_phone', 
            'address', 'tribe', 'weight', 'height', 'blood_group', 
            'allergies', 'chronic_conditions', 'file_fee_paid'
        ]
    
    def validate_phone_number(self, value):
        """Ensure phone number is unique (excluding current patient)"""
        patient_id = self.instance.id if self.instance else None
        if Patient.objects.filter(phone_number=value).exclude(id=patient_id).exists():
            raise serializers.ValidationError("A patient with this phone number already exists.")
        return value
    
    def validate_date_of_birth(self, value):
        """Ensure date of birth is not in the future"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        return value
