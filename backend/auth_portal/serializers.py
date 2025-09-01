from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
import random
import string
from .models import User, PasswordResetToken


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information (safe for public viewing)"""
    portal_access = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'employee_id', 'full_name', 'email', 
            'phone_number', 'role', 'is_active', 
            'created_at', 'last_login', 'portal_access'
        ]
        read_only_fields = ['id', 'created_at', 'last_login']


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    employee_id = serializers.CharField(max_length=6)
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False)
    
    def validate(self, attrs):
        employee_id = attrs.get('employee_id')
        password = attrs.get('password')
        
        if not employee_id or not password:
            raise serializers.ValidationError('Employee ID and password are required.')
        
        # Convert to uppercase for consistency
        employee_id = employee_id.upper()
        
        user = authenticate(username=employee_id, password=password)
        
        if not user:
            raise serializers.ValidationError('Invalid employee ID or password.')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        
        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration (admin only)"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'employee_id', 'full_name', 'email', 'phone_number', 
            'role', 'password', 'confirm_password'
        ]
    
    def validate_employee_id(self, value):
        """Validate and format employee ID"""
        value = value.upper()
        
        # Check format using the model validator
        if not value or len(value) != 6:
            raise serializers.ValidationError(
                'Employee ID must be in format: ABC123 (3 letters + 3 numbers)'
            )
        
        if not (value[:3].isalpha() and value[3:].isdigit()):
            raise serializers.ValidationError(
                'Employee ID must be in format: ABC123 (3 letters + 3 numbers)'
            )
        
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Passwords do not match.')
        
        attrs.pop('confirm_password')  # Remove confirm_password from validated data
        return attrs
    
    def create(self, validated_data):
        # Get the admin user creating this account
        request = self.context.get('request')
        created_by = request.user if request and request.user.is_authenticated else None
        
        user = User.objects.create_user(
            created_by=created_by,
            **validated_data
        )
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    employee_id = serializers.CharField(max_length=6)
    
    def validate_employee_id(self, value):
        value = value.upper()
        
        try:
            user = User.objects.get(employee_id=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError('Employee ID not found or inactive.')
        
        return value
    
    def save(self):
        employee_id = self.validated_data['employee_id']
        user = User.objects.get(employee_id=employee_id)
        
        # Invalidate any existing tokens
        PasswordResetToken.objects.filter(
            user=user, 
            is_used=False
        ).update(is_used=True, used_at=timezone.now())
        
        # Generate new 6-digit token
        token = ''.join(random.choices(string.digits, k=6))
        
        # Create new reset token (expires in 30 minutes)
        reset_token = PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(minutes=30)
        )
        
        return reset_token


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for admin to confirm password reset"""
    employee_id = serializers.CharField(max_length=6)
    token = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Passwords do not match.')
        
        employee_id = attrs['employee_id'].upper()
        token = attrs['token']
        
        try:
            user = User.objects.get(employee_id=employee_id, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError('Employee ID not found or inactive.')
        
        try:
            reset_token = PasswordResetToken.objects.get(
                user=user,
                token=token,
                is_used=False
            )
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError('Invalid or already used token.')
        
        if reset_token.is_expired:
            raise serializers.ValidationError('Token has expired.')
        
        attrs['user'] = user
        attrs['reset_token'] = reset_token
        attrs.pop('confirm_password')
        
        return attrs
    
    def save(self):
        user = self.validated_data['user']
        reset_token = self.validated_data['reset_token']
        new_password = self.validated_data['new_password']
        
        # Get the admin performing the reset
        request = self.context.get('request')
        admin_user = request.user if request and request.user.is_authenticated else None
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.used_at = timezone.now()
        reset_token.admin_who_reset = admin_user
        reset_token.save()
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for user to change their own password"""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError('New passwords do not match.')
        
        attrs.pop('confirm_password')
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
