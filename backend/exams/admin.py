"""Admin configuration for exams app."""
from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from .models import Exam, ExamDate


class ExamResource(resources.ModelResource):
    """Resource for import/export Exam data"""
    
    class Meta:
        model = Exam
        fields = (
            'id', 'code', 'name', 'overview', 'eligibility',
            'pattern', 'syllabus_summary', 'application_url'
        )
        export_order = fields


class ExamDateInline(admin.TabularInline):
    model = ExamDate
    extra = 1
    fields = ['type', 'date', 'description']


@admin.register(Exam)
class ExamAdmin(ImportExportModelAdmin):
    """Admin for Exam model with import/export"""
    
    resource_class = ExamResource
    
    list_display = ['code', 'name', 'application_url', 'created_at']
    search_fields = ['code', 'name']
    ordering = ['code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'overview')
        }),
        ('Eligibility & Pattern', {
            'fields': ('eligibility', 'pattern', 'syllabus_summary')
        }),
        ('Application', {
            'fields': ('application_url',)
        }),
        ('Additional Data', {
            'fields': ('dates', 'cutoffs'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ExamDateInline]


@admin.register(ExamDate)
class ExamDateAdmin(admin.ModelAdmin):
    """Admin for ExamDate model"""
    
    list_display = ['exam', 'type', 'date', 'description']
    list_filter = ['type', 'date']
    search_fields = ['exam__name', 'exam__code']
    autocomplete_fields = ['exam']
    ordering = ['date']
