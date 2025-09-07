from django.urls import path
from . import views

app_name = 'reception'

urlpatterns = [
    # Patient registration and management
    path('register-patient/', views.register_patient, name='register_patient'),
    path('patients/<str:patient_id>/details/', views.update_patient_details, name='update_patient_details'),
    path('patients/<str:patient_id>/file-fee/', views.process_file_fee_payment, name='process_file_fee_payment'),
    path('patients/<str:patient_id>/check-in/', views.check_in_patient, name='check_in_patient'),
    
    # Reception dashboard
    path('dashboard/', views.reception_dashboard, name='reception_dashboard'),
]
