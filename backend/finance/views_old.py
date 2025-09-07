from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from core.permissions import IsStaffMember, IsAdminUser
from .models import ServicePricing, ExpenseCategory, ExpenseRecord, StaffSalary
from .serializers import (
    ServicePricingSerializer, ExpenseCategorySerializer, ExpenseRecordSerializer,
    StaffSalarySerializer
)


class ServicePricingViewSet(viewsets.ModelViewSet):
    """
    Admin manages all service pricing.
    Staff can only view pricing for billing.
    """
    queryset = ServicePricing.objects.all()
    serializer_class = ServicePricingSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated(), IsStaffMember()]
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get services grouped by category."""
        category = request.query_params.get('category')
        queryset = self.get_queryset()
        
        if category:
            queryset = queryset.filter(service_category=category)
        
        queryset = queryset.filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def lookup_price(self, request):
        """Quick price lookup for billing."""
        service_code = request.query_params.get('service_code')
        is_emergency = request.query_params.get('emergency', 'false').lower() == 'true'
        
        if not service_code:
            return Response(
                {'error': 'service_code parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            service = ServicePricing.objects.get(
                service_code=service_code,
                is_active=True
            )
            
            price = service.emergency_price if is_emergency and service.emergency_price else service.standard_price
            
            return Response({
                'service_name': service.service_name,
                'service_code': service.service_code,
                'price': price,
                'emergency_price': service.emergency_price,
                'standard_price': service.standard_price,
                'department': service.department
            })
        
        except ServicePricing.DoesNotExist:
            return Response(
                {'error': 'Service not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    """
    Manage expense categories.
    Admin can create/edit categories.
    Staff can view for expense entry.
    """
    queryset = ExpenseCategory.objects.filter(is_active=True)
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated(), IsStaffMember()]
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get categories grouped by type."""
        category_type = request.query_params.get('type')
        queryset = self.get_queryset()
        
        if category_type:
            queryset = queryset.filter(category_type=category_type)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ExpenseRecordViewSet(viewsets.ModelViewSet):
    """
    Expense tracking and management.
    Staff can create/view expenses.
    Admin can approve/reject expenses.
    """
    queryset = ExpenseRecord.objects.all()
    serializer_class = ExpenseRecordSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    
    def get_queryset(self):
        queryset = ExpenseRecord.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(expense_status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(expense_date__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(expense_date__lte=end_date)
            except ValueError:
                pass
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)
        
        return queryset.order_by('-expense_date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin approves an expense."""
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admins can approve expenses'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        expense = self.get_object()
        
        if expense.expense_status != 'PENDING':
            return Response(
                {'error': 'Only pending expenses can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expense.expense_status = 'APPROVED'
        expense.approved_by = request.user
        expense.save()
        
        serializer = self.get_serializer(expense)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin rejects an expense."""
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admins can reject expenses'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        expense = self.get_object()
        
        if expense.expense_status != 'PENDING':
            return Response(
                {'error': 'Only pending expenses can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expense.expense_status = 'REJECTED'
        expense.approved_by = request.user
        expense.save()
        
        serializer = self.get_serializer(expense)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark expense as paid."""
        expense = self.get_object()
        
        if expense.expense_status != 'APPROVED':
            return Response(
                {'error': 'Only approved expenses can be marked as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_date = request.data.get('payment_date')
        payment_reference = request.data.get('payment_reference', '')
        
        if payment_date:
            try:
                payment_date = datetime.strptime(payment_date, '%Y-%m-%d').date()
            except ValueError:
                payment_date = timezone.now().date()
        else:
            payment_date = timezone.now().date()
        
        expense.expense_status = 'PAID'
        expense.payment_date = payment_date
        expense.payment_reference = payment_reference
        expense.paid_by = request.user
        expense.save()
        
        serializer = self.get_serializer(expense)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get expenses pending approval."""
        expenses = self.get_queryset().filter(expense_status='PENDING')
        serializer = self.get_serializer(expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly expense summary."""
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not month or not year:
            today = timezone.now().date()
            month = today.month
            year = today.year
        else:
            month = int(month)
            year = int(year)
        
        # Calculate date range for the month
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
        
        # Get expenses for the month
        expenses = ExpenseRecord.objects.filter(
            expense_date__gte=start_date,
            expense_date__lte=end_date,
            expense_status='PAID'
        )
        
        # Summary by category
        category_summary = expenses.values(
            'category__name',
            'category__category_type'
        ).annotate(
            total_amount=Sum('amount'),
            expense_count=Count('id')
        ).order_by('-total_amount')
        
        # Overall totals
        total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        return Response({
            'month': month,
            'year': year,
            'total_expenses': total_expenses,
            'category_breakdown': category_summary,
            'expense_count': expenses.count()
        })


class StaffSalaryViewSet(viewsets.ModelViewSet):
    """
    Staff salary and payroll management.
    Admin can manage all salaries.
    Staff can view their own salaries.
    """
    queryset = StaffSalary.objects.all()
    serializer_class = StaffSalarySerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    
    def get_queryset(self):
        queryset = StaffSalary.objects.all()
        
        # Non-admin users can only see their own salaries
        if not self.request.user.is_admin:
            queryset = queryset.filter(staff_member=self.request.user)
        
        # Filter by month/year
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        
        if month and year:
            try:
                filter_date = datetime(int(year), int(month), 1).date()
                queryset = queryset.filter(salary_month=filter_date)
            except ValueError:
                pass
        
        return queryset.order_by('-salary_month', 'staff_member__full_name')
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated(), IsStaffMember()]
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark salary as paid."""
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admins can mark salaries as paid'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        salary = self.get_object()
        
        payment_date = request.data.get('payment_date')
        payment_reference = request.data.get('payment_reference', '')
        
        if payment_date:
            try:
                payment_date = datetime.strptime(payment_date, '%Y-%m-%d').date()
            except ValueError:
                payment_date = timezone.now().date()
        else:
            payment_date = timezone.now().date()
        
        salary.payment_status = 'PAID'
        salary.payment_date = payment_date
        salary.payment_reference = payment_reference
        salary.save()
        
        serializer = self.get_serializer(salary)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def payroll_summary(self, request):
        """Get payroll summary for a month."""
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not month or not year:
            today = timezone.now().date()
            month = today.month
            year = today.year
        else:
            month = int(month)
            year = int(year)
        
        filter_date = datetime(year, month, 1).date()
        
        salaries = StaffSalary.objects.filter(salary_month=filter_date)
        
        # Summary calculations
        summary = salaries.aggregate(
            total_basic=Sum('basic_salary'),
            total_allowances=Sum('allowances'),
            total_overtime=Sum('overtime_amount'),
            total_deductions=Sum('deductions'),
            total_net=Sum('net_salary')
        )
        
        # Payment status breakdown
        status_breakdown = salaries.values('payment_status').annotate(
            count=Count('id'),
            total_amount=Sum('net_salary')
        )
        
        return Response({
            'month': month,
            'year': year,
            'staff_count': salaries.count(),
            'summary': summary,
            'payment_status': status_breakdown
        })
