from django.contrib import admin
from .models import (
    Users, Colleges, Exams, ExamDates, CollegeExams, CollegeDegrees,
    Scholarships, PrepPlans, PrepWeeks, SavedColleges, Reminders, Reviews
)

@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'auth_provider', 'state', 'class_level', 'created_at']
    list_filter = ['auth_provider', 'state', 'class_level', 'created_at']
    search_fields = ['name', 'email', 'state']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Colleges)
class CollegesAdmin(admin.ModelAdmin):
    list_display = ['college_id', 'name', 'state', 'city', 'type', 'fees_annual', 'restart_score']
    list_filter = ['state', 'type', 'restart_score']
    search_fields = ['name', 'city', 'state', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']

@admin.register(Exams)
class ExamsAdmin(admin.ModelAdmin):
    list_display = ['exams_id', 'code', 'name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['code', 'name', 'overview']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ExamDates)
class ExamDatesAdmin(admin.ModelAdmin):
    list_display = ['id', 'exam', 'type', 'date']
    list_filter = ['type', 'date']
    search_fields = ['exam__name', 'type']

@admin.register(CollegeExams)
class CollegeExamsAdmin(admin.ModelAdmin):
    list_display = ['college', 'exam']
    list_filter = ['exam']
    search_fields = ['college__name', 'exam__name']

@admin.register(CollegeDegrees)
class CollegeDegreesAdmin(admin.ModelAdmin):
    list_display = ['id', 'college', 'degree']
    list_filter = ['degree']
    search_fields = ['college__name', 'degree']

@admin.register(Scholarships)
class ScholarshipsAdmin(admin.ModelAdmin):
    list_display = ['id', 'college', 'name']
    search_fields = ['college__name', 'name', 'criteria']

@admin.register(PrepPlans)
class PrepPlansAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'exam', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__name', 'exam__name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(PrepWeeks)
class PrepWeeksAdmin(admin.ModelAdmin):
    list_display = ['id', 'prep_plan', 'week_number']
    list_filter = ['week_number']
    search_fields = ['prep_plan__user__name']

@admin.register(SavedColleges)
class SavedCollegesAdmin(admin.ModelAdmin):
    list_display = ['user', 'college', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__name', 'college__name']
    readonly_fields = ['created_at']

@admin.register(Reminders)
class RemindersAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'type', 'target_id', 'channels', 'created_at']
    list_filter = ['type', 'channels', 'created_at']
    search_fields = ['user__name', 'type']
    readonly_fields = ['created_at']

@admin.register(Reviews)
class ReviewsAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'college', 'rating', 'status', 'created_at']
    list_filter = ['rating', 'status', 'created_at']
    search_fields = ['user__name', 'college__name', 'title']
    readonly_fields = ['created_at']
    actions = ['approve_reviews', 'reject_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f'{queryset.count()} reviews approved.')
    approve_reviews.short_description = 'Approve selected reviews'
    
    def reject_reviews(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f'{queryset.count()} reviews rejected.')
    reject_reviews.short_description = 'Reject selected reviews'
