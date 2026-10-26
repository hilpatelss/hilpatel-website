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
    permission_classes = [AllowAny]
    serializer_class = TickerItemSerializer
    queryset = TickerItem.objects.filter(is_visible=True)
    pagination_class = None


class AboutStatListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AboutStatSerializer
    queryset = AboutStat.objects.filter(is_visible=True)
    pagination_class = None


class SkillCategoryListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SkillCategorySerializer
    queryset = SkillCategory.objects.filter(is_visible=True).prefetch_related('skills')
    pagination_class = None


class EducationListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = EducationSerializer
    queryset = Education.objects.filter(is_visible=True)
    pagination_class = None


class CertificationCategoryListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CertificationCategorySerializer
    queryset = CertificationCategory.objects.filter(is_visible=True)
    pagination_class = None


class CertificationListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CertificationSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Certification.objects.filter(is_visible=True).select_related('category')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if category and category.lower() != 'all':
            queryset = queryset.filter(category__name__iexact=category)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(issuer__icontains=search) |
                Q(category__name__icontains=search)
            )

        return queryset


class AchievementListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AchievementSerializer
    queryset = Achievement.objects.filter(is_visible=True)
    pagination_class = None

