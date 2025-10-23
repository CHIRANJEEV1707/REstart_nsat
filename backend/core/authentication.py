from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import Users

class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that works with our Users model
    """
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token['user_id']
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')

        try:
            # Get user from our custom Users model using the user_id from JWT
            # Since JWT uses Django's built-in User model ID, we need to map it
            # For now, we'll use email as the identifier
            user_email = validated_token.get('email')
            if user_email:
                user = Users.objects.get(email=user_email)
                return user
            else:
                # Fallback: try to get by ID if email not in token
                user = Users.objects.get(id=user_id)
                return user
        except Users.DoesNotExist:
            return None

class CustomUserBackend(BaseBackend):
    """
    Custom authentication backend for our Users model
    """
    
    def authenticate(self, request, email=None, **kwargs):
        """
        Authenticate user by email
        """
        if email is None:
            return None
        
        try:
            user = Users.objects.get(email=email)
            return user
        except Users.DoesNotExist:
            return None
    
    def get_user(self, user_id):
        """
        Get user by ID
        """
        try:
            return Users.objects.get(pk=user_id)
        except Users.DoesNotExist:
            return None

class CustomUser:
    """
    Custom user class that mimics Django's User model for JWT compatibility
    """
    
    def __init__(self, users_instance):
        self.users_instance = users_instance
        self.id = users_instance.id
        self.email = users_instance.email
        self.username = users_instance.email  # Use email as username
        self.is_active = True
        self.is_authenticated = True
        self.is_anonymous = False
    
    def __str__(self):
        return self.email
    
    @property
    def pk(self):
        return self.id
    
    def get_username(self):
        return self.email
