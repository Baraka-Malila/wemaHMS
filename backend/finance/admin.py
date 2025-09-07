from django.contrib import admin
from .models import ServicePricing, ExpenseCategory, ExpenseRecord, StaffSalary

# Only register the new expense models to avoid conflicts during migration
# The existing PatientBill, BillLineItem, DailyBalance will be re-registered after migration

@admin.register(ServicePricing)
class ServicePricingAdmin(admin.ModelAdmin):
    list_display = [
        'service_name',
        'service_code', 
        'service_category',
        'department',
        'standard_price',
        'is_active'
    ]
    list_filter = ['service_category', 'department', 'is_active']
    search_fields = ['service_name', 'service_code']
    ordering = ['service_category', 'service_name']


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'category_type', 
        'monthly_budget',
        'is_active'
    ]
    list_filter = ['category_type', 'is_active']
    search_fields = ['name']
    ordering = ['category_type', 'name']


@admin.register(ExpenseRecord)
class ExpenseRecordAdmin(admin.ModelAdmin):
    list_display = [
        'expense_number',
        'description',
        'category',
        'amount',
        'expense_status',
        'expense_date'
    ]
    list_filter = ['expense_status', 'expense_date']
    search_fields = ['expense_number', 'description', 'vendor_name']
    ordering = ['-expense_date']
    readonly_fields = ['expense_number']


@admin.register(StaffSalary)
class StaffSalaryAdmin(admin.ModelAdmin):
    list_display = [
        'staff_member',
        'salary_month',
        'basic_salary',
        'net_salary',
        'payment_status'
    ]
    list_filter = ['payment_status', 'salary_month']
    ordering = ['-salary_month']
    readonly_fields = ['net_salary']
