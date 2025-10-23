from django.db import models
from django.contrib.auth.models import AbstractUser

class Users(models.Model):
    id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    auth_provider = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    class_level = models.SmallIntegerField()
    target_degree = models.CharField(max_length=255)
    budget_min = models.IntegerField()
    budget_max = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

class Exams(models.Model):
    exams_id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    overview = models.TextField()
    eligibility = models.TextField()
    pattern = models.TextField()
    syllabus_summary = models.TextField()
    application_url = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'exams'

class ExamDates(models.Model):
    id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    exam = models.ForeignKey(Exams, on_delete=models.CASCADE, db_column='exam_id')
    type = models.CharField(max_length=100)
    date = models.DateField()

    class Meta:
        db_table = 'exam_dates'

class Colleges(models.Model):
    college_id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    name = models.CharField(max_length=255)
    description = models.TextField()
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    location_lat = models.DecimalField(max_digits=10, decimal_places=6)
    location_lng = models.DecimalField(max_digits=10, decimal_places=6)
    accreditation = models.TextField()
    type = models.CharField(max_length=100)
    fees_annual = models.IntegerField()
    fees_hostel = models.IntegerField()
    restart_score = models.SmallIntegerField()
    ratings_count = models.IntegerField()
    reviews_avg = models.DecimalField(max_digits=3, decimal_places=2)
    website_url = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'colleges'

class CollegeExams(models.Model):
    college = models.ForeignKey(Colleges, on_delete=models.CASCADE, db_column='college_id')
    exam = models.ForeignKey(Exams, on_delete=models.CASCADE, db_column='exam_id')

    class Meta:
        db_table = 'college_exams'
        unique_together = (('college', 'exam'),)  # Composite Primary Key

class CollegeDegrees(models.Model):
    id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    college = models.ForeignKey(Colleges, on_delete=models.CASCADE, db_column='college_id')
    degree = models.CharField(max_length=255)

    class Meta:
        db_table = 'college_degrees'

class Scholarships(models.Model):
    id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    college = models.ForeignKey(Colleges, on_delete=models.CASCADE, db_column='college_id')
    name = models.CharField(max_length=255)
    criteria = models.TextField()

    class Meta:
        db_table = 'scholarships'

class PrepPlans(models.Model):
    id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id')
    exam = models.ForeignKey(Exams, on_delete=models.CASCADE, db_column='exam_id')
    status = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'prep_plans'

class PrepWeeks(models.Model):
    id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    prep_plan = models.ForeignKey(PrepPlans, on_delete=models.CASCADE, db_column='prep_plan_id')
    week_number = models.IntegerField()
    tasks = models.JSONField()  # Added missing tasks field

    class Meta:
        db_table = 'prep_weeks'

class SavedColleges(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id')
    college = models.ForeignKey(Colleges, on_delete=models.CASCADE, db_column='college_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_colleges'
        unique_together = (('user', 'college'),)  # Composite Primary Key

class Reminders(models.Model):
    id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id')
    type = models.CharField(max_length=100)
    target_id = models.IntegerField()
    channels = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reminders'

class Reviews(models.Model):
    id = models.AutoField(primary_key=True)  # SERIAL in PostgreSQL
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id')
    college = models.ForeignKey(Colleges, on_delete=models.CASCADE, db_column='college_id')
    rating = models.SmallIntegerField()
    title = models.CharField(max_length=255)
    body = models.TextField()
    tags = models.JSONField()
    status = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'