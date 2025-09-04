from django.urls import path
from . import views

app_name = 'lab'

urlpatterns = [
    # Lab Test Results Management
    path('test-results/', views.LabTestResultListView.as_view(), name='test-results-list'),
    path('test-results/<uuid:pk>/', views.LabTestResultDetailView.as_view(), name='test-result-detail'),
    path('test-results/by-request/<str:request_id>/', views.lab_test_results_by_request, name='test-results-by-request'),
    path('test-results/<uuid:result_id>/mark-urgent/', views.mark_result_urgent, name='mark-result-urgent'),
    path('test-results/<uuid:result_id>/notify-doctor/', views.notify_doctor_result, name='notify-doctor-result'),
    
    # Lab Orders Management  
    path('orders/', views.LabOrderListView.as_view(), name='orders-list'),
    path('orders/<uuid:pk>/', views.LabOrderDetailView.as_view(), name='order-detail'),
    path('orders/<uuid:order_id>/submit/', views.submit_lab_order, name='submit-order'),
    
    # Dashboard and Analytics
    path('dashboard/stats/', views.lab_dashboard_stats, name='dashboard-stats'),
    path('dashboard/workload/', views.lab_workload_analysis, name='workload-analysis'),
    path('test-queue/', views.lab_test_queue, name='test-queue'),
]
