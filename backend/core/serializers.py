from rest_framework import serializers
from .models import (
    Users, Colleges, Exams, ExamDates, CollegeExams, CollegeDegrees,
    Scholarships, PrepPlans, PrepWeeks, SavedColleges, Reminders, Reviews
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'name', 'email', 'auth_provider', 'state', 'class_level', 
                 'target_degree', 'budget_min', 'budget_max', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exams
        fields = ['exams_id', 'code', 'name', 'overview', 'eligibility', 'pattern', 
                 'syllabus_summary', 'application_url', 'created_at', 'updated_at']
        read_only_fields = ['exams_id', 'created_at', 'updated_at']

class ExamDateSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    
    class Meta:
        model = ExamDates
        fields = ['id', 'exam', 'exam_name', 'type', 'date']
        read_only_fields = ['id']

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Colleges
        fields = ['college_id', 'name', 'description', 'state', 'city', 
                 'location_lat', 'location_lng', 'accreditation', 'type', 
                 'fees_annual', 'fees_hostel', 'restart_score', 'ratings_count', 
                 'reviews_avg', 'website_url', 'created_at', 'updated_at']
        read_only_fields = ['college_id', 'created_at', 'updated_at']

class CollegeDetailSerializer(serializers.ModelSerializer):
    degrees = serializers.SerializerMethodField()
    scholarships = serializers.SerializerMethodField()
    exams = serializers.SerializerMethodField()
    
    class Meta:
        model = Colleges
        fields = ['college_id', 'name', 'description', 'state', 'city', 
                 'location_lat', 'location_lng', 'accreditation', 'type', 
                 'fees_annual', 'fees_hostel', 'restart_score', 'ratings_count', 
                 'reviews_avg', 'website_url', 'degrees', 'scholarships', 'exams',
                 'created_at', 'updated_at']
        read_only_fields = ['college_id', 'created_at', 'updated_at']
    
    def get_degrees(self, obj):
        degrees = CollegeDegrees.objects.filter(college=obj)
        return [degree.degree for degree in degrees]
    
    def get_scholarships(self, obj):
        scholarships = Scholarships.objects.filter(college=obj)
        return ScholarshipSerializer(scholarships, many=True).data
    
    def get_exams(self, obj):
        college_exams = CollegeExams.objects.filter(college=obj)
        exams = [ce.exam for ce in college_exams]
        return ExamSerializer(exams, many=True).data

class ScholarshipSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)
    
    class Meta:
        model = Scholarships
        fields = ['id', 'college', 'college_name', 'name', 'criteria']
        read_only_fields = ['id']

class PrepPlanSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    
    class Meta:
        model = PrepPlans
        fields = ['id', 'user', 'user_name', 'exam', 'exam_name', 'status', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PrepWeekSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrepWeeks
        fields = ['id', 'prep_plan', 'week_number', 'tasks']
        read_only_fields = ['id']

class SavedCollegeSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)
    college_details = CollegeSerializer(source='college', read_only=True)
    
    class Meta:
        model = SavedColleges
        fields = ['user', 'college', 'college_name', 'college_details', 'created_at']
        read_only_fields = ['created_at']

class ReminderSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = Reminders
        fields = ['id', 'user', 'user_name', 'type', 'target_id', 'channels', 'created_at']
        read_only_fields = ['id', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)
    
    class Meta:
        model = Reviews
        fields = ['id', 'user', 'user_name', 'college', 'college_name', 'rating', 
                 'title', 'body', 'tags', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

# Authentication Serializers
class OTPLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
