"""Views for guidance app (Prep Plans)."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PrepPlan, PrepWeek, PrepTask
from .serializers import (
    PrepPlanListSerializer, PrepPlanDetailSerializer,
    PrepPlanCreateSerializer, PrepPlanUpdateSerializer,
    PrepTaskUpdateSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners to edit their prep plans"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class PrepPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for PrepPlan CRUD operations"""
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Users can only see their own prep plans"""
        return PrepPlan.objects.filter(user=self.request.user).select_related('exam')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PrepPlanListSerializer
        elif self.action == 'create':
            return PrepPlanCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PrepPlanUpdateSerializer
        return PrepPlanDetailSerializer
    
    @action(detail=True, methods=['get'])
    def weeks(self, request, pk=None):
        """Get all weeks for a prep plan"""
        prep_plan = self.get_object()
        weeks = prep_plan.weeks.prefetch_related('tasks').all()
        
        from .serializers import PrepWeekSerializer
        serializer = PrepWeekSerializer(weeks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], url_path='tasks/(?P<task_id>[^/.]+)')
    def update_task(self, request, pk=None, task_id=None):
        """Update a specific task status"""
        prep_plan = self.get_object()
        
        try:
            task = PrepTask.objects.get(
                id=task_id,
                prep_week__prep_plan=prep_plan
            )
        except PrepTask.DoesNotExist:
            return Response(
                {'error': 'Task not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PrepTaskUpdateSerializer(
            task,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
