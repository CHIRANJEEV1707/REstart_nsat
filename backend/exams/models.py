from django.db import models
from django.utils.translation import gettext_lazy as _


class Exam(models.Model):
    """Exam model for entrance exams"""
    
    code = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique exam code (e.g., JEE, NEET)"
    )
    name = models.CharField(max_length=255)
    overview = models.TextField(blank=True)
    eligibility = models.TextField(blank=True)
    pattern = models.TextField(
        blank=True,
        help_text="Exam pattern details"
    )
    syllabus_summary = models.TextField(blank=True)
    application_url = models.URLField(max_length=500, blank=True)
    
    # JSONField for flexible data storage
    dates = models.JSONField(
        default=dict,
        blank=True,
        help_text="Important dates in JSON format"
    )
    cutoffs = models.JSONField(
        default=dict,
        blank=True,
        help_text="Previous year cutoffs in JSON format"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'exams'
        verbose_name = _('exam')
        verbose_name_plural = _('exams')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class ExamDate(models.Model):
    """Important dates for exams"""
    
    DATE_TYPE_CHOICES = [
        ('registration_start', 'Registration Start'),
        ('registration_end', 'Registration End'),
        ('exam_date', 'Exam Date'),
        ('result_date', 'Result Date'),
        ('counseling_start', 'Counseling Start'),
        ('counseling_end', 'Counseling End'),
    ]
    
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='exam_dates'
    )
    type = models.CharField(
        max_length=50,
        choices=DATE_TYPE_CHOICES
    )
    date = models.DateField()
    description = models.CharField(max_length=255, blank=True)
    
    class Meta:
        db_table = 'exam_dates'
        verbose_name = _('exam date')
        verbose_name_plural = _('exam dates')
        ordering = ['date']
    
    def __str__(self):
        return f"{self.exam.code} - {self.get_type_display()} - {self.date}"
