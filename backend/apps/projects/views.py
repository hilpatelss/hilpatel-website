"""
==============================================================================
Project API Views (apps/projects/views.py)
==============================================================================

WHAT IS THIS FILE?
Provides read-only JSON API endpoints for projects:
1. `ProjectListView`: Returns all published projects with optional filtering (category, tag, search).
2. `ProjectDetailView`: Returns full details for a single project looked up by its URL slug.
3. `ProjectCategoryListView`: Returns project category filters.
4. `TechnologyTagListView`: Returns all available technology tags.
"""

from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import ProjectCategory, TechnologyTag, Project
from .serializers import (
    ProjectCategorySerializer,
    TechnologyTagSerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
)

class ProjectListView(ListAPIView):
    """
    Returns the list of published projects.
    Optimized with select_related & prefetch_related to load all tags & bullet points in one go.
    Supports query parameters: ?category=..., ?tag=..., ?featured=true, ?search=...
    """
    permission_classes = [AllowAny]
    serializer_class = ProjectListSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Project.objects.filter(is_published=True).select_related('category').prefetch_related('tags', 'highlights')
        
        category = self.request.query_params.get('category')
        tag = self.request.query_params.get('tag')
        featured = self.request.query_params.get('featured')
        search = self.request.query_params.get('search')

        if category and category.lower() != 'all':
            queryset = queryset.filter(Q(category__slug=category) | Q(category__name__iexact=category))

        if tag:
            queryset = queryset.filter(tags__slug=tag)

        if featured and featured.lower() in ('true', '1', 'yes'):
            queryset = queryset.filter(is_featured=True)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(short_description__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()

        return queryset


class ProjectDetailView(RetrieveAPIView):
    """Returns complete details and screenshots for a single project by slug."""
    permission_classes = [AllowAny]
    serializer_class = ProjectDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Project.objects.filter(is_published=True).select_related('category').prefetch_related(
            'tags', 'highlights', 'gallery_images'
        )


class ProjectCategoryListView(ListAPIView):
    """Returns project categories."""
    permission_classes = [AllowAny]
    serializer_class = ProjectCategorySerializer
    queryset = ProjectCategory.objects.filter(is_visible=True)
    pagination_class = None


class TechnologyTagListView(ListAPIView):
    """Returns all technology tags."""
    permission_classes = [AllowAny]
    serializer_class = TechnologyTagSerializer
    queryset = TechnologyTag.objects.all()
    pagination_class = None


