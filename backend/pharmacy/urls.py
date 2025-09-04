from django.urls import path
from . import views

app_name = 'pharmacy'

urlpatterns = [
    # ==================== PHARMACY OPERATIONS ====================
    # Prescription processing and dispensing
    path('prescription-queue/', views.prescription_queue, name='prescription-queue'),
    path('scan/', views.scan_medication, name='scan-medication'),
    path('prescriptions/<uuid:prescription_id>/complete/', views.complete_prescription, name='complete-prescription'),
    
    # ==================== INVENTORY MANAGEMENT ====================
    # Medication inventory and stock management
    path('medications/', views.medications_list, name='medications-list'),           # GET: List all, POST: Add new
    path('medications/<uuid:pk>/', views.medication_detail, name='medication-detail'), # GET: View, PATCH: Update
    path('medications/available/', views.available_medications, name='available-medications'), # For doctors
    path('stock/restock/', views.restock_medication, name='restock-medication'),     # Add stock to existing meds
    path('stock/low-stock/', views.low_stock_alert, name='low-stock-alert'),         # Check low stock items
]
