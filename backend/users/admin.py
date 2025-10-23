"""Admin configuration for users app."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model"""
    
    list_display = ['email', 'name', 'auth_provider', 'state', 'is_staff', 'is_active', 'created_at']
    list_filter = ['auth_provider', 'is_staff', 'is_active', 'state']
    search_fields = ['email', 'name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('name', 'auth_provider')}),
        (_('Preferences'), {'fields': ('state', 'class_level', 'target_degree', 'budget_min', 'budget_max')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'auth_provider'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']
