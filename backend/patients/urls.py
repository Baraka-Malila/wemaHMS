from django.urls import path
from . import views

app_name = 'patients'

urlpatterns = [
    # Core patient APIs
    path('search/', views.search_patients, name='search_patients'),
    path('queue/', views.get_patient_queue, name='get_patient_queue'),
    path('<str:patient_id>/', views.get_patient_details, name='get_patient_details'),
    path('<str:patient_id>/status/', views.update_patient_status, name='update_patient_status'),
    path('<str:patient_id>/delete/', views.delete_patient, name='delete_patient'),
]
