from rest_framework import serializers
from .models import ServicePricing, ExpenseCategory, ExpenseRecord, StaffSalary, ServicePayment


class ServicePricingSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = ServicePricing
        fields = [
            'id', 'service_name', 'service_code', 'service_category',
            'description', 'standard_price', 'emergency_price',
            'department', 'duration_minutes', 'is_active',
            'requires_approval', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by_name']


class ExpenseCategorySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = ExpenseCategory
        fields = [
            'id', 'name', 'category_type', 'description',
            'monthly_budget', 'is_active', 'created_by',
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'created_by_name']


class ExpenseRecordSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.category_type', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    paid_by_name = serializers.CharField(source='paid_by.full_name', read_only=True)
    
    class Meta:
        model = ExpenseRecord
        fields = [
            'id', 'expense_number', 'category', 'category_name', 'category_type',
            'description', 'detailed_description', 'amount',
            'vendor_name', 'vendor_contact', 'payment_method',
            'payment_reference', 'expense_status', 'expense_date',
            'payment_date', 'requested_by', 'requested_by_name',
            'approved_by', 'approved_by_name', 'paid_by', 'paid_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'expense_number', 'requested_by', 'requested_by_name',
            'approved_by', 'approved_by_name', 'paid_by', 'paid_by_name',
            'category_name', 'category_type', 'created_at', 'updated_at'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
    
    def validate_expense_date(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Expense date cannot be in the future.")
        return value


class StaffSalarySerializer(serializers.ModelSerializer):
    staff_member_name = serializers.CharField(source='staff_member.full_name', read_only=True)
    staff_member_email = serializers.CharField(source='staff_member.email', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)
    
    class Meta:
        model = StaffSalary
        fields = [
            'id', 'staff_member', 'staff_member_name', 'staff_member_email',
            'salary_month', 'basic_salary', 'allowances', 'overtime_amount',
            'deductions', 'net_salary', 'payment_status', 'payment_date',
            'payment_method', 'payment_reference', 'notes',
            'processed_by', 'processed_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'net_salary', 'staff_member_name', 'staff_member_email',
            'processed_by_name', 'created_at', 'updated_at'
        ]
    
    def validate_basic_salary(self, value):
        if value <= 0:
            raise serializers.ValidationError("Basic salary must be greater than zero.")
        return value
    
    def validate_salary_month(self, value):
        # Ensure salary_month is the first day of the month
        if value.day != 1:
            raise serializers.ValidationError("Salary month must be the first day of the month (YYYY-MM-01).")
        return value


# Summary serializers for reports

class ExpenseSummarySerializer(serializers.Serializer):
    category_name = serializers.CharField()
    category_type = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense_count = serializers.IntegerField()


class PayrollSummarySerializer(serializers.Serializer):
    total_basic = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_allowances = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_overtime = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_deductions = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_net = serializers.DecimalField(max_digits=12, decimal_places=2)


class PaymentStatusBreakdownSerializer(serializers.Serializer):
    payment_status = serializers.CharField()
    count = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)


class ServicePaymentSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for service payments"""
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ServicePayment
        fields = [
            'id', 'patient_id', 'patient_name', 'service_type', 'service_type_display',
            'service_name', 'reference_id', 'amount', 'payment_method', 'status',
            'status_display', 'payment_date', 'processed_by', 'processed_by_name',
            'notes', 'receipt_number', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'receipt_number', 'processed_by', 'processed_by_name',
            'service_type_display', 'status_display', 'created_at', 'updated_at'
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        return value
