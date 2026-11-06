"""
==============================================================================
Site Settings API Views (apps/site_settings/views.py)
==============================================================================

WHAT IS THIS FILE?
In Django REST Framework, a "View" is the Python function or class that runs
when a visitor's browser asks for a specific URL endpoint.
The view queries the database, converts the Python data into JSON using a Serializer,
and sends the JSON back across the internet.

KEY VIEWS INCLUDED:
1. `SiteSettingsView`: Returns global profile data (headlines, social links, resume URL).
2. `DesignSettingsView`: Returns active theme colors and font configuration.
3. `NavigationListView`: Returns the list of visible menu items.
4. `SectionConfigListView`: Returns the list of visible sections and their custom headings.
5. `BootstrapDataView`: Bundles ALL the above into ONE unified JSON response for speed!
"""

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
    """Returns the single SiteSettings record as JSON."""
    permission_classes = [AllowAny]  # Publicly readable by the frontend website

    def get(self, request):
        settings_obj = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings_obj, context={'request': request})
        return Response(serializer.data)


class DesignSettingsView(APIView):
    """Returns the design theme colors and font settings as JSON."""
    permission_classes = [AllowAny]

    def get(self, request):
        design_obj = DesignSettings.load()
        serializer = DesignSettingsSerializer(design_obj)
        return Response(serializer.data)


class NavigationListView(ListAPIView):
    """Returns the list of visible top-bar navigation links."""
    permission_classes = [AllowAny]
    serializer_class = NavigationItemSerializer
    queryset = NavigationItem.objects.filter(is_visible=True)
    pagination_class = None  # Returns all links at once without pagination


class SectionConfigListView(ListAPIView):
    """Returns the list of active sections and custom headings."""
    permission_classes = [AllowAny]
    serializer_class = SectionConfigSerializer
    queryset = SectionConfig.objects.filter(is_visible=True)
    pagination_class = None


class BootstrapDataView(APIView):
    """
    Consolidated Fast-Bootstrap Endpoint:
    Combines site settings, theme colors, navigation links, and hero metrics
    into a single network response so the website starts up almost instantly!
    """
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


