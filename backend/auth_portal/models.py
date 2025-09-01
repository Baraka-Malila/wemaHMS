from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
import uuid


class UserManager(BaseUserManager):
    def create_user(self, employee_id, password=None, **extra_fields):
        if not employee_id:
            raise ValueError('Employee ID is required')
        
        extra_fields.setdefault('is_active', True)
        user = self.model(employee_id=employee_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, employee_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(employee_id, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('ADMIN', 'Administrator'),
        ('RECEPTION', 'Reception'),
        ('DOCTOR', 'Doctor'),
        ('LAB', 'Laboratory'),
        ('PHARMACY', 'Pharmacy'),
        ('NURSE', 'Nurse'),
        ('FINANCE', 'Finance'),
    ]
    
    # Employee ID validator (format: EMP001, DOC015, etc.)
    employee_id_validator = RegexValidator(
        regex=r'^[A-Z]{3}[0-9]{3}$',
        message='Employee ID must be in format: ABC123 (3 letters + 3 numbers)'
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_id = models.CharField(
        max_length=6,
        unique=True,
        validators=[employee_id_validator],
        help_text='Format: ABC123 (e.g., EMP001, DOC015)'
    )
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, help_text='For system notifications only')
    phone_number = models.CharField(max_length=15)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Track who created this user (for audit)
    created_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_users'
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'employee_id'
    REQUIRED_FIELDS = ['full_name', 'email', 'phone_number', 'role']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.employee_id} - {self.full_name} ({self.role})"
    
    @property
    def is_admin(self):
        return self.role == 'ADMIN'
    
    @property
    def portal_access(self):
        """Returns which portal this user can access"""
        portal_mapping = {
            'ADMIN': 'admin',
            'RECEPTION': 'reception',
            'DOCTOR': 'doctor',
            'LAB': 'lab',
            'PHARMACY': 'pharmacy',
            'NURSE': 'nurse',
            'FINANCE': 'finance',
        }
        return portal_mapping.get(self.role, '')


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    admin_who_reset = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='password_resets_handled'
    )
    
    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reset token for {self.user.employee_id}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired


class UserSession(models.Model):
    """Track user sessions for security"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_sessions'
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"Session for {self.user.employee_id}"
