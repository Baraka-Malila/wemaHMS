from django.urls import path
from . import views

app_name = 'doctor'

urlpatterns = [
    # Patient management
    path('waiting-patients/', views.get_waiting_patients, name='get_waiting_patients'),
    path('start-consultation/', views.start_consultation, name='start_consultation'),
    
    # Consultation management
    path('consultations/<str:consultation_id>/', views.update_consultation, name='update_consultation'),
    
    # Prescriptions and lab requests
    path('prescriptions/', views.create_prescription, name='create_prescription'),
    path('lab-requests/', views.request_lab_test, name='request_lab_test'),
    
    # Dashboard
    path('dashboard/', views.doctor_dashboard, name='doctor_dashboard'),
]