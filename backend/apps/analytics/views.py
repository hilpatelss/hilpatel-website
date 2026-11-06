"""
==============================================================================
Visitor Analytics API Views (views.py)
==============================================================================

WHAT IS THIS FILE?
This file handles incoming web requests from visitors who load hilpatel.site.
When a visitor views the website, their browser sends a quick background ping
to this view (`VisitorLogView`).

WHY DOES THIS EXIST?
Hil wants to understand his audience (e.g. "Did recruiters from Toronto visit
my site on a MacBook, or did someone from New York visit on an iPhone?").
This file captures that anonymous information safely without collecting
passwords, names, or intrusive tracking cookies.

SAFETY & PERFORMANCE CONTROLS:
1. Throttled (`ScopedRateThrottle`): Prevents bots or spam scripts from spamming the database.
2. Isolated: If this log fails for any reason, it NEVER breaks the main portfolio website.
3. Feature Flag (`ENABLE_VISITOR_LOGGING`): Can be toggled on/off instantly from settings.
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
    Dedicated HTTP endpoint for recording anonymous, lightweight visitor logs.
    
    HOW IT WORKS:
    - Anyone is allowed to send a log (`AllowAny`), since visitors aren't logged in.
    - No login cookies or session authentication are required (`authentication_classes = []`).
    - Throttled via `visitor_log` scope in Django settings to reject automated spam.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'visitor_log'

    def post(self, request, *args, **kwargs):
        """
        Receives an HTTP POST request containing visitor data (page path, screen width,
        approximate location, theme, etc.) and saves it to the database.
        """
        # Step 1: Check if visitor logging is turned on in settings.
        # If disabled (e.g., during testing or maintenance), gracefully return 200 OK without saving.
        is_logging_enabled = getattr(settings, 'ENABLE_VISITOR_LOGGING', True)
        if not is_logging_enabled:
            return Response(
                {"status": "disabled", "message": "Visitor logging is currently disabled."},
                status=status.HTTP_200_OK
            )

        # Step 2: Validate the incoming data from the frontend against our serializer rules.
        serializer = VisitorLogSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation error", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Step 3: Extract the visitor's public IP address safely (handling proxies / Cloudflare headers).
            ip = get_client_ip(request)
            
            # Step 4: Extract the browser's User-Agent string (e.g. Chrome on Windows, Safari on iPhone).
            raw_ua = request.META.get('HTTP_USER_AGENT', '')
            user_agent = raw_ua[:500] if raw_ua else ''

            # Parse user agent to deduce device category if frontend didn't supply one
            ua_info = parse_user_agent(user_agent)
            device = serializer.validated_data.get('device_category', 'unknown')
            if device == 'unknown':
                device = ua_info['device_category']

            # Step 5: Read geolocation headers provided automatically by Cloudflare proxy edge servers
            cf_city = (request.META.get('HTTP_CF_IPCITY') or '').strip()
            cf_region = (request.META.get('HTTP_CF_REGION') or '').strip()
            cf_country = (request.META.get('HTTP_CF_IPCOUNTRY') or '').strip()
            cf_timezone = (request.META.get('HTTP_CF_TIMEZONE') or '').strip()

            # Prefer frontend-provided data, fallback to Cloudflare edge server headers
            city = (serializer.validated_data.get('city') or cf_city)[:100]
            region = (serializer.validated_data.get('region') or cf_region)[:100]
            country = (serializer.validated_data.get('country') or cf_country)[:100]
            timezone_val = (serializer.validated_data.get('timezone') or cf_timezone)[:100]
            latitude = serializer.validated_data.get('latitude')
            longitude = serializer.validated_data.get('longitude')

            # Assemble readable location label (e.g., "Toronto, Ontario, Canada")
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

            # Step 6: Save the verified visitor log into the PostgreSQL / SQLite database
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
            # If an unexpected database or parsing error occurs, log it for admin review
            # and return 500 without crashing the server.
            logger.warning(f"Failed to save visitor log record: {exc}")
            return Response(
                {"error": "Unable to save visitor log record."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
