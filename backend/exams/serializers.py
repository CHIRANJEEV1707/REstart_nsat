"""
Serializers for exams app.
"""
from rest_framework import serializers
from .models import Exam, ExamDate


class ExamDateSerializer(serializers.ModelSerializer):
    """Serializer for ExamDate model"""
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = ExamDate
        fields = [
            'id', 'type', 'type_display', 'date', 'description'
        ]


class ExamListSerializer(serializers.ModelSerializer):
    """Serializer for Exam list view"""
    
    class Meta:
        model = Exam
        fields = [
            'id', 'code', 'name', 'overview',
            'application_url', 'created_at'
        ]


class ExamDetailSerializer(serializers.ModelSerializer):
    """Serializer for Exam detail view"""
    
    exam_dates = ExamDateSerializer(many=True, read_only=True)
    colleges_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = [
            'id', 'code', 'name', 'overview',
            'eligibility', 'pattern', 'syllabus_summary',
            'application_url', 'dates', 'cutoffs',
            'exam_dates', 'colleges_count',
            'created_at', 'updated_at'
        ]
    
    def get_colleges_count(self, obj):
        """Get count of colleges accepting this exam"""
        return obj.colleges.filter(status='published').count()


class ExamCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating exams"""
    
    class Meta:
        model = Exam
        fields = [
            'code', 'name', 'overview', 'eligibility',
            'pattern', 'syllabus_summary', 'application_url',
            'dates', 'cutoffs'
        ]
