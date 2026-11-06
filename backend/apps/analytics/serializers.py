"""
==============================================================================
Analytics Serializers (serializers.py)
==============================================================================

WHAT IS THIS FILE?
In Django REST Framework, a "Serializer" acts as a data translator and security
inspector. When the React frontend sends JSON data over the internet, the serializer:
1. Validates: Checks that data matches the expected types, formats, and character limits.
2. Sanitizes: Cleans up whitespace and replaces unexpected values with safe defaults.
3. Converts: Turns clean JSON data into a Python dictionary ready for database insertion.
"""
from rest_framework import serializers
from .models import VisitorLog


class VisitorLogSerializer(serializers.ModelSerializer):
    """
    Serializes and validates incoming anonymous visitor records.
    
    All fields are marked as optional (`required=False`) with sensible defaults
    so that if a privacy-focused browser or ad-blocker strips certain fields,
    the request still succeeds cleanly without error.
    """
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
        # The exact list of fields accepted from the frontend payload
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
        """Ensures the visited web path starts with a slash and is trimmed to safe length."""
        cleaned = str(value or '/').strip()[:255]
        return cleaned or '/'

    def validate_active_theme(self, value):
        """Only permits 'dark' or 'light'; anything else defaults safely to 'unknown'."""
        if not value:
            return 'unknown'
        val = str(value).strip().lower()
        if val in ('dark', 'light'):
            return val
        return 'unknown'

    def validate_device_category(self, value):
        """Restricts device category to known values: 'desktop', 'tablet', or 'mobile'."""
        if not value:
            return 'unknown'
        val = str(value).strip().lower()
        if val in ('desktop', 'tablet', 'mobile'):
            return val
        return 'unknown'

    def validate_screen_resolution(self, value):
        """Sanitizes screen size string (e.g. '1920x1080') to under 50 characters."""
        if not value:
            return 'unknown'
        cleaned = str(value).strip()[:50]
        return cleaned or 'unknown'

    def validate_referrer(self, value):
        """Sanitizes referring website URL (e.g. 'https://linkedin.com') up to 500 characters."""
        if not value:
            return ''
        return str(value).strip()[:500]
