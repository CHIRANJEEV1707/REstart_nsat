from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import (
    Users, Colleges, Exams, ExamDates, CollegeExams, CollegeDegrees,
    Scholarships, PrepPlans, PrepWeeks, SavedColleges, Reminders, Reviews
)
from .serializers import (
    UserSerializer, CollegeSerializer, CollegeDetailSerializer, ExamSerializer,
    ExamDateSerializer, ScholarshipSerializer, PrepPlanSerializer, PrepWeekSerializer,
    SavedCollegeSerializer, ReminderSerializer, ReviewSerializer
)

# College Discovery & Filters
class CollegeViewSet(viewsets.ModelViewSet):
    queryset = Colleges.objects.all()
    serializer_class = CollegeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['state', 'city', 'type', 'fees_annual', 'restart_score']
    search_fields = ['name', 'description', 'city', 'state']
    ordering_fields = ['name', 'fees_annual', 'restart_score', 'reviews_avg']
    ordering = ['name']
    permission_classes = [AllowAny]  # Public access for college discovery
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CollegeDetailSerializer
        return CollegeSerializer
    
    def get_queryset(self):
        queryset = Colleges.objects.all()
        
        # Custom filtering
        budget_min = self.request.query_params.get('budget_min')
        budget_max = self.request.query_params.get('budget_max')
        
        if budget_min:
            queryset = queryset.filter(fees_annual__gte=budget_min)
        if budget_max:
            queryset = queryset.filter(fees_annual__lte=budget_max)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def fees(self, request, pk=None):
        """Get fees information for a college"""
        college = self.get_object()
        return Response({
            'college_id': college.college_id,
            'name': college.name,
            'fees_annual': college.fees_annual,
            'fees_hostel': college.fees_hostel
        })
    
    @action(detail=True, methods=['get'])
    def scholarships(self, request, pk=None):
        """Get scholarships for a college"""
        college = self.get_object()
        scholarships = Scholarships.objects.filter(college=college)
        serializer = ScholarshipSerializer(scholarships, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def exams(self, request, pk=None):
        """Get exams required for a college"""
        college = self.get_object()
        college_exams = CollegeExams.objects.filter(college=college)
        exams = [ce.exam for ce in college_exams]
        serializer = ExamSerializer(exams, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get reviews for a college"""
        college = self.get_object()
        reviews = Reviews.objects.filter(college=college, status='approved')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

# Exams Module
class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exams.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [AllowAny]  # Public access for exam information
    
    @action(detail=True, methods=['get'])
    def dates(self, request, pk=None):
        """Get important dates for an exam"""
        exam = self.get_object()
        exam_dates = ExamDates.objects.filter(exam=exam)
        serializer = ExamDateSerializer(exam_dates, many=True)
        return Response(serializer.data)

# User-Specific Features
class SavedCollegeViewSet(viewsets.ModelViewSet):
    serializer_class = SavedCollegeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get user from the Users model based on email
        try:
            user = Users.objects.get(email=self.request.user.email)
            return SavedColleges.objects.filter(user=user)
        except Users.DoesNotExist:
            return SavedColleges.objects.none()
    
    def perform_create(self, serializer):
        # Get user from the Users model
        user = Users.objects.get(email=self.request.user.email)
        serializer.save(user=user)
    
    def destroy(self, request, *args, **kwargs):
        """Remove a saved college"""
        college_id = kwargs.get('pk')
        try:
            user = Users.objects.get(email=request.user.email)
            saved_college = SavedColleges.objects.get(user=user, college_id=college_id)
            saved_college.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (Users.DoesNotExist, SavedColleges.DoesNotExist):
            return Response(
                {'error': 'Saved college not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            user = Users.objects.get(email=self.request.user.email)
            return Reminders.objects.filter(user=user)
        except Users.DoesNotExist:
            return Reminders.objects.none()
    
    def perform_create(self, serializer):
        user = Users.objects.get(email=self.request.user.email)
        serializer.save(user=user)

class PrepPlanViewSet(viewsets.ModelViewSet):
    serializer_class = PrepPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            user = Users.objects.get(email=self.request.user.email)
            return PrepPlans.objects.filter(user=user)
        except Users.DoesNotExist:
            return PrepPlans.objects.none()
    
    def perform_create(self, serializer):
        user = Users.objects.get(email=self.request.user.email)
        serializer.save(user=user)
    
    @action(detail=True, methods=['get'])
    def weeks(self, request, pk=None):
        """Get weekly tasks for a prep plan"""
        prep_plan = self.get_object()
        prep_weeks = PrepWeeks.objects.filter(prep_plan=prep_plan).order_by('week_number')
        serializer = PrepWeekSerializer(prep_weeks, many=True)
        return Response(serializer.data)

# Reviews & Ratings
class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            user = Users.objects.get(email=self.request.user.email)
            return Reviews.objects.filter(user=user)
        except Users.DoesNotExist:
            return Reviews.objects.none()
    
    def perform_create(self, serializer):
        user = Users.objects.get(email=self.request.user.email)
        serializer.save(user=user, status='pending')  # Reviews need approval

# Custom API Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_college_review(request, college_id):
    """Submit a review for a specific college"""
    try:
        user = Users.objects.get(email=request.user.email)
        college = Colleges.objects.get(college_id=college_id)
        
        # Check if user already reviewed this college
        existing_review = Reviews.objects.filter(user=user, college=college).first()
        if existing_review:
            return Response(
                {'error': 'You have already reviewed this college'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user, college=college, status='pending')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except (Users.DoesNotExist, Colleges.DoesNotExist):
        return Response(
            {'error': 'User or College not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )