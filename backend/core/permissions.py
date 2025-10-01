from rest_framework.permissions import BasePermission


class IsLabStaff(BasePermission):
    """
    Permission for lab staff members only.
    Allows access to users with LAB role.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role == 'LAB'
        )


class IsLabStaffOrDoctor(BasePermission):
    """
    Permission for lab staff or doctors.
    Allows access to users with LAB or DOCTOR role.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role in ['LAB', 'DOCTOR']
        )


class IsDoctorStaff(BasePermission):
    """
    Permission for doctor staff members only.
    Allows access to users with DOCTOR role.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role == 'DOCTOR'
        )


class IsReceptionStaff(BasePermission):
    """
    Permission for reception staff members only.
    Allows access to users with RECEPTION role.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role == 'RECEPTION'
        )


class IsPharmacyStaff(BasePermission):
    """
    Permission for pharmacy staff members only.
    Allows access to users with PHARMACY role.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role == 'PHARMACY'
        )


class IsAdminUser(BasePermission):
    """
    Permission for admin users only.
    Allows access to users with ADMIN role.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role == 'ADMIN'
        )


class IsStaffMember(BasePermission):
    """
    Permission for any staff member (not patients).
    Allows access to users with any staff role.
    """

    STAFF_ROLES = ['ADMIN', 'DOCTOR', 'LAB', 'PHARMACY', 'RECEPTION', 'FINANCE', 'NURSE']

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role in self.STAFF_ROLES
        )
