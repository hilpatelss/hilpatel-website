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
    permission_classes = [AllowAny]
    serializer_class = ProjectDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Project.objects.filter(is_published=True).select_related('category').prefetch_related(
            'tags', 'highlights', 'gallery_images'
        )


class ProjectCategoryListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectCategorySerializer
    queryset = ProjectCategory.objects.filter(is_visible=True)
    pagination_class = None


class TechnologyTagListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TechnologyTagSerializer
    queryset = TechnologyTag.objects.all()
    pagination_class = None

