from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class College(models.Model):
    """College model with comprehensive information"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]
    
    TYPE_CHOICES = [
        ('government', 'Government'),
        ('private', 'Private'),
        ('deemed', 'Deemed University'),
        ('autonomous', 'Autonomous'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    
    # Location
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    location_lat = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True
    )
    location_lng = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True
    )
    
    # Accreditation and Type
    accreditation = models.JSONField(
        default=list,
        blank=True,
        help_text="List of accreditations (NAAC, NBA, etc.)"
    )
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES
    )
    
    # Fees
    fees_annual = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Annual tuition fees in INR"
    )
    fees_hostel = models.IntegerField(
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        help_text="Annual hostel fees in INR"
    )
    
    # Ratings and Scores
    restart_score = models.SmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0,
        help_text="REstart proprietary score (0-100)"
    )
    ratings_count = models.IntegerField(default=0)
    reviews_avg = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    
    # Additional Information
    website_url = models.URLField(max_length=500, blank=True)
    
    # Relationships
    exams_required = models.ManyToManyField(
        'exams.Exam',
        through='CollegeExam',
        related_name='colleges'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'colleges'
        verbose_name = _('college')
        verbose_name_plural = _('colleges')
        ordering = ['-restart_score', 'name']
        indexes = [
            models.Index(fields=['state', 'city']),
            models.Index(fields=['type']),
            models.Index(fields=['restart_score']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return self.name


class CollegeExam(models.Model):
    """Through model for College-Exam relationship"""
    
    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE
    )
    exam = models.ForeignKey(
        'exams.Exam',
        on_delete=models.CASCADE
    )
    cutoff_rank = models.IntegerField(
        null=True,
        blank=True,
        help_text="Previous year cutoff rank"
    )
    cutoff_percentile = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'college_exams'
        unique_together = [['college', 'exam']]
        verbose_name = _('college exam')
        verbose_name_plural = _('college exams')
    
    def __str__(self):
        return f"{self.college.name} - {self.exam.code}"


class Degree(models.Model):
    """Degree programs offered"""
    
    DEGREE_TYPE_CHOICES = [
        ('ug', 'Undergraduate'),
        ('pg', 'Postgraduate'),
        ('diploma', 'Diploma'),
        ('certificate', 'Certificate'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    degree_type = models.CharField(
        max_length=20,
        choices=DEGREE_TYPE_CHOICES
    )
    duration_years = models.SmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    
    class Meta:
        db_table = 'degrees'
        verbose_name = _('degree')
        verbose_name_plural = _('degrees')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_degree_type_display()})"


class CollegeDegree(models.Model):
    """Degrees offered by colleges"""
    
    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE,
        related_name='degrees'
    )
    degree = models.ForeignKey(
        Degree,
        on_delete=models.CASCADE
    )
    seats_available = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    class Meta:
        db_table = 'college_degrees'
        unique_together = [['college', 'degree']]
        verbose_name = _('college degree')
        verbose_name_plural = _('college degrees')
    
    def __str__(self):
        return f"{self.college.name} - {self.degree.name}"


class Scholarship(models.Model):
    """Scholarships offered by colleges"""
    
    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE,
        related_name='scholarships'
    )
    name = models.CharField(max_length=255)
    criteria = models.TextField(
        help_text="Eligibility criteria for the scholarship"
    )
    amount = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Scholarship amount in INR"
    )
    
    class Meta:
        db_table = 'scholarships'
        verbose_name = _('scholarship')
        verbose_name_plural = _('scholarships')
    
    def __str__(self):
        return f"{self.name} - {self.college.name}"


class ImportantDate(models.Model):
    """Important dates for colleges (admissions, etc.)"""
    
    DATE_TYPE_CHOICES = [
        ('admission_start', 'Admission Start'),
        ('admission_end', 'Admission End'),
        ('counseling', 'Counseling Date'),
        ('orientation', 'Orientation'),
        ('semester_start', 'Semester Start'),
    ]
    
    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE,
        related_name='important_dates'
    )
    type = models.CharField(
        max_length=50,
        choices=DATE_TYPE_CHOICES
    )
    date = models.DateField()
    description = models.CharField(max_length=255, blank=True)
    
    class Meta:
        db_table = 'important_dates'
        verbose_name = _('important date')
        verbose_name_plural = _('important dates')
        ordering = ['date']
    
    def __str__(self):
        return f"{self.college.name} - {self.get_type_display()} - {self.date}"
