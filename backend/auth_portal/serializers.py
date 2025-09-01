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
    remaining_temporary_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'employee_id', 'full_name', 'email', 
            'phone_number', 'role', 'is_active', 
            'created_at', 'last_login', 'portal_access',
            'remaining_temporary_hours'
        ]
        read_only_fields = ['id', 'created_at', 'last_login']
    
    def get_remaining_temporary_hours(self, obj):
        """Calculate remaining temporary access hours"""
        if obj.is_approved or not obj.temporary_access_expires:
            return None
        
        remaining = obj.temporary_access_expires - timezone.now()
        if remaining.total_seconds() <= 0:
            return 0
        
        return round(remaining.total_seconds() / 3600, 1)  # Convert to hours with 1 decimal


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
        
        # Check if user can login (approved or has temporary access)
        if not user.can_login:
            if user.temporary_access_expires and timezone.now() >= user.temporary_access_expires:
                raise serializers.ValidationError('Temporary access expired. Please contact admin for account approval.')
            else:
                raise serializers.ValidationError('Account pending admin approval.')
        
        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user self-registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'phone_number', 
            'role', 'password', 'confirm_password'
        ]
        # Remove employee_id since it's auto-generated
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Passwords do not match.')
        
        attrs.pop('confirm_password')  # Remove confirm_password from validated data
        return attrs
    
    def create(self, validated_data):
        # Employee ID will be auto-generated based on role
        user = User.objects.create_user(**validated_data)
        
        # Set temporary access for 8 hours
        user.is_active = True
        user.temporary_access_expires = timezone.now() + timedelta(hours=8)
        user.save()
        
        return user


class AdminRegisterSerializer(serializers.ModelSerializer):
    """Serializer for admin creating users directly (approved automatically)"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'phone_number', 
            'role', 'password', 'confirm_password'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Passwords do not match.')
        
        attrs.pop('confirm_password')
        return attrs
    
    def create(self, validated_data):
        # Get the admin user creating this account
        request = self.context.get('request')
        admin_user = request.user if request and request.user.is_authenticated else None
        
        user = User.objects.create_user(**validated_data)
        
        # Auto-approve since admin is creating directly
        user.is_active = True
        user.is_approved = True
        user.created_by = admin_user
        user.approved_by = admin_user
        user.approved_at = timezone.now()
        user.save()
        
        return user


class PendingUserSerializer(serializers.ModelSerializer):
    """Serializer for pending user approval"""
    
    class Meta:
        model = User
        fields = [
            'id', 'employee_id', 'full_name', 'email', 
            'phone_number', 'role', 'created_at'
        ]
        read_only_fields = ['id', 'employee_id', 'created_at']


class ApproveUserSerializer(serializers.Serializer):
    """Serializer for admin to approve/reject user"""
    user_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    
    def validate_user_id(self, value):
        try:
            user = User.objects.get(id=value, is_active=False, is_approved=False)
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found or already processed.')
        
        return value
    
    def save(self):
        user_id = self.validated_data['user_id']
        action = self.validated_data['action']
        
        user = User.objects.get(id=user_id)
        admin_user = self.context['request'].user
        
        if action == 'approve':
            user.is_active = True
            user.is_approved = True
            user.approved_by = admin_user
            user.approved_at = timezone.now()
            user.save()
            return user
        else:  # reject
            user.delete()
            return None


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
