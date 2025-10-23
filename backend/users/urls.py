"""URL configuration for users app."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    OTPRequestView, OTPVerifyView, GoogleAuthView,
    UserProfileView, request_data_export, delete_account
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('auth/register-otp/', OTPRequestView.as_view(), name='register-otp'),
    path('auth/verify-otp/', OTPVerifyView.as_view(), name='verify-otp'),
    path('auth/google/', GoogleAuthView.as_view(), name='google-auth'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Profile
    path('me/', UserProfileView.as_view(), name='profile'),
    
    # DPDPA Compliance
    path('me/request-data-export/', request_data_export, name='request-data-export'),
    path('me/delete-account/', delete_account, name='delete-account'),
]
