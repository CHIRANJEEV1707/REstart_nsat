"""Admin configuration for colleges app."""
from django.contrib import admin
from django.utils.html import format_html
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from reversion.admin import VersionAdmin

from .models import College, CollegeExam, Degree, CollegeDegree, Scholarship, ImportantDate


class CollegeResource(resources.ModelResource):
    """Resource for import/export College data"""
    
    class Meta:
        model = College
        fields = (
            'id', 'name', 'description', 'status', 'state', 'city',
            'location_lat', 'location_lng', 'type', 'fees_annual',
            'fees_hostel', 'restart_score', 'website_url'
        )
        export_order = fields


class ScholarshipInline(admin.TabularInline):
    model = Scholarship
    extra = 1
    fields = ['name', 'criteria', 'amount']


class CollegeDegreeInline(admin.TabularInline):
    model = CollegeDegree
    extra = 1
    autocomplete_fields = ['degree']


class ImportantDateInline(admin.TabularInline):
    model = ImportantDate
    extra = 1
    fields = ['type', 'date', 'description']


class CollegeExamInline(admin.TabularInline):
    model = CollegeExam
    extra = 1
    autocomplete_fields = ['exam']
    fields = ['exam', 'cutoff_rank', 'cutoff_percentile']


@admin.register(College)
class CollegeAdmin(ImportExportModelAdmin, VersionAdmin):
    """Admin for College model with import/export and version control"""
    
    resource_class = CollegeResource
    
    list_display = [
        'name', 'state', 'city', 'type', 'status_badge',
        'fees_annual', 'restart_score', 'reviews_avg', 'created_at'
    ]
    list_filter = ['status', 'type', 'state', 'created_at']
    search_fields = ['name', 'city', 'state']
    ordering = ['-restart_score', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'status')
        }),
        ('Location', {
            'fields': ('state', 'city', 'location_lat', 'location_lng')
        }),
        ('Type & Accreditation', {
            'fields': ('type', 'accreditation')
        }),
        ('Fees', {
            'fields': ('fees_annual', 'fees_hostel')
        }),
        ('Ratings & Scores', {
            'fields': ('restart_score', 'ratings_count', 'reviews_avg')
        }),
        ('Additional Info', {
            'fields': ('website_url',)
        }),
    )
    
    readonly_fields = ['ratings_count', 'reviews_avg', 'created_at', 'updated_at']
    
    inlines = [CollegeExamInline, CollegeDegreeInline, ScholarshipInline, ImportantDateInline]
    
    actions = ['publish_colleges', 'draft_colleges']
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'published': 'green',
            'draft': 'orange',
        }
        return format_html(
            '<span style="color: {};">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def publish_colleges(self, request, queryset):
        """Bulk action to publish colleges"""
        updated = queryset.update(status='published')
        self.message_user(request, f'{updated} colleges published successfully.')
    publish_colleges.short_description = 'Publish selected colleges'
    
    def draft_colleges(self, request, queryset):
        """Bulk action to draft colleges"""
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} colleges moved to draft.')
    draft_colleges.short_description = 'Move selected colleges to draft'


@admin.register(Degree)
class DegreeAdmin(admin.ModelAdmin):
    """Admin for Degree model"""
    
    list_display = ['name', 'degree_type', 'duration_years']
    list_filter = ['degree_type']
    search_fields = ['name']
    ordering = ['name']


@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    """Admin for Scholarship model"""
    
    list_display = ['name', 'college', 'amount']
    list_filter = ['college__state']
    search_fields = ['name', 'college__name']
    autocomplete_fields = ['college']
