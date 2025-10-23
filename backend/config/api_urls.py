"""Main API URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from colleges.views import CollegeViewSet, CollegeSearchView
from exams.views import ExamViewSet
from guidance.views import PrepPlanViewSet
from interactions.views import ShortlistViewSet, ReminderSubscriptionViewSet, ReviewViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register(r'colleges', CollegeViewSet, basename='college')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'prep/plans', PrepPlanViewSet, basename='prepplan')
router.register(r'saved', ShortlistViewSet, basename='shortlist')
router.register(r'reminders', ReminderSubscriptionViewSet, basename='reminder')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Users app (auth & profile)
    path('', include('users.urls')),
    
    # College search endpoint (Elasticsearch)
    path('colleges/search/', CollegeSearchView.as_view(), name='college-search'),
]
