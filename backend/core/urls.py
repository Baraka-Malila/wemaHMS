"""
URL configuration for WEMA-HMS core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="WEMA-HMS API",
        default_version='v1',
        description="Hospital Management System API Documentation",
        contact=openapi.Contact(email="admin@wema-hms.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/auth/', include('auth_portal.urls')),
    path('api/admin/', include('admin_portal.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/doctor/', include('doctor.urls')),
    path('api/lab/', include('lab.urls')),
    path('api/pharmacy/', include('pharmacy.urls')),
    path('api/reception/', include('reception.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
