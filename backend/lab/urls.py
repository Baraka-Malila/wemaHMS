from django.urls import path
from . import views

app_name = 'lab'

urlpatterns = [
    # Essential Lab Operations Only
    path('patients/', views.lab_patients_queue, name='patients-queue'),           # See patients waiting for lab
    path('results/', views.lab_results_list, name='results-list'),               # View/create test results  
    path('results/<uuid:pk>/', views.lab_result_detail, name='result-detail'),   # Update specific result
    path('orders/', views.lab_orders_list, name='orders-list'),                  # View/create supply orders
    path('orders/<uuid:pk>/submit/', views.submit_lab_order, name='submit-order'), # Send order to pharmacy
]
