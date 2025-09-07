from django.urls import path
from . import views

# ==================== FINANCE ENDPOINTS (MINIMAL & GROUPED) ====================
# Follow real workflow: Admin Pricing → Department Billing → Daily Closure

urlpatterns = [
    # ==================== ADMIN PRICING (ADMIN CONTROLLED) ====================
    path('pricing/', views.service_pricing, name='service_pricing'),
    path('pricing/<uuid:service_id>/', views.update_service_pricing, name='update_service_pricing'),
    
    # ==================== BILLING OPERATIONS ====================
    path('bills/', views.create_bill, name='create_bill'),
    path('bills/patient/<str:patient_id>/', views.patient_bills, name='patient_bills'),
    path('payment/', views.process_payment, name='process_payment'),
    
    # ==================== DAILY OPERATIONS ====================
    path('daily/close/', views.close_daily_balance, name='close_daily_balance'),
    path('daily/status/', views.daily_status, name='daily_status'),
]
