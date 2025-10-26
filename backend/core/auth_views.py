import random
import string
import json
import requests as http_requests
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests
from google.oauth2 import id_token
from .models import Users
from .serializers import UserSerializer, OTPLoginSerializer, OTPVerifySerializer, GoogleAuthSerializer, RegisterSerializer, LoginSerializer
from django.contrib.auth import authenticate

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(email, otp):
    """Send OTP via email"""
    subject = 'Your REstart Login OTP'
    message = f'''
    Your OTP for REstart login is: {otp}
    
    This OTP will expire in 10 minutes.
    
    If you didn't request this, please ignore this email.
    '''
    
    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def login_otp(request):
    """Initiate OTP login process"""
    serializer = OTPLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP in cache with 10-minute expiry
        cache_key = f"otp_{email}"
        cache.set(cache_key, otp, 600)  # 10 minutes
        
        # Send OTP via email
        if send_otp_email(email, otp):
            return Response({
                'message': 'OTP sent successfully to your email',
                'email': email
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send OTP. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and return JWT tokens"""
    serializer = OTPVerifySerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        # Check OTP from cache
        cache_key = f"otp_{email}"
        stored_otp = cache.get(cache_key)
        
        if not stored_otp:
            return Response({
                'error': 'OTP expired or invalid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if stored_otp != otp:
            return Response({
                'error': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Clear OTP from cache
        cache.delete(cache_key)
        
        # Get or create user
        user, created = Users.objects.get_or_create(
            email=email,
            defaults={
                'name': email.split('@')[0],  # Default name from email
                'auth_provider': 'email',
                'state': '',
                'class_level': 12,
                'target_degree': '',
                'budget_min': 0,
                'budget_max': 1000000,
            }
        )
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': tokens
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """Handle Google OAuth authentication"""
    serializer = GoogleAuthSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        
        try:
            # Verify Google token
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_OAUTH2_CLIENT_ID
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            # Extract user info
            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])
            
            # Get or create user
            user, created = Users.objects.get_or_create(
                email=email,
                defaults={
                    'name': name,
                    'auth_provider': 'google',
                    'state': '',
                    'class_level': 12,
                    'target_degree': '',
                    'budget_min': 0,
                    'budget_max': 1000000,
                }
            )
            
            # Update auth provider if user exists but was created via email
            if not created and user.auth_provider == 'email':
                user.auth_provider = 'google'
                user.save()
            
            # Generate tokens
            tokens = get_tokens_for_user(user)
            
            return Response({
                'message': 'Google authentication successful',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'error': 'Invalid Google token'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Authentication failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_current_user(request):
    """Get current authenticated user details"""
    if request.user.is_authenticated:
        try:
            user = Users.objects.get(email=request.user.email)
            return Response({
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        except Users.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'error': 'Not authenticated'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_google_auth_url(request):
    """Get Google OAuth URL for NextAuth"""
    redirect_uri = request.GET.get('redirect_uri', 'http://localhost:3000/api/auth/callback/google')
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={settings.GOOGLE_OAUTH2_CLIENT_ID}&redirect_uri={redirect_uri}&response_type=code&scope=openid email profile"
    
    return Response({
        'authorization_url': auth_url
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_github_auth_url(request):
    """Get GitHub OAuth URL for NextAuth"""
    redirect_uri = request.GET.get('redirect_uri', 'http://localhost:3000/api/auth/callback/github')
    
    auth_url = f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&redirect_uri={redirect_uri}&scope=read:user user:email"
    
    return Response({
        'authorization_url': auth_url
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def oauth_callback(request):
    """Handle OAuth callback from NextAuth"""
    provider = request.data.get('provider')
    code = request.data.get('code')
    id_token_value = request.data.get('id_token')
    access_token = request.data.get('access_token')
    profile = request.data.get('profile', {})
    
    if not provider:
        return Response({'error': 'Provider is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if provider == 'google':
            # Handle Google OAuth
            if id_token_value:
                # Verify the token
                idinfo = id_token.verify_oauth2_token(
                    id_token_value,
                    requests.Request(),
                    settings.GOOGLE_OAUTH2_CLIENT_ID
                )
                
                if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise ValueError('Wrong issuer.')
                
                email = idinfo['email']
                name = idinfo.get('name', email.split('@')[0])
            elif profile:
                # Use profile data from NextAuth
                email = profile.get('email')
                name = profile.get('name', email.split('@')[0] if email else 'User')
            else:
                return Response({'error': 'Invalid Google authentication data'}, status=status.HTTP_400_BAD_REQUEST)
        
        elif provider == 'github':
            # Handle GitHub OAuth
            if access_token:
                # Get user data from GitHub API
                headers = {'Authorization': f'token {access_token}'}
                user_response = http_requests.get('https://api.github.com/user', headers=headers)
                user_data = user_response.json()
                
                # GitHub doesn't always return email, so we need to fetch emails separately
                email_response = http_requests.get('https://api.github.com/user/emails', headers=headers)
                emails = email_response.json()
                
                # Get primary email
                primary_email = next((email['email'] for email in emails if email['primary']), None)
                email = primary_email or user_data.get('email')
                name = user_data.get('name') or user_data.get('login')
            elif profile:
                # Use profile data from NextAuth
                email = profile.get('email')
                name = profile.get('name', profile.get('login', 'User'))
            else:
                return Response({'error': 'Invalid GitHub authentication data'}, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response({'error': f'Unsupported provider: {provider}'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user
        user, created = Users.objects.get_or_create(
            email=email,
            defaults={
                'name': name,
                'auth_provider': provider,
                'state': '',
                'class_level': 12,
                'target_degree': '',
                'budget_min': 0,
                'budget_max': 1000000,
            }
        )
        
        # Update auth provider if user exists but was created via a different method
        if not created and user.auth_provider != provider:
            user.auth_provider = provider
            user.save()
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': tokens['access'],
            'refresh': tokens['refresh'],
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Check if user already exists
            email = serializer.validated_data['email']
            if Users.objects.filter(email=email).exists():
                return Response({
                    'error': 'User with this email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = Users.objects.create(
                email=serializer.validated_data['email'],
                name=serializer.validated_data['name'],
                auth_provider='email',
                state='',
                class_level=12,
                target_degree='',
                budget_min=0,
                budget_max=1000000,
            )
            
            # Set password if provided
            if 'password' in serializer.validated_data:
                user.set_password(serializer.validated_data['password'])
                user.save()
            
            # Generate tokens
            tokens = get_tokens_for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
