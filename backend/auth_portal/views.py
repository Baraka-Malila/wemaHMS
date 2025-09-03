from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import User, PasswordResetToken
from .serializers import (
    LoginSerializer, 
    RegisterSerializer,
    AdminRegisterSerializer,
    UserSerializer,
    PendingUserSerializer,
    ApproveUserSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer
)


@swagger_auto_schema(
    method='post',
    request_body=LoginSerializer,
    responses={
        200: openapi.Response(
            description='Login successful',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Login successful',
                    'token': 'your-auth-token-here',
                    'user': {
                        'employee_id': 'EMP001',
                        'full_name': 'John Doe',
                        'role': 'ADMIN',
                        'portal_access': 'admin'
                    }
                }
            }
        ),
        400: 'Invalid credentials'
    }
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Employee login with Employee ID and password"""
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        remember_me = serializer.validated_data.get('remember_me', False)
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        # Django session login
        login(request, user)
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'token': token.key,
            'user': UserSerializer(user).data,
            'remember_me': remember_me
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Invalid credentials',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    responses={
        200: openapi.Response(
            description='Logout successful',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Logout successful'
                }
            }
        )
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout user and invalidate token"""
    try:
        # Delete the user's token
        request.user.auth_token.delete()
    except:
        pass
    
    # Django session logout
    logout(request)
    
    return Response({
        'success': True,
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='post',
    request_body=RegisterSerializer,
    responses={
        201: openapi.Response(
            description='Registration request submitted',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Registration request submitted for approval',
                    'employee_id': 'DOC001',
                    'instructions': 'Wait for admin approval to activate your account'
                }
            }
        ),
        400: 'Validation error'
    }
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Self-registration for new users (requires admin approval)"""
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'success': True,
            'message': 'Registration successful',
            'employee_id': user.employee_id,
            'instructions': 'You can login immediately for 8 hours. Admin approval needed for permanent access.',
            'temporary_access_hours': 8
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Validation error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=AdminRegisterSerializer,
    responses={
        201: openapi.Response(
            description='User created successfully by admin',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'User created and approved successfully',
                    'user': {
                        'employee_id': 'DOC001',
                        'full_name': 'Dr. Jane Smith',
                        'role': 'DOCTOR'
                    }
                }
            }
        ),
        400: 'Validation error',
        403: 'Only admins can create users directly'
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def admin_create_user_view(request):
    """Admin creates user directly (auto-approved)"""
    if not request.user.is_admin:
        return Response({
            'success': False,
            'message': 'Only administrators can create users directly'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = AdminRegisterSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'success': True,
            'message': 'User created and approved successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Validation error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=PasswordResetRequestSerializer,
    responses={
        200: openapi.Response(
            description='Reset token generated',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Reset token generated successfully',
                    'token': '123456',
                    'expires_in_minutes': 30,
                    'instructions': 'Take this token and your ID to the administrator'
                }
            }
        ),
        400: 'Employee ID not found'
    }
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request_view(request):
    """Request password reset token"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        reset_token = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Reset token generated successfully',
            'token': reset_token.token,
            'expires_in_minutes': 30,
            'instructions': 'Take this token and your Employee ID to the administrator for password reset'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Validation error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=PasswordResetConfirmSerializer,
    responses={
        200: openapi.Response(
            description='Password reset successful',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'Password reset successful'
                }
            }
        ),
        400: 'Invalid token or validation error',
        403: 'Only admins can reset passwords'
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def password_reset_confirm_view(request):
    """Confirm password reset (Admin only)"""
    if not request.user.is_admin:
        return Response({
            'success': False,
            'message': 'Only administrators can reset passwords'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PasswordResetConfirmSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.save()
        
        return Response({
            'success': True,
            'message': f'Password reset successful for {user.employee_id}'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Validation error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=ChangePasswordSerializer,
    responses={
        200: 'Password changed successfully',
        400: 'Validation error'
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """Change current user's password"""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Validation error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    responses={
        200: UserSerializer,
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    return Response({
        'success': True,
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='get',
    responses={
        200: openapi.Response(
            description='List of all users',
            examples={
                'application/json': {
                    'success': True,
                    'users': [
                        {
                            'employee_id': 'EMP001',
                            'full_name': 'John Admin',
                            'role': 'ADMIN'
                        }
                    ]
                }
            }
        ),
        403: 'Only admins can view all users'
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def users_list_view(request):
    """List all active users (Admin only)"""
    if not request.user.is_admin:
        return Response({
            'success': False,
            'message': 'Only administrators can view all users'
        }, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.filter(is_active=True).order_by('employee_id')
    
    return Response({
        'success': True,
        'users': UserSerializer(users, many=True).data
    }, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='get',
    responses={
        200: openapi.Response(
            description='List of pending user approvals',
            examples={
                'application/json': {
                    'success': True,
                    'pending_users': [
                        {
                            'id': 'uuid',
                            'employee_id': 'DOC002',
                            'full_name': 'Dr. John Doe',
                            'role': 'DOCTOR'
                        }
                    ]
                }
            }
        ),
        403: 'Only admins can view pending approvals'
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_approvals_view(request):
    """List users pending approval (Admin only)"""
    if not request.user.is_admin:
        return Response({
            'success': False,
            'message': 'Only administrators can view pending approvals'
        }, status=status.HTTP_403_FORBIDDEN)
    
    pending_users = User.objects.filter(
        is_approved=False
    ).exclude(
        is_superuser=True  # Exclude superuser admin accounts from pending approvals
    ).order_by('created_at')
    
    return Response({
        'success': True,
        'pending_users': PendingUserSerializer(pending_users, many=True).data
    }, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='post',
    request_body=ApproveUserSerializer,
    responses={
        200: openapi.Response(
            description='User approved/rejected successfully',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'User approved successfully',
                    'user': {
                        'employee_id': 'DOC002',
                        'full_name': 'Dr. John Doe',
                        'is_active': True
                    }
                }
            }
        ),
        400: 'Validation error',
        403: 'Only admins can approve users'
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_user_view(request):
    """Approve or reject user registration (Admin only)"""
    if not request.user.is_admin:
        return Response({
            'success': False,
            'message': 'Only administrators can approve users'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ApproveUserSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.save()
        
        if user:  # approved
            return Response({
                'success': True,
                'message': f'User {user.employee_id} approved successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:  # rejected
            return Response({
                'success': True,
                'message': 'User registration rejected and removed'
            }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Validation error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='put',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'full_name': openapi.Schema(type=openapi.TYPE_STRING),
            'email': openapi.Schema(type=openapi.TYPE_STRING),
            'phone_number': openapi.Schema(type=openapi.TYPE_STRING),
            'role': openapi.Schema(type=openapi.TYPE_STRING, enum=['DOCTOR', 'NURSE', 'PHARMACY', 'LAB', 'FINANCE', 'RECEPTION']),
        }
    ),
    responses={
        200: openapi.Response(
            description='User updated successfully',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'User updated successfully',
                    'user': {
                        'employee_id': 'DOC002',
                        'full_name': 'Dr. John Doe Updated',
                        'email': 'john.updated@hospital.com'
                    }
                }
            }
        ),
        400: 'Validation error',
        403: 'Only admins can update users',
        404: 'User not found'
    }
)
@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_user_view(request, user_id):
    """Update user information (Admin only)"""
    if not request.user.is_admin:
        return Response({
            'success': False,
            'message': 'Only administrators can update users'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Update user fields
    full_name = request.data.get('full_name')
    email = request.data.get('email')
    phone_number = request.data.get('phone_number')
    role = request.data.get('role')
    
    if full_name:
        user.full_name = full_name
    if email:
        # Check email uniqueness
        if User.objects.filter(email=email).exclude(id=user_id).exists():
            return Response({
                'success': False,
                'message': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        user.email = email
    if phone_number:
        user.phone_number = phone_number
    if role:
        if role not in ['DOCTOR', 'NURSE', 'PHARMACY', 'LAB', 'FINANCE', 'RECEPTION', 'ADMIN']:
            return Response({
                'success': False,
                'message': 'Invalid role'
            }, status=status.HTTP_400_BAD_REQUEST)
        user.role = role
    
    user.save()
    
    return Response({
        'success': True,
        'message': 'User updated successfully',
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='delete',
    responses={
        200: openapi.Response(
            description='User deleted successfully',
            examples={
                'application/json': {
                    'success': True,
                    'message': 'User deleted successfully'
                }
            }
        ),
        403: 'Only admins can delete users',
        404: 'User not found'
    }
)
@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_user_view(request, user_id):
    """Delete user (Admin only)"""
    if not request.user.is_admin:
        return Response({
            'success': False,
            'message': 'Only administrators can delete users'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Prevent deletion of admin users
    if user.is_admin:
        return Response({
            'success': False,
            'message': 'Cannot delete admin users'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Store user info for response
    employee_id = user.employee_id
    user.delete()
    
    return Response({
        'success': True,
        'message': f'User {employee_id} deleted successfully'
    }, status=status.HTTP_200_OK)
