"""Admin configuration for guidance app."""
from django.contrib import admin
from .models import PrepPlan, PrepWeek, PrepTask


class PrepTaskInline(admin.TabularInline):
    model = PrepTask
    extra = 0
    fields = ['title', 'description', 'status', 'order', 'estimated_hours']
    ordering = ['order']


class PrepWeekInline(admin.StackedInline):
    model = PrepWeek
    extra = 0
    fields = ['week_number', 'title', 'start_date', 'end_date']
    ordering = ['week_number']


@admin.register(PrepPlan)
class PrepPlanAdmin(admin.ModelAdmin):
    """Admin for PrepPlan model"""
    
    list_display = ['user', 'exam', 'status', 'target_date', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'exam__name', 'exam__code']
    autocomplete_fields = ['user', 'exam']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Plan Information', {
            'fields': ('user', 'exam', 'status', 'target_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PrepWeekInline]


@admin.register(PrepWeek)
class PrepWeekAdmin(admin.ModelAdmin):
    """Admin for PrepWeek model"""
    
    list_display = ['prep_plan', 'week_number', 'title', 'start_date', 'end_date']
    list_filter = ['prep_plan__exam']
    search_fields = ['prep_plan__user__email', 'title']
    autocomplete_fields = ['prep_plan']
    ordering = ['prep_plan', 'week_number']
    
    inlines = [PrepTaskInline]


@admin.register(PrepTask)
class PrepTaskAdmin(admin.ModelAdmin):
    """Admin for PrepTask model"""
    
    list_display = ['prep_week', 'title', 'status', 'order', 'estimated_hours', 'completed_at']
    list_filter = ['status', 'completed_at']
    search_fields = ['title', 'description', 'prep_week__prep_plan__user__email']
    autocomplete_fields = ['prep_week']
    ordering = ['prep_week', 'order']
