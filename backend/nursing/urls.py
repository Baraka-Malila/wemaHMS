from django.urls import path
from . import views

app_name = 'nursing'

urlpatterns = [
    # Nursing Services
    path('services/', views.nursing_services, name='nursing-services'),
    path('services/<uuid:service_id>/', views.update_nursing_service, name='update-nursing-service'),
    
    # Ward Management
    path('wards/', views.ward_assignments, name='ward-assignments'),
    path('wards/<uuid:assignment_id>/discharge/', views.discharge_patient, name='discharge-patient'),
]
