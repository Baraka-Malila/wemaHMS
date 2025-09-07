from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from core.permissions import IsAdminUser, IsStaffMember
from .models import ServicePricing, ExpenseCategory, ExpenseRecord, StaffSalary
from .serializers import (
    ServicePricingSerializer, ExpenseCategorySerializer,
    ExpenseRecordSerializer, StaffSalarySerializer,
    ExpenseSummarySerializer, PayrollSummarySerializer,
    PaymentStatusBreakdownSerializer
)


# Service Pricing Views (Admin Only)

class ServicePricingFilter(django_filters.FilterSet):
    service_category = django_filters.CharFilter(lookup_expr='icontains')
    department = django_filters.CharFilter(lookup_expr='icontains')
    min_price = django_filters.NumberFilter(field_name='standard_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='standard_price', lookup_expr='lte')
    
    class Meta:
        model = ServicePricing
        fields = ['service_category', 'department', 'is_active', 'requires_approval']


class ServicePricingViewSet(viewsets.ModelViewSet):
    """
    ADMIN & SERVICE PRICING
    
    Service Pricing Management - Complete CRUD for hospital service rates.
    Only admin users can manage service pricing that affects all departments.
    """
    queryset = ServicePricing.objects.all()
    serializer_class = ServicePricingSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ServicePricingFilter
    search_fields = ['service_name', 'service_code', 'description', 'department']
    ordering_fields = ['service_name', 'standard_price', 'created_at']
    ordering = ['service_name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active_services(self, request):
        """Get all active services for frontend selection"""
        active_services = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_services, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get services grouped by category"""
        categories = self.get_queryset().values_list('service_category', flat=True).distinct()
        result = {}
        for category in categories:
            services = self.get_queryset().filter(service_category=category, is_active=True)
            result[category] = self.get_serializer(services, many=True).data
        return Response(result)


# Expense Management Views

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    """
    EXPENSE CATEGORIES
    
    Expense Category Management - Define and organize expense types.
    Staff members can view categories, admins can manage them.
    """
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'category_type', 'monthly_budget', 'created_at']
    ordering = ['category_type', 'name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active_categories(self, request):
        """Get all active expense categories"""
        active_categories = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_categories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get categories grouped by type"""
        categories_by_type = {}
        for category_type, _ in ExpenseCategory.CATEGORY_TYPES:
            categories = self.get_queryset().filter(category_type=category_type, is_active=True)
            categories_by_type[category_type] = self.get_serializer(categories, many=True).data
        return Response(categories_by_type)


class ExpenseRecordFilter(django_filters.FilterSet):
    expense_date_from = django_filters.DateFilter(field_name='expense_date', lookup_expr='gte')
    expense_date_to = django_filters.DateFilter(field_name='expense_date', lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    category_type = django_filters.CharFilter(field_name='category__category_type')
    
    class Meta:
        model = ExpenseRecord
        fields = ['category', 'expense_status', 'payment_method', 'requested_by']


class ExpenseRecordViewSet(viewsets.ModelViewSet):
    """
    EXPENSE RECORDS
    
    Expense Record Management - Complete expense tracking with approval workflow.
    Staff can create expenses, admins approve and mark as paid.
    """
    queryset = ExpenseRecord.objects.select_related('category', 'requested_by', 'approved_by', 'paid_by')
    serializer_class = ExpenseRecordSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExpenseRecordFilter
    search_fields = ['expense_number', 'description', 'vendor_name', 'payment_reference']
    ordering_fields = ['expense_date', 'amount', 'expense_status', 'created_at']
    ordering = ['-expense_date', '-created_at']
    
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an expense record"""
        expense = self.get_object()
        if expense.expense_status != 'pending':
            return Response(
                {'error': 'Only pending expenses can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expense.expense_status = 'approved'
        expense.approved_by = request.user
        expense.save()
        
        serializer = self.get_serializer(expense)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark an expense as paid"""
        expense = self.get_object()
        if expense.expense_status != 'approved':
            return Response(
                {'error': 'Only approved expenses can be marked as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_date = request.data.get('payment_date')
        payment_method = request.data.get('payment_method')
        payment_reference = request.data.get('payment_reference')
        
        if not payment_date:
            payment_date = timezone.now().date()
        
        expense.expense_status = 'paid'
        expense.payment_date = payment_date
        expense.payment_method = payment_method or expense.payment_method
        expense.payment_reference = payment_reference or expense.payment_reference
        expense.paid_by = request.user
        expense.save()
        
        serializer = self.get_serializer(expense)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get expenses pending approval"""
        pending_expenses = self.get_queryset().filter(expense_status='pending')
        serializer = self.get_serializer(pending_expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def approved_unpaid(self, request):
        """Get approved but unpaid expenses"""
        approved_expenses = self.get_queryset().filter(expense_status='approved')
        serializer = self.get_serializer(approved_expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get expense summary by category"""
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        queryset = self.get_queryset().filter(expense_status='paid')
        
        if date_from:
            queryset = queryset.filter(expense_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(expense_date__lte=date_to)
        
        summary = queryset.values(
            'category__name',
            'category__category_type'
        ).annotate(
            total_amount=Sum('amount'),
            expense_count=Count('id')
        ).order_by('category__category_type', 'category__name')
        
        summary_data = [
            {
                'category_name': item['category__name'],
                'category_type': item['category__category_type'],
                'total_amount': item['total_amount'],
                'expense_count': item['expense_count']
            }
            for item in summary
        ]
        
        serializer = ExpenseSummarySerializer(summary_data, many=True)
        return Response(serializer.data)


# Payroll Views

class StaffSalaryFilter(django_filters.FilterSet):
    salary_month_from = django_filters.DateFilter(field_name='salary_month', lookup_expr='gte')
    salary_month_to = django_filters.DateFilter(field_name='salary_month', lookup_expr='lte')
    basic_salary_min = django_filters.NumberFilter(field_name='basic_salary', lookup_expr='gte')
    basic_salary_max = django_filters.NumberFilter(field_name='basic_salary', lookup_expr='lte')
    
    class Meta:
        model = StaffSalary
        fields = ['staff_member', 'payment_status', 'payment_method']


class StaffSalaryViewSet(viewsets.ModelViewSet):
    """
    PAYROLL MANAGEMENT
    
    Staff Salary Management - Monthly payroll processing and payments.
    Only admin users can manage staff salaries and process payments.
    """
    queryset = StaffSalary.objects.select_related('staff_member', 'processed_by')
    serializer_class = StaffSalarySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = StaffSalaryFilter
    search_fields = ['staff_member__full_name', 'staff_member__email', 'payment_reference']
    ordering_fields = ['salary_month', 'basic_salary', 'net_salary', 'payment_status']
    ordering = ['-salary_month', 'staff_member__full_name']
    
    def perform_create(self, serializer):
        serializer.save(processed_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(processed_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark salary as paid"""
        salary = self.get_object()
        if salary.payment_status == 'paid':
            return Response(
                {'error': 'Salary is already marked as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_date = request.data.get('payment_date')
        payment_method = request.data.get('payment_method')
        payment_reference = request.data.get('payment_reference')
        
        if not payment_date:
            payment_date = timezone.now().date()
        
        salary.payment_status = 'paid'
        salary.payment_date = payment_date
        salary.payment_method = payment_method or salary.payment_method
        salary.payment_reference = payment_reference
        salary.save()
        
        serializer = self.get_serializer(salary)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_payment(self, request):
        """Get salaries pending payment"""
        pending_salaries = self.get_queryset().filter(payment_status='pending')
        serializer = self.get_serializer(pending_salaries, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def payroll_summary(self, request):
        """Get payroll summary for a given month"""
        salary_month = request.query_params.get('salary_month')
        
        if not salary_month:
            # Default to current month
            now = timezone.now()
            salary_month = now.replace(day=1).date()
        else:
            salary_month = datetime.strptime(salary_month, '%Y-%m-%d').date()
        
        queryset = self.get_queryset().filter(salary_month=salary_month)
        
        summary = queryset.aggregate(
            total_basic=Sum('basic_salary'),
            total_allowances=Sum('allowances'),
            total_overtime=Sum('overtime_amount'),
            total_deductions=Sum('deductions'),
            total_net=Sum('net_salary')
        )
        
        # Ensure no None values
        for key, value in summary.items():
            if value is None:
                summary[key] = 0
        
        serializer = PayrollSummarySerializer(summary)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def payment_status_breakdown(self, request):
        """Get breakdown of salaries by payment status"""
        salary_month = request.query_params.get('salary_month')
        
        queryset = self.get_queryset()
        if salary_month:
            salary_month = datetime.strptime(salary_month, '%Y-%m-%d').date()
            queryset = queryset.filter(salary_month=salary_month)
        
        breakdown = queryset.values('payment_status').annotate(
            count=Count('id'),
            total_amount=Sum('net_salary')
        ).order_by('payment_status')
        
        breakdown_data = [
            {
                'payment_status': item['payment_status'],
                'count': item['count'],
                'total_amount': item['total_amount'] or 0
            }
            for item in breakdown
        ]
        
        serializer = PaymentStatusBreakdownSerializer(breakdown_data, many=True)
        return Response(serializer.data)
