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

