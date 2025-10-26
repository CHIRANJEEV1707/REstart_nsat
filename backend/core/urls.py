from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views, auth_views, login_views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'colleges', views.CollegeViewSet)
router.register(r'exams', views.ExamViewSet)
router.register(r'saved-colleges', views.SavedCollegeViewSet, basename='savedcollege')
router.register(r'reminders', views.ReminderViewSet, basename='reminder')
router.register(r'prep-plans', views.PrepPlanViewSet, basename='prepplan')
router.register(r'reviews', views.ReviewViewSet, basename='review')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/otp/', auth_views.login_otp, name='login_otp'),
    path('auth/verify/otp/', auth_views.verify_otp, name='verify_otp'),
    path('auth/google/', auth_views.google_auth, name='google_auth'),
    path('auth/me/', auth_views.get_current_user, name='current_user'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # NextAuth OAuth endpoints
    path('auth/google/url/', auth_views.get_google_auth_url, name='google_auth_url'),
    path('auth/github/url/', auth_views.get_github_auth_url, name='github_auth_url'),
    path('auth/oauth/callback/', auth_views.oauth_callback, name='oauth_callback'),
    path('auth/register/', auth_views.register_user, name='register_user'),
    path('auth/login/', login_views.login_user, name='login_user'),
    
    # Custom review endpoint
    path('colleges/<int:college_id>/reviews/', views.submit_college_review, name='submit_college_review'),
    
    # Include router URLs
    path('', include(router.urls)),
]
