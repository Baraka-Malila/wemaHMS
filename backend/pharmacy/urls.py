from django.urls import path
from . import views

app_name = 'pharmacy'

urlpatterns = [
    # Shared endpoint (doctors + pharmacy staff)
    path('available-medications/', views.available_medications, name='available-medications'),
    
    # Pharmacy staff operations
    path('prescription-queue/', views.prescription_queue, name='prescription-queue'),
    path('scan/', views.scan_medication, name='scan-medication'),
    path('prescriptions/<uuid:prescription_id>/complete/', views.complete_prescription, name='complete-prescription'),
    
    # Medication management (pharmacy staff only)
    path('medications/', views.medications_crud, name='medications-list'),
    path('medications/<uuid:medication_id>/', views.medications_crud, name='medication-detail'),
    path('restock/', views.restock_medication, name='restock-medication'),
    path('low-stock/', views.low_stock_alert, name='low-stock-alert'),
]
