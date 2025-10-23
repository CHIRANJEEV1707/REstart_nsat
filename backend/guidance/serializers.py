"""
Serializers for guidance app.
"""
from rest_framework import serializers
from .models import PrepPlan, PrepWeek, PrepTask
from exams.serializers import ExamListSerializer


class PrepTaskSerializer(serializers.ModelSerializer):
    """Serializer for PrepTask model"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PrepTask
        fields = [
            'id', 'title', 'description', 'status', 'status_display',
            'order', 'estimated_hours', 'resources', 'completed_at'
        ]
        read_only_fields = ['id']


class PrepWeekSerializer(serializers.ModelSerializer):
    """Serializer for PrepWeek model"""
    
    tasks = PrepTaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = PrepWeek
        fields = [
            'id', 'week_number', 'title',
            'start_date', 'end_date', 'tasks'
        ]
        read_only_fields = ['id']


class PrepPlanListSerializer(serializers.ModelSerializer):
    """Serializer for PrepPlan list view"""
    
    exam = ExamListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    weeks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PrepPlan
        fields = [
            'id', 'exam', 'status', 'status_display',
            'target_date', 'weeks_count', 'created_at', 'updated_at'
        ]
    
    def get_weeks_count(self, obj):
        return obj.weeks.count()


class PrepPlanDetailSerializer(serializers.ModelSerializer):
    """Serializer for PrepPlan detail view"""
    
    exam = ExamListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    weeks = PrepWeekSerializer(many=True, read_only=True)
    
    class Meta:
        model = PrepPlan
        fields = [
            'id', 'exam', 'status', 'status_display',
            'target_date', 'weeks', 'created_at', 'updated_at'
        ]


class PrepPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating PrepPlan"""
    
    exam_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PrepPlan
        fields = ['exam_id', 'target_date', 'status']
    
    def validate_exam_id(self, value):
        from exams.models import Exam
        if not Exam.objects.filter(id=value).exists():
            raise serializers.ValidationError("Exam does not exist")
        return value
    
    def create(self, validated_data):
        from exams.models import Exam
        exam_id = validated_data.pop('exam_id')
        exam = Exam.objects.get(id=exam_id)
        user = self.context['request'].user
        
        # Check if plan already exists
        if PrepPlan.objects.filter(user=user, exam=exam).exists():
            raise serializers.ValidationError("Prep plan for this exam already exists")
        
        prep_plan = PrepPlan.objects.create(
            user=user,
            exam=exam,
            **validated_data
        )
        return prep_plan


class PrepPlanUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating PrepPlan"""
    
    class Meta:
        model = PrepPlan
        fields = ['status', 'target_date']


class PrepTaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating PrepTask"""
    
    class Meta:
        model = PrepTask
        fields = ['status', 'completed_at']
    
    def validate(self, data):
        if data.get('status') == 'completed' and not data.get('completed_at'):
            from django.utils import timezone
            data['completed_at'] = timezone.now()
        return data
