from django.urls import path
from . import views

app_name = 'doctor'

urlpatterns = [
    # Patient management
    path('waiting-patients/', views.get_waiting_patients, name='get_waiting_patients'),
    path('start-consultation/', views.start_consultation, name='start_consultation'),

    # Consultation management
    path('consultations/', views.get_consultations, name='get_consultations'),
    path('consultations/create/', views.create_consultation, name='create_consultation'),
    path('consultations/<str:consultation_id>/', views.get_consultation_detail, name='get_consultation_detail'),
    path('consultations/<str:consultation_id>/update/', views.update_consultation, name='update_consultation'),
    path('consultations/complete/', views.complete_consultation, name='complete_consultation'),

    # Prescriptions
    path('prescriptions/', views.create_prescription, name='create_prescription'),
    path('prescriptions/list/', views.get_prescriptions, name='get_prescriptions'),

    # Lab requests
    path('lab-requests/', views.request_lab_test, name='request_lab_test'),
    path('lab-requests/list/', views.get_lab_requests, name='get_lab_requests'),

    # Dashboard
    path('dashboard/', views.doctor_dashboard, name='doctor_dashboard'),
]