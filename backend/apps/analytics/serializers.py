from rest_framework import serializers
from .models import VisitorLog

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
