from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class Shortlist(models.Model):
    """User's saved/shortlisted colleges"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shortlisted_colleges'
    )
    college = models.ForeignKey(
        'colleges.College',
        on_delete=models.CASCADE,
        related_name='shortlisted_by'
    )
    notes = models.TextField(
        blank=True,
        help_text="Personal notes about this college"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'shortlists'
        verbose_name = _('shortlist')
        verbose_name_plural = _('shortlists')
        unique_together = [['user', 'college']]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.college.name}"


class ReminderSubscription(models.Model):
    """User subscriptions for reminders about exams, colleges, or dates"""
    
    TYPE_CHOICES = [
        ('exam', 'Exam Reminder'),
        ('college_date', 'College Important Date'),
        ('exam_date', 'Exam Date'),
    ]
    
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reminder_subscriptions'
    )
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )
    
    # Generic relation to support multiple target types
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        help_text="Type of object (Exam, College, ImportantDate, etc.)"
    )
    object_id = models.PositiveIntegerField(
        help_text="ID of the target object"
    )
    target = GenericForeignKey('content_type', 'object_id')
    
    # Notification channels (stored as JSON array)
    channels = models.JSONField(
        default=list,
        help_text="List of notification channels (email, sms, push)"
    )
    
    # Reminder settings
    days_before = models.PositiveSmallIntegerField(
        default=7,
        help_text="Send reminder X days before the date"
    )
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reminder_subscriptions'
        verbose_name = _('reminder subscription')
        verbose_name_plural = _('reminder subscriptions')
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_type_display()}"


class Review(models.Model):
    """College reviews submitted by users"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    college = models.ForeignKey(
        'colleges.College',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    
    # Review content
    rating = models.SmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    title = models.CharField(max_length=255)
    body = models.TextField(
        help_text="Detailed review text"
    )
    
    # Tags for categorization (stored as JSON array)
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text="Review tags (e.g., 'infrastructure', 'faculty', 'placements')"
    )
    
    # Moderation
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    moderation_notes = models.TextField(
        blank=True,
        help_text="Admin notes for moderation"
    )
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_reviews'
    )
    moderated_at = models.DateTimeField(null=True, blank=True)
    
    # Helpfulness tracking
    helpful_count = models.IntegerField(default=0)
    not_helpful_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        verbose_name = _('review')
        verbose_name_plural = _('reviews')
        unique_together = [['user', 'college']]
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['college', 'status']),
            models.Index(fields=['-created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.college.name} ({self.rating}★)"
