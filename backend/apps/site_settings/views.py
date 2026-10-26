from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import SiteSettings, DesignSettings, NavigationItem, SectionConfig, HeroMetric
from .serializers import (
    SiteSettingsSerializer,
    DesignSettingsSerializer,
    NavigationItemSerializer,
    SectionConfigSerializer,
    HeroMetricSerializer,
)

class SiteSettingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings_obj = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings_obj, context={'request': request})
        return Response(serializer.data)


class DesignSettingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        design_obj = DesignSettings.load()
        serializer = DesignSettingsSerializer(design_obj)
        return Response(serializer.data)


class NavigationListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = NavigationItemSerializer
    queryset = NavigationItem.objects.filter(is_visible=True)
    pagination_class = None


class SectionConfigListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SectionConfigSerializer
    queryset = SectionConfig.objects.filter(is_visible=True)
    pagination_class = None


class BootstrapDataView(APIView):
    """Consolidated endpoint delivering global settings, design tokens, navigation and sections."""
    permission_classes = [AllowAny]

    def get(self, request):
        site = SiteSettings.load()
        design = DesignSettings.load()
        nav = NavigationItem.objects.filter(is_visible=True)
        sections = SectionConfig.objects.filter(is_visible=True)
        hero_metrics = HeroMetric.objects.filter(is_visible=True)

        return Response({
            'site': SiteSettingsSerializer(site, context={'request': request}).data,
            'design': DesignSettingsSerializer(design).data,
            'navigation': NavigationItemSerializer(nav, many=True).data,
            'sections': SectionConfigSerializer(sections, many=True).data,
            'hero_metrics': HeroMetricSerializer(hero_metrics, many=True).data,
        })

