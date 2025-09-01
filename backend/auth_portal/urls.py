from django.urls import path
from . import views

app_name = 'auth_portal'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    
    # Password management
    path('password-reset-request/', views.password_reset_request_view, name='password_reset_request'),
    path('password-reset-confirm/', views.password_reset_confirm_view, name='password_reset_confirm'),
    path('change-password/', views.change_password_view, name='change_password'),
    
    # User management
    path('profile/', views.profile_view, name='profile'),
    path('users/', views.users_list_view, name='users_list'),
]
