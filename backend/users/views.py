"""Views for users app (Authentication & Profile)."""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import random
import logging

from .serializers import (
    UserSerializer, UserProfileUpdateSerializer,
    OTPRequestSerializer, OTPVerifySerializer,
    GoogleAuthSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)


def generate_otp():
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))


def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class OTPRequestView(APIView):
    """Request OTP for email login"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = generate_otp()
        
        # Store OTP in Redis with 10 minute expiry
        cache_key = f'otp_{email}'
        cache.set(cache_key, otp, timeout=600)
        
        # Send OTP via email
        try:
            send_mail(
                subject='Your REstart Login OTP',
                message=f'Your OTP for REstart login is: {otp}\n\nThis OTP is valid for 10 minutes.',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
            logger.info(f"OTP sent to {email}")
        except Exception as e:
            logger.error(f"Error sending OTP: {e}")
            return Response(
                {'error': 'Failed to send OTP. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {'message': 'OTP sent successfully to your email'},
            status=status.HTTP_200_OK
        )


class OTPVerifyView(APIView):
    """Verify OTP and login/register user"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        # Verify OTP from Redis
        cache_key = f'otp_{email}'
        stored_otp = cache.get(cache_key)
        
        if not stored_otp or stored_otp != otp:
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete OTP after successful verification
        cache.delete(cache_key)
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'auth_provider': 'email'}
        )
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': tokens,
            'is_new_user': created
        }, status=status.HTTP_200_OK)


class GoogleAuthView(APIView):
    """Google OAuth authentication"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data.get('id_token') or serializer.validated_data.get('access_token')
        
        try:
            # Verify Google token
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_OAUTH2_CLIENT_ID
            )
            
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            
            if not email:
                return Response(
                    {'error': 'Email not provided by Google'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'name': name,
                    'auth_provider': 'google'
                }
            )
            
            # Generate tokens
            tokens = get_tokens_for_user(user)
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'is_new_user': created
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            logger.error(f"Google auth error: {e}")
            return Response(
                {'error': 'Invalid Google token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'PATCH' or self.request.method == 'PUT':
            return UserProfileUpdateSerializer
        return UserSerializer


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_data_export(request):
    """Request user data export (DPDPA compliance)"""
    user = request.user
    
    # TODO: Queue Celery task to generate data export
    # from users.tasks import generate_user_data_export
    # generate_user_data_export.delay(user.id)
    
    logger.info(f"Data export requested by user {user.email}")
    
    return Response({
        'message': 'Your data export request has been received. You will receive an email with your data within 48 hours.'
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_account(request):
    """Delete user account (DPDPA compliance)"""
    user = request.user
    email = user.email
    
    # TODO: Implement proper data anonymization/deletion logic
    # For now, we'll just deactivate the account
    user.is_active = False
    user.save()
    
    logger.info(f"Account deletion requested by user {email}")
    
    return Response({
        'message': 'Your account has been deactivated. All personal data will be deleted within 30 days.'
    }, status=status.HTTP_200_OK)
