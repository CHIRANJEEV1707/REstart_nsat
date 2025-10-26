"""Views for colleges app with Elasticsearch integration."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache
from django.db.models import Prefetch
from elasticsearch_dsl import Q as ES_Q
import logging

from .models import College, Scholarship, ImportantDate, CollegeDegree
from .serializers import (
    CollegeListSerializer, CollegeDetailSerializer,
    CollegeCreateUpdateSerializer, CollegeSearchSerializer,
    ScholarshipSerializer, ImportantDateSerializer
)
from .documents import CollegeDocument

logger = logging.getLogger(__name__)


class CollegeSearchView(APIView):
    """
    Elasticsearch-powered college search and filtering.
    This view does NOT hit MySQL database for search operations.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Validate query parameters
        serializer = CollegeSearchSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data
        
        # Build Elasticsearch query
        search = CollegeDocument.search()
        
        # Only show published colleges
        search = search.filter('term', status='published')
        
        # Full-text search on name and description
        if params.get('q'):
            search = search.query(
                'multi_match',
                query=params['q'],
                fields=['name^3', 'description'],
                fuzziness='AUTO'
            )
        
        # Filter by state
        if params.get('state'):
            search = search.filter('term', state=params['state'])
        
        # Filter by city
        if params.get('city'):
            search = search.filter('term', city=params['city'])
        
        # Filter by type
        if params.get('type'):
            search = search.filter('term', type=params['type'])
        
        # Filter by fees range
        if params.get('fees_min') or params.get('fees_max'):
            fees_filter = {}
            if params.get('fees_min'):
                fees_filter['gte'] = params['fees_min']
            if params.get('fees_max'):
                fees_filter['lte'] = params['fees_max']
            search = search.filter('range', fees_annual=fees_filter)
        
        # Filter by restart_score
        if params.get('restart_score_min'):
            search = search.filter(
                'range',
                restart_score={'gte': params['restart_score_min']}
            )
        
        # Filter by rating
        if params.get('rating_min'):
            search = search.filter(
                'range',
                reviews_avg={'gte': params['rating_min']}
            )
        
        # Filter by exam
        if params.get('exam'):
            search = search.filter('term', exams_required=params['exam'])
        
        # Filter by degree
        if params.get('degree'):
            search = search.filter('term', degrees_offered=params['degree'])
        
        # Sorting
        sort_by = params.get('sort_by', '-restart_score')
        if sort_by.startswith('-'):
            search = search.sort({sort_by[1:]: {'order': 'desc'}})
        else:
            search = search.sort({sort_by: {'order': 'asc'}})
        
        # Pagination
        page = params.get('page', 1)
        page_size = params.get('page_size', 20)
        start = (page - 1) * page_size
        end = start + page_size
        
        # Execute search
        search = search[start:end]
        response = search.execute()
        
        # Format results
        results = []
        for hit in response:
            results.append({
                'id': hit.id,
                'name': hit.name,
                'state': hit.state,
                'city': hit.city,
                'type': hit.type,
                'fees_annual': hit.fees_annual,
                'restart_score': hit.restart_score,
                'reviews_avg': hit.reviews_avg,
                'ratings_count': hit.ratings_count,
                'website_url': hit.website_url,
            })
        
        return Response({
            'count': response.hits.total.value,
            'page': page,
            'page_size': page_size,
            'results': results
        })


class CollegeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for College CRUD operations.
    List view uses database, detail view uses MySQL with caching.
    """
    queryset = College.objects.all()
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CollegeListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CollegeCreateUpdateSerializer
        return CollegeDetailSerializer
    
    def get_permissions(self):
        """Only admins can create/update/delete colleges"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    def list(self, request, *args, **kwargs):
        """Use database instead of Elasticsearch for testing"""
        # Get query parameters
        state = request.query_params.get('state')
        fees_annual__lte = request.query_params.get('fees_annual__lte')
        
        # Start with all colleges
        queryset = College.objects.filter(status='published')
        
        # Apply filters if provided
        if state:
            queryset = queryset.filter(state=state)
        
        if fees_annual__lte:
            queryset = queryset.filter(fees_annual__lte=int(fees_annual__lte))
        
        # Order by restart_score by default
        queryset = queryset.order_by('-restart_score')
        
        # Use pagination from DRF
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """Get college detail with Redis caching"""
        college_id = kwargs.get('pk')
        cache_key = f'college_detail_{college_id}'
        
        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Get from database with prefetch
        queryset = College.objects.prefetch_related(
            'scholarships',
            'important_dates',
            'degrees__degree',
            'collegeexam_set__exam'
        )
        
        try:
            college = queryset.get(pk=college_id)
        except College.DoesNotExist:
            return Response(
                {'error': 'College not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(college)
        data = serializer.data
        
        # Cache for 1 hour
        cache.set(cache_key, data, timeout=3600)
        
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def scholarships(self, request, pk=None):
        """Get scholarships for a college"""
        college = self.get_object()
        scholarships = college.scholarships.all()
        serializer = ScholarshipSerializer(scholarships, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def important_dates(self, request, pk=None):
        """Get important dates for a college"""
        college = self.get_object()
        dates = college.important_dates.all().order_by('date')
        serializer = ImportantDateSerializer(dates, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get approved reviews for a college"""
        from interactions.models import Review
        from interactions.serializers import ReviewSerializer
        
        college = self.get_object()
        reviews = Review.objects.filter(
            college=college,
            status='approved'
        ).select_related('user').order_by('-created_at')
        
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
