"""Views for exams app."""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Exam, ExamDate
from .serializers import (
    ExamListSerializer, ExamDetailSerializer,
    ExamCreateUpdateSerializer, ExamDateSerializer
)


class ExamViewSet(viewsets.ModelViewSet):
    """ViewSet for Exam CRUD operations"""
    queryset = Exam.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ExamListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ExamCreateUpdateSerializer
        return ExamDetailSerializer
    
    def get_permissions(self):
        """Only admins can create/update/delete exams"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    @action(detail=True, methods=['get'])
    def dates(self, request, pk=None):
        """Get important dates for an exam"""
        exam = self.get_object()
        dates = exam.exam_dates.all().order_by('date')
        serializer = ExamDateSerializer(dates, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def colleges(self, request, pk=None):
        """Get colleges accepting this exam"""
        from colleges.models import College
        from colleges.serializers import CollegeListSerializer
        
        exam = self.get_object()
        colleges = College.objects.filter(
            exams_required=exam,
            status='published'
        ).order_by('-restart_score')
        
        serializer = CollegeListSerializer(colleges, many=True)
        return Response(serializer.data)
