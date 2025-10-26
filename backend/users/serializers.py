"""
Serializers for users app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'auth_provider',
            'state', 'class_level', 'target_degree',
            'budget_min', 'budget_max',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'auth_provider', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password]
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'name', 'password',
            'state', 'class_level', 'target_degree',
            'budget_min', 'budget_max'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'name', 'state', 'class_level',
            'target_degree', 'budget_min', 'budget_max'
        ]


class OTPRequestSerializer(serializers.Serializer):
    """Serializer for OTP request"""
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth"""
    access_token = serializers.CharField(required=False)
    id_token = serializers.CharField(required=True)
    
    def validate(self, data):
        """
        Check that at least one of access_token or id_token is provided.
        """
        if not data.get('access_token') and not data.get('id_token'):
            raise serializers.ValidationError(
                "Either access_token or id_token must be provided."
            )
        return data
