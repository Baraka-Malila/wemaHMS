from django.urls import path
from . import views

app_name = 'finance'

urlpatterns = [
    # ==================== ADMIN PRICING ====================
    # Service pricing management - Admin controls hospital service rates
    path('pricing/', views.ServicePricingViewSet.as_view({'get': 'list', 'post': 'create'}), name='pricing-list'),
    path('pricing/<int:pk>/', views.ServicePricingViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='pricing-detail'),
    path('pricing/active/', views.ServicePricingViewSet.as_view({'get': 'active_services'}), name='pricing-active'),
    path('pricing/by-category/', views.ServicePricingViewSet.as_view({'get': 'by_category'}), name='pricing-by-category'),
]
