"""
Serializers for colleges app.
"""
from rest_framework import serializers
from .models import (
    College, CollegeExam, Degree, CollegeDegree,
    Scholarship, ImportantDate
)
from exams.serializers import ExamListSerializer


class ScholarshipSerializer(serializers.ModelSerializer):
    """Serializer for Scholarship model"""
    
    class Meta:
        model = Scholarship
        fields = ['id', 'name', 'criteria', 'amount']


class ImportantDateSerializer(serializers.ModelSerializer):
    """Serializer for ImportantDate model"""
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = ImportantDate
        fields = ['id', 'type', 'type_display', 'date', 'description']


class DegreeSerializer(serializers.ModelSerializer):
    """Serializer for Degree model"""
    
    degree_type_display = serializers.CharField(source='get_degree_type_display', read_only=True)
    
    class Meta:
        model = Degree
        fields = ['id', 'name', 'degree_type', 'degree_type_display', 'duration_years']


class CollegeDegreeSerializer(serializers.ModelSerializer):
    """Serializer for CollegeDegree model"""
    
    degree = DegreeSerializer(read_only=True)
    
    class Meta:
        model = CollegeDegree
        fields = ['id', 'degree', 'seats_available']


class CollegeExamSerializer(serializers.ModelSerializer):
    """Serializer for CollegeExam model"""
    
    exam = ExamListSerializer(read_only=True)
    
    class Meta:
        model = CollegeExam
        fields = ['exam', 'cutoff_rank', 'cutoff_percentile']


class CollegeListSerializer(serializers.ModelSerializer):
    """Serializer for College list view (optimized for search results)"""
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = College
        fields = [
            'id', 'name', 'state', 'city', 'type', 'type_display',
            'fees_annual', 'restart_score', 'reviews_avg',
            'ratings_count', 'website_url'
        ]


class CollegeDetailSerializer(serializers.ModelSerializer):
    """Serializer for College detail view"""
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    exams = CollegeExamSerializer(source='collegeexam_set', many=True, read_only=True)
    degrees = CollegeDegreeSerializer(many=True, read_only=True)
    scholarships = ScholarshipSerializer(many=True, read_only=True)
    important_dates = ImportantDateSerializer(many=True, read_only=True)
    
    class Meta:
        model = College
        fields = [
            'id', 'name', 'description', 'status', 'status_display',
            'state', 'city', 'location_lat', 'location_lng',
            'accreditation', 'type', 'type_display',
            'fees_annual', 'fees_hostel',
            'restart_score', 'ratings_count', 'reviews_avg',
            'website_url', 'exams', 'degrees', 'scholarships',
            'important_dates', 'created_at', 'updated_at'
        ]


class CollegeCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating colleges"""
    
    class Meta:
        model = College
        fields = [
            'name', 'description', 'status',
            'state', 'city', 'location_lat', 'location_lng',
            'accreditation', 'type',
            'fees_annual', 'fees_hostel',
            'restart_score', 'website_url'
        ]


class CollegeSearchSerializer(serializers.Serializer):
    """Serializer for college search/filter parameters"""
    
    q = serializers.CharField(required=False, help_text="Search query")
    state = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    type = serializers.ChoiceField(
        choices=['government', 'private', 'deemed', 'autonomous'],
        required=False
    )
    fees_min = serializers.IntegerField(required=False, min_value=0)
    fees_max = serializers.IntegerField(required=False, min_value=0)
    restart_score_min = serializers.IntegerField(required=False, min_value=0, max_value=100)
    rating_min = serializers.FloatField(required=False, min_value=0, max_value=5)
    exam = serializers.CharField(required=False, help_text="Exam code")
    degree = serializers.CharField(required=False, help_text="Degree name")
    page = serializers.IntegerField(required=False, min_value=1, default=1)
    page_size = serializers.IntegerField(required=False, min_value=1, max_value=100, default=20)
    sort_by = serializers.ChoiceField(
        choices=['restart_score', '-restart_score', 'fees_annual', '-fees_annual', 'name', '-name'],
        required=False,
        default='-restart_score'
    )
