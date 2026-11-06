"""
==============================================================================
Site Settings URL Routes (apps/site_settings/urls.py)
==============================================================================

WHAT IS THIS FILE?
Routes requests coming to `/api/v1/site-settings/...` to the appropriate view:
- `/`           -> General site settings (owner name, contact details, resume URL)
- `/design/`    -> Visual theme colors (Apple dark & light palettes)
- `/navigation/`-> Navigation menu links
- `/sections/`  -> Section display visibility & custom titles
- `/bootstrap/` -> Unified payload containing everything for instant page load
"""

from django.urls import path
from .views import (
    SiteSettingsView,
    DesignSettingsView,
    NavigationListView,
    SectionConfigListView,
    BootstrapDataView,
)

urlpatterns = [
    path('', SiteSettingsView.as_view(), name='site-settings'),
    path('design/', DesignSettingsView.as_view(), name='design-settings'),
    path('navigation/', NavigationListView.as_view(), name='navigation-list'),
    path('sections/', SectionConfigListView.as_view(), name='sections-list'),
    path('bootstrap/', BootstrapDataView.as_view(), name='bootstrap-data'),
]


