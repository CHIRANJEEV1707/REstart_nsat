"""
Serializers for interactions app.
"""
from rest_framework import serializers
from .models import Shortlist, ReminderSubscription, Review
from colleges.serializers import CollegeListSerializer


class ShortlistSerializer(serializers.ModelSerializer):
    """Serializer for Shortlist model"""
    
    college = CollegeListSerializer(read_only=True)
    
    class Meta:
        model = Shortlist
        fields = ['id', 'college', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShortlistCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Shortlist"""
    
    college_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Shortlist
        fields = ['college_id', 'notes']
    
    def validate_college_id(self, value):
        from colleges.models import College
        if not College.objects.filter(id=value, status='published').exists():
            raise serializers.ValidationError("College does not exist or is not published")
        return value
    
    def create(self, validated_data):
        from colleges.models import College
        college_id = validated_data.pop('college_id')
        college = College.objects.get(id=college_id)
        user = self.context['request'].user
        
        # Check if already shortlisted
        if Shortlist.objects.filter(user=user, college=college).exists():
            raise serializers.ValidationError("College already in shortlist")
        
        shortlist = Shortlist.objects.create(
            user=user,
            college=college,
            **validated_data
        )
        return shortlist


class ReminderSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for ReminderSubscription model"""
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    target_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ReminderSubscription
        fields = [
            'id', 'type', 'type_display', 'object_id',
            'channels', 'days_before', 'is_active',
            'target_info', 'created_at', 'last_sent_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_sent_at']
    
    def get_target_info(self, obj):
        """Get basic info about the target object"""
        target = obj.target
        if target:
            if hasattr(target, 'name'):
                return {'name': target.name}
            elif hasattr(target, 'exam'):
                return {'exam': target.exam.code, 'date': str(target.date)}
            elif hasattr(target, 'college'):
                return {'college': target.college.name, 'date': str(target.date)}
        return None


class ReminderSubscriptionCreateSerializer(serializers.Serializer):
    """Serializer for creating ReminderSubscription"""
    
    type = serializers.ChoiceField(choices=['exam', 'college_date', 'exam_date'])
    target_id = serializers.IntegerField()
    channels = serializers.ListField(
        child=serializers.ChoiceField(choices=['email', 'sms', 'push']),
        min_length=1
    )
    days_before = serializers.IntegerField(min_value=1, max_value=90, default=7)
    
    def validate(self, data):
        from django.contrib.contenttypes.models import ContentType
        from exams.models import Exam, ExamDate
        from colleges.models import ImportantDate
        
        # Validate target exists based on type
        target_id = data['target_id']
        reminder_type = data['type']
        
        if reminder_type == 'exam':
            if not Exam.objects.filter(id=target_id).exists():
                raise serializers.ValidationError("Exam does not exist")
            content_type = ContentType.objects.get_for_model(Exam)
        
        elif reminder_type == 'exam_date':
            if not ExamDate.objects.filter(id=target_id).exists():
                raise serializers.ValidationError("Exam date does not exist")
            content_type = ContentType.objects.get_for_model(ExamDate)
        
        elif reminder_type == 'college_date':
            if not ImportantDate.objects.filter(id=target_id).exists():
                raise serializers.ValidationError("College date does not exist")
            content_type = ContentType.objects.get_for_model(ImportantDate)
        
        data['content_type'] = content_type
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        content_type = validated_data.pop('content_type')
        target_id = validated_data.pop('target_id')
        
        reminder = ReminderSubscription.objects.create(
            user=user,
            content_type=content_type,
            object_id=target_id,
            **validated_data
        )
        return reminder


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'user_name', 'college_name', 'rating',
            'title', 'body', 'tags', 'status', 'status_display',
            'helpful_count', 'not_helpful_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user_name', 'college_name', 'status',
            'helpful_count', 'not_helpful_count',
            'created_at', 'updated_at'
        ]


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Review"""
    
    college_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Review
        fields = ['college_id', 'rating', 'title', 'body', 'tags']
    
    def validate_college_id(self, value):
        from colleges.models import College
        if not College.objects.filter(id=value, status='published').exists():
            raise serializers.ValidationError("College does not exist or is not published")
        return value
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def create(self, validated_data):
        from colleges.models import College
        college_id = validated_data.pop('college_id')
        college = College.objects.get(id=college_id)
        user = self.context['request'].user
        
        # Check if user already reviewed this college
        if Review.objects.filter(user=user, college=college).exists():
            raise serializers.ValidationError("You have already reviewed this college")
        
        review = Review.objects.create(
            user=user,
            college=college,
            status='pending',  # All reviews start as pending
            **validated_data
        )
        return review


class ReviewModerationSerializer(serializers.ModelSerializer):
    """Serializer for moderating reviews (admin only)"""
    
    class Meta:
        model = Review
        fields = ['status', 'moderation_notes']
    
    def validate_status(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Status must be 'approved' or 'rejected'")
        return value
    
    def update(self, instance, validated_data):
        from django.utils import timezone
        from interactions.tasks import send_review_approval_notification
        
        instance.status = validated_data.get('status', instance.status)
        instance.moderation_notes = validated_data.get('moderation_notes', instance.moderation_notes)
        instance.moderated_by = self.context['request'].user
        instance.moderated_at = timezone.now()
        instance.save()
        
        # Queue notification task
        send_review_approval_notification.delay(instance.id)
        
        # Update college statistics if approved
        if instance.status == 'approved':
            from colleges.tasks import update_college_statistics
            update_college_statistics.delay(instance.college.id)
        
        return instance
