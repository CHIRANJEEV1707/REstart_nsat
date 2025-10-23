from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with email as primary identifier"""
    
    AUTH_PROVIDER_CHOICES = [
        ('email', 'Email/OTP'),
        ('google', 'Google OAuth'),
    ]
    
    # Remove username field, use email instead
    username = None
    email = models.EmailField(_('email address'), unique=True)
    name = models.CharField(max_length=255, blank=True)
    
    # Authentication provider
    auth_provider = models.CharField(
        max_length=20,
        choices=AUTH_PROVIDER_CHOICES,
        default='email'
    )
    
    # User preferences and profile
    state = models.CharField(max_length=100, blank=True)
    class_level = models.SmallIntegerField(
        null=True,
        blank=True,
        help_text="Current class (e.g., 10, 11, 12)"
    )
    target_degree = models.CharField(max_length=255, blank=True)
    budget_min = models.IntegerField(
        null=True,
        blank=True,
        help_text="Minimum budget in INR"
    )
    budget_max = models.IntegerField(
        null=True,
        blank=True,
        help_text="Maximum budget in INR"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        verbose_name = _('user')
        verbose_name_plural = _('users')
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return self.name or self.email
    
    def get_short_name(self):
        return self.name or self.email.split('@')[0]
