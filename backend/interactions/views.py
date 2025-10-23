"""Views for interactions app (Shortlist, Reminders, Reviews)."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Shortlist, ReminderSubscription, Review
from .serializers import (
    ShortlistSerializer, ShortlistCreateSerializer,
    ReminderSubscriptionSerializer, ReminderSubscriptionCreateSerializer,
    ReviewSerializer, ReviewCreateSerializer, ReviewModerationSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners to edit their objects"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class ShortlistViewSet(viewsets.ModelViewSet):
    """ViewSet for user's shortlisted colleges"""
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Users can only see their own shortlist"""
        return Shortlist.objects.filter(
            user=self.request.user
        ).select_related('college').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ShortlistCreateSerializer
        return ShortlistSerializer
    
    def destroy(self, request, *args, **kwargs):
        """Remove college from shortlist"""
        instance = self.get_object()
        college_id = instance.college.id
        self.perform_destroy(instance)
        return Response(
            {'message': f'College {college_id} removed from shortlist'},
            status=status.HTTP_200_OK
        )


class ReminderSubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for reminder subscriptions"""
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Users can only see their own reminders"""
        return ReminderSubscription.objects.filter(
            user=self.request.user
        ).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReminderSubscriptionCreateSerializer
        return ReminderSubscriptionSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for college reviews"""
    
    def get_queryset(self):
        """Filter based on user role"""
        if self.request.user.is_staff:
            # Admins can see all reviews
            return Review.objects.all().select_related('user', 'college')
        elif self.request.user.is_authenticated:
            # Users can see their own reviews
            return Review.objects.filter(user=self.request.user).select_related('college')
        else:
            # Anonymous users see only approved reviews
            return Review.objects.filter(status='approved').select_related('user', 'college')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        elif self.action == 'moderate':
            return ReviewModerationSerializer
        return ReviewSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy', 'moderate']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def moderate(self, request, pk=None):
        """Moderate a review (approve/reject)"""
        review = self.get_object()
        serializer = ReviewModerationSerializer(
            review,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': f'Review {review.status}',
            'review': ReviewSerializer(review).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        """Get all pending reviews for moderation"""
        pending_reviews = Review.objects.filter(
            status='pending'
        ).select_related('user', 'college').order_by('created_at')
        
        serializer = ReviewSerializer(pending_reviews, many=True)
        return Response(serializer.data)
