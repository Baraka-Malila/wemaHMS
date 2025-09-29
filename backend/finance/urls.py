from django.urls import path
from . import views

app_name = 'finance'

urlpatterns = [
    # ==================== ADMIN PRICING ====================
    # Service pricing management - Admin controls hospital service rates
    path('pricing/', views.ServicePricingViewSet.as_view({'get': 'list', 'post': 'create'}), name='pricing-list'),
    path('pricing/<int:pk>/', views.ServicePricingViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='pricing-detail'),
    path('pricing/active/', views.ServicePricingViewSet.as_view({'get': 'active_services'}), name='pricing-active'),
    path('pricing/by-category/', views.ServicePricingViewSet.as_view({'get': 'by_category'}), name='pricing-by-category'),

    # ==================== SERVICE PAYMENTS ====================
    # Payment processing for consultations, lab tests, and other services
    # Specific action URLs first (before generic patterns)
    path('payments/pending/', views.ServicePaymentViewSet.as_view({'get': 'pending_payments'}), name='payments-pending'),
    path('payments/by-service-type/', views.ServicePaymentViewSet.as_view({'get': 'by_service_type'}), name='payments-by-service-type'),
    path('payments/consultation/', views.ServicePaymentViewSet.as_view({'post': 'process_consultation_payment'}), name='payments-consultation'),
    path('payments/lab-test/', views.ServicePaymentViewSet.as_view({'post': 'process_lab_payment'}), name='payments-lab-test'),
    # Generic CRUD patterns last
    path('payments/', views.ServicePaymentViewSet.as_view({'get': 'list', 'post': 'create'}), name='payments-list'),
    path('payments/<str:pk>/', views.ServicePaymentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='payments-detail'),
    path('payments/<str:pk>/mark-paid/', views.ServicePaymentViewSet.as_view({'post': 'mark_paid'}), name='payments-mark-paid'),

    # ==================== EXPENSE MANAGEMENT ====================
    # Expense categories and records (commented out from original - can be added later)
    # path('expenses/categories/', views.ExpenseCategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='expense-categories'),
    # path('expenses/records/', views.ExpenseRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='expense-records'),

    # ==================== PAYROLL MANAGEMENT ====================
    # Staff salary management (commented out from original - can be added later)
    # path('payroll/', views.StaffSalaryViewSet.as_view({'get': 'list', 'post': 'create'}), name='payroll-list'),
]
