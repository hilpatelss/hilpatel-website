from django.urls import path
from .views import (
    VisitorLogView,
    SessionTrackingView,
    PageViewTrackingView,
    EventTrackingView,
    BeaconFlushView,
    AdminAnalyticsDashboardDataView,
)

app_name = 'analytics'

urlpatterns = [
    # Legacy backward-compatible endpoint
    path('log/', VisitorLogView.as_view(), name='visitor-log'),

    # Comprehensive visitor analytics telemetry endpoints
    path('session/', SessionTrackingView.as_view(), name='analytics-session'),
    path('pageview/', PageViewTrackingView.as_view(), name='analytics-pageview'),
    path('event/', EventTrackingView.as_view(), name='analytics-event'),
    path('beacon/', BeaconFlushView.as_view(), name='analytics-beacon'),

    # Protected admin metrics API
    path('dashboard-data/', AdminAnalyticsDashboardDataView.as_view(), name='analytics-dashboard-data'),
]
