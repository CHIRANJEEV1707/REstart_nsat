"""Admin configuration for interactions app."""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone

from .models import Shortlist, ReminderSubscription, Review


@admin.register(Shortlist)
class ShortlistAdmin(admin.ModelAdmin):
    """Admin for Shortlist model"""
    
    list_display = ['user', 'college', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'college__name']
    autocomplete_fields = ['user', 'college']
    ordering = ['-created_at']


@admin.register(ReminderSubscription)
class ReminderSubscriptionAdmin(admin.ModelAdmin):
    """Admin for ReminderSubscription model"""
    
    list_display = ['user', 'type', 'is_active', 'days_before', 'created_at']
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['user__email']
    autocomplete_fields = ['user']
    ordering = ['-created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin for Review model with moderation features"""
    
    list_display = [
        'college', 'user', 'rating', 'status_badge',
        'helpful_count', 'created_at'
    ]
    list_filter = ['status', 'rating', 'created_at']
    search_fields = ['user__email', 'college__name', 'title', 'body']
    autocomplete_fields = ['user', 'college', 'moderated_by']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('user', 'college', 'rating', 'title', 'body', 'tags')
        }),
        ('Moderation', {
            'fields': ('status', 'moderation_notes', 'moderated_by', 'moderated_at')
        }),
        ('Engagement', {
            'fields': ('helpful_count', 'not_helpful_count')
        }),
    )
    
    readonly_fields = ['moderated_at', 'created_at', 'updated_at']
    
    actions = ['approve_reviews', 'reject_reviews']
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'pending': 'orange',
            'approved': 'green',
            'rejected': 'red',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def approve_reviews(self, request, queryset):
        """Bulk action to approve reviews"""
        from .tasks import send_review_approval_notification
        from colleges.tasks import update_college_statistics
        
        updated = 0
        for review in queryset:
            review.status = 'approved'
            review.moderated_by = request.user
            review.moderated_at = timezone.now()
            review.save()
            
            # Queue notification
            send_review_approval_notification.delay(review.id)
            update_college_statistics.delay(review.college.id)
            updated += 1
        
        self.message_user(request, f'{updated} reviews approved successfully.')
    approve_reviews.short_description = 'Approve selected reviews'
    
    def reject_reviews(self, request, queryset):
        """Bulk action to reject reviews"""
        from .tasks import send_review_approval_notification
        
        updated = 0
        for review in queryset:
            review.status = 'rejected'
            review.moderated_by = request.user
            review.moderated_at = timezone.now()
            review.save()
            
            # Queue notification
            send_review_approval_notification.delay(review.id)
            updated += 1
        
        self.message_user(request, f'{updated} reviews rejected.')
    reject_reviews.short_description = 'Reject selected reviews'
    
    def get_queryset(self, request):
        """Show pending reviews first"""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'college', 'moderated_by')
