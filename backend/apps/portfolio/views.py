"""
==============================================================================
Portfolio Content API Views (apps/portfolio/views.py)
==============================================================================

WHAT IS THIS FILE?
Provides read-only JSON API endpoints for portfolio content.
All endpoints use `permission_classes = [AllowAny]` so the public website
can fetch them without requiring login credentials.

OPTIMIZATIONS EXPLAINED:
- `prefetch_related('skills')`: Instead of querying the database once for every skill
  category, Django fetches all tools in one single SQL query to keep the API fast.
- `select_related('category')`: Performs an SQL JOIN to fetch the category name
  together with each certification in one query.
- Filtering & Search (`CertificationListView`): Supports `?category=Data+Analytics`
  and `?search=Power+BI` query parameters.
"""

from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import (
    TickerItem,
    AboutStat,
    SkillCategory,
    Education,
    CertificationCategory,
    Certification,
    Achievement,
)
from .serializers import (
    TickerItemSerializer,
    AboutStatSerializer,
    SkillCategorySerializer,
    EducationSerializer,
    CertificationCategorySerializer,
    CertificationSerializer,
    AchievementSerializer,
)

class TickerListView(ListAPIView):
    """Returns the list of keywords scrolling on the marquee ribbon."""
    permission_classes = [AllowAny]
    serializer_class = TickerItemSerializer
    queryset = TickerItem.objects.filter(is_visible=True)
    pagination_class = None


class AboutStatListView(ListAPIView):
    """Returns the 4 highlight statistic cards for the About section."""
    permission_classes = [AllowAny]
    serializer_class = AboutStatSerializer
    queryset = AboutStat.objects.filter(is_visible=True)
    pagination_class = None


class SkillCategoryListView(ListAPIView):
    """
    Returns skills grouped by category.
    Uses prefetch_related('skills') to fetch all skills efficiently.
    """
    permission_classes = [AllowAny]
    serializer_class = SkillCategorySerializer
    queryset = SkillCategory.objects.filter(is_visible=True).prefetch_related('skills')
    pagination_class = None


class EducationListView(ListAPIView):
    """Returns academic qualifications in chronological order."""
    permission_classes = [AllowAny]
    serializer_class = EducationSerializer
    queryset = Education.objects.filter(is_visible=True)
    pagination_class = None


class CertificationCategoryListView(ListAPIView):
    """Returns categories for filtering certifications."""
    permission_classes = [AllowAny]
    serializer_class = CertificationCategorySerializer
    queryset = CertificationCategory.objects.filter(is_visible=True)
    pagination_class = None


class CertificationListView(ListAPIView):
    """
    Returns professional certificates with optional category and search filtering.
    Example: /api/v1/certifications/?category=Data+Analytics&search=Power+BI
    """
    permission_classes = [AllowAny]
    serializer_class = CertificationSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Certification.objects.filter(is_visible=True).select_related('category')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        # Filter by category if specified and not 'all'
        if category and category.lower() != 'all':
            queryset = queryset.filter(category__name__iexact=category)

        # Search across title, issuer, or category name
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(issuer__icontains=search) |
                Q(category__name__icontains=search)
            )

        return queryset


class AchievementListView(ListAPIView):
    """Returns milestone achievements for the Highlights section."""
    permission_classes = [AllowAny]
    serializer_class = AchievementSerializer
    queryset = Achievement.objects.filter(is_visible=True)
    pagination_class = None


