from django.urls import path
from . import views

app_name = 'expenses'

urlpatterns = [
    # ==================== EXPENSE CATEGORIES ====================
    # Expense category management
    path('categories/', views.ExpenseCategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='categories-list'),
    path('categories/<int:pk>/', views.ExpenseCategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='categories-detail'),
    path('categories/active/', views.ExpenseCategoryViewSet.as_view({'get': 'active_categories'}), name='categories-active'),
    path('categories/by-type/', views.ExpenseCategoryViewSet.as_view({'get': 'by_type'}), name='categories-by-type'),
    
    # ==================== EXPENSE RECORDS ====================
    # Expense tracking with approval workflow
    path('records/', views.ExpenseRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='records-list'),
    path('records/<int:pk>/', views.ExpenseRecordViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='records-detail'),
    path('records/<int:pk>/approve/', views.ExpenseRecordViewSet.as_view({'post': 'approve'}), name='records-approve'),
    path('records/<int:pk>/mark-paid/', views.ExpenseRecordViewSet.as_view({'post': 'mark_paid'}), name='records-mark-paid'),
    path('records/pending/', views.ExpenseRecordViewSet.as_view({'get': 'pending_approval'}), name='records-pending'),
    path('records/unpaid/', views.ExpenseRecordViewSet.as_view({'get': 'approved_unpaid'}), name='records-unpaid'),
    path('records/summary/', views.ExpenseRecordViewSet.as_view({'get': 'summary'}), name='records-summary'),
]
