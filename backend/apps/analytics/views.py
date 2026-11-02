"""
Analytics Views

Provides:
- VisitorLogView: Dedicated endpoint for recording anonymous, lightweight visitor logs.
"""
import logging
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle

from .models import VisitorLog
from .serializers import VisitorLogSerializer
from .utils import get_client_ip, parse_user_agent

logger = logging.getLogger(__name__)


class VisitorLogView(APIView):
    """
    Dedicated endpoint for recording anonymous, lightweight visitor logs.
    Rate-limited, CORS-friendly, and fully isolated from core portfolio operations.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'visitor_log'

    def post(self, request, *args, **kwargs):
        is_logging_enabled = getattr(settings, 'ENABLE_VISITOR_LOGGING', True)
        if not is_logging_enabled:
            return Response(
                {"status": "disabled", "message": "Visitor logging is currently disabled."},
                status=status.HTTP_200_OK
            )

        serializer = VisitorLogSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation error", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ip = get_client_ip(request)
            raw_ua = request.META.get('HTTP_USER_AGENT', '')
            user_agent = raw_ua[:500] if raw_ua else ''

            ua_info = parse_user_agent(user_agent)
            device = serializer.validated_data.get('device_category', 'unknown')
            if device == 'unknown':
                device = ua_info['device_category']

            cf_city = (request.META.get('HTTP_CF_IPCITY') or '').strip()
            cf_region = (request.META.get('HTTP_CF_REGION') or '').strip()
            cf_country = (request.META.get('HTTP_CF_IPCOUNTRY') or '').strip()
            cf_timezone = (request.META.get('HTTP_CF_TIMEZONE') or '').strip()

            city = (serializer.validated_data.get('city') or cf_city)[:100]
            region = (serializer.validated_data.get('region') or cf_region)[:100]
            country = (serializer.validated_data.get('country') or cf_country)[:100]
            timezone_val = (serializer.validated_data.get('timezone') or cf_timezone)[:100]
            latitude = serializer.validated_data.get('latitude')
            longitude = serializer.validated_data.get('longitude')

            loc_parts = [p for p in [city, region, country] if p]
            rough_loc = ", ".join(loc_parts)

            if latitude is not None and longitude is not None:
                if rough_loc:
                    location_display = f"{rough_loc} (GPS: {float(latitude):.4f}, {float(longitude):.4f})"[:255]
                else:
                    location_display = f"GPS: {float(latitude):.4f}, {float(longitude):.4f}"[:255]
            elif rough_loc:
                location_display = rough_loc[:255]
            elif timezone_val:
                location_display = timezone_val[:255]
            else:
                location_display = "Unknown"

            serializer.save(
                ip_address=ip or None,
                user_agent=user_agent,
                device_category=device,
                city=city,
                region=region,
                country=country,
                timezone=timezone_val,
                latitude=latitude,
                longitude=longitude,
                location_display=location_display,
            )
            return Response({"status": "logged"}, status=status.HTTP_201_CREATED)
        except Exception as exc:
            logger.warning(f"Failed to save visitor log record: {exc}")
            return Response(
                {"error": "Unable to save visitor log record."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
