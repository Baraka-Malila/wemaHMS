from django.urls import path
from . import views

app_name = 'payroll'

urlpatterns = [
    # ==================== PAYROLL MANAGEMENT ====================
    # Staff salary processing and payments
    path('salaries/', views.StaffSalaryViewSet.as_view({'get': 'list', 'post': 'create'}), name='salaries-list'),
    path('salaries/<int:pk>/', views.StaffSalaryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='salaries-detail'),
    path('salaries/<int:pk>/mark-paid/', views.StaffSalaryViewSet.as_view({'post': 'mark_paid'}), name='salaries-mark-paid'),
    path('salaries/pending/', views.StaffSalaryViewSet.as_view({'get': 'pending_payment'}), name='salaries-pending'),
    path('salaries/summary/', views.StaffSalaryViewSet.as_view({'get': 'payroll_summary'}), name='salaries-summary'),
    path('salaries/breakdown/', views.StaffSalaryViewSet.as_view({'get': 'payment_status_breakdown'}), name='salaries-breakdown'),
]
