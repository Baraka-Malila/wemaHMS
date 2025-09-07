from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# ==================== FINANCE ENDPOINTS (GROUPED & CLEAN) ====================
# Real workflow: Admin Pricing → Expense Tracking → Payroll Management

# Create router for ViewSets
router = DefaultRouter()

# === ADMIN & PRICING SECTION ===
router.register(r'admin/service-pricing', views.ServicePricingViewSet, basename='service-pricing')

# === EXPENSES SECTION ===
router.register(r'expenses/categories', views.ExpenseCategoryViewSet, basename='expense-categories')
router.register(r'expenses/records', views.ExpenseRecordViewSet, basename='expense-records')

# === PAYROLL SECTION ===
router.register(r'payroll/staff-salaries', views.StaffSalaryViewSet, basename='staff-salaries')

urlpatterns = [
    # Include all grouped ViewSet routes
    path('api/', include(router.urls)),
]
