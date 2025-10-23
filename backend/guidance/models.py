from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class PrepPlan(models.Model):
    """Preparation plan for exams"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('abandoned', 'Abandoned'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prep_plans'
    )
    exam = models.ForeignKey(
        'exams.Exam',
        on_delete=models.CASCADE,
        related_name='prep_plans'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    target_date = models.DateField(
        null=True,
        blank=True,
        help_text="Target exam date"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'prep_plans'
        verbose_name = _('preparation plan')
        verbose_name_plural = _('preparation plans')
        unique_together = [['user', 'exam']]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.exam.code} Plan"


class PrepWeek(models.Model):
    """Weekly breakdown of preparation plan"""
    
    prep_plan = models.ForeignKey(
        PrepPlan,
        on_delete=models.CASCADE,
        related_name='weeks'
    )
    week_number = models.PositiveSmallIntegerField(
        help_text="Week number in the plan (1-indexed)"
    )
    title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Week title/theme"
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'prep_weeks'
        verbose_name = _('preparation week')
        verbose_name_plural = _('preparation weeks')
        unique_together = [['prep_plan', 'week_number']]
        ordering = ['prep_plan', 'week_number']
    
    def __str__(self):
        return f"{self.prep_plan} - Week {self.week_number}"


class PrepTask(models.Model):
    """Individual tasks within a prep week"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]
    
    prep_week = models.ForeignKey(
        PrepWeek,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order within the week"
    )
    
    # Optional metadata
    estimated_hours = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Estimated time to complete (hours)"
    )
    resources = models.JSONField(
        default=list,
        blank=True,
        help_text="List of resource URLs or references"
    )
    
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'prep_tasks'
        verbose_name = _('preparation task')
        verbose_name_plural = _('preparation tasks')
        ordering = ['prep_week', 'order', 'id']
    
    def __str__(self):
        return f"{self.prep_week} - {self.title}"
