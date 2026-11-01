"""
Analytics Serializers

Validates incoming analytics telemetry payloads:
- VisitorLogSerializer: Backward-compatible lightweight logging.
- AnalyticsSessionSerializer: Session lifecycle and active engagement heartbeat telemetry.
- AnalyticsPageViewSerializer: Route navigation and page-level active dwell duration.
- AnalyticsEventSerializer: User interaction events (links, buttons, downloads, nav).
- AnalyticsBeaconSerializer: Unload/visibilitychange bulk heartbeat flush.
"""
from rest_framework import serializers
from .models import VisitorLog, AnalyticsSession, AnalyticsPageView, AnalyticsEvent
from .utils import sanitize_url, sanitize_path


class VisitorLogSerializer(serializers.ModelSerializer):
    path = serializers.CharField(required=False, default='/')
    device_category = serializers.CharField(required=False, default='unknown')
    screen_resolution = serializers.CharField(required=False, default='unknown')
    active_theme = serializers.CharField(required=False, default='unknown')
    referrer = serializers.CharField(required=False, default='', allow_blank=True)
    city = serializers.CharField(required=False, default='', allow_blank=True)
    region = serializers.CharField(required=False, default='', allow_blank=True)
    country = serializers.CharField(required=False, default='', allow_blank=True)
    timezone = serializers.CharField(required=False, default='', allow_blank=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True, default=None)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True, default=None)
    location_display = serializers.CharField(required=False, default='', allow_blank=True)

    class Meta:
        model = VisitorLog
        fields = [
            'path',
            'device_category',
            'screen_resolution',
            'active_theme',
            'referrer',
            'city',
            'region',
            'country',
            'timezone',
            'latitude',
            'longitude',
            'location_display',
        ]

    def validate_path(self, value):
        cleaned = str(value or '/').strip()[:255]
        return cleaned or '/'

    def validate_active_theme(self, value):
        if not value:
            return 'unknown'
        val = str(value).strip().lower()
        if val in ('dark', 'light'):
            return val
        return 'unknown'

    def validate_device_category(self, value):
        if not value:
            return 'unknown'
        val = str(value).strip().lower()
        if val in ('desktop', 'tablet', 'mobile'):
            return val
        return 'unknown'

    def validate_screen_resolution(self, value):
        if not value:
            return 'unknown'
        cleaned = str(value).strip()[:50]
        return cleaned or 'unknown'

    def validate_referrer(self, value):
        if not value:
            return ''
        return str(value).strip()[:500]


class AnalyticsSessionSerializer(serializers.Serializer):
    """
    Validates session start and heartbeat updates.
    """
    session_id = serializers.CharField(max_length=64)
    visitor_id = serializers.CharField(max_length=64)
    landing_page = serializers.CharField(max_length=255, required=False, default='/')
    current_page = serializers.CharField(max_length=255, required=False, default='/')
    referrer = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')
    device_category = serializers.CharField(max_length=20, required=False, default='desktop')
    browser_category = serializers.CharField(max_length=50, required=False, default='unknown')
    os_category = serializers.CharField(max_length=50, required=False, default='unknown')
    screen_resolution = serializers.CharField(max_length=50, required=False, allow_blank=True, default='unknown')
    active_seconds_delta = serializers.IntegerField(required=False, min_value=0, default=0)
    total_active_seconds = serializers.IntegerField(required=False, min_value=0, default=0)
    utm_source = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    utm_medium = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    utm_campaign = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')

    def validate_landing_page(self, value):
        return sanitize_path(value)

    def validate_current_page(self, value):
        return sanitize_path(value)

    def validate_referrer(self, value):
        return sanitize_url(value)


class AnalyticsPageViewSerializer(serializers.Serializer):
    """
    Validates route transitions and active dwell duration on each page.
    """
    session_id = serializers.CharField(max_length=64)
    page_path = serializers.CharField(max_length=255)
    title = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    active_seconds_delta = serializers.IntegerField(required=False, min_value=0, default=0)
    is_landing = serializers.BooleanField(required=False, default=False)
    is_exit = serializers.BooleanField(required=False, default=False)

    def validate_page_path(self, value):
        return sanitize_path(value)


class AnalyticsEventSerializer(serializers.Serializer):
    """
    Validates user interactions with actionable elements.
    """
    session_id = serializers.CharField(max_length=64)
    event_id = serializers.CharField(max_length=64, required=False, allow_blank=True, default='')
    page_path = serializers.CharField(max_length=255, required=False, default='/')
    event_type = serializers.CharField(max_length=64)
    element_category = serializers.CharField(max_length=50, required=False, default='button')
    element_label = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    destination_url = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')

    def validate_page_path(self, value):
        return sanitize_path(value)

    def validate_destination_url(self, value):
        return sanitize_url(value)


class AnalyticsBeaconSerializer(serializers.Serializer):
    """
    Validates batch payload dispatched on visibilitychange / pagehide via sendBeacon.
    """
    session_id = serializers.CharField(max_length=64)
    active_seconds_delta = serializers.IntegerField(required=False, min_value=0, default=0)
    current_page = serializers.CharField(max_length=255, required=False, default='/')
    is_closing = serializers.BooleanField(required=False, default=False)
    events = AnalyticsEventSerializer(many=True, required=False, default=list)

    def validate_current_page(self, value):
        return sanitize_path(value)
