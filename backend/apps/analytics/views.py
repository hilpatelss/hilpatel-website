import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings
from .serializers import VisitorLogSerializer

logger = logging.getLogger(__name__)

def get_client_ip(request):
    """Safely extracts the client IP address from proxy headers or remote addr."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
        if ip:
            return ip
    return request.META.get('REMOTE_ADDR')

def fallback_device_detection(user_agent):
    """Fallback device classification based on User-Agent string."""
    ua = (user_agent or '').lower()
    if any(k in ua for k in ['ipad', 'tablet', 'playbook', 'silk']):
        return 'tablet'
    if any(k in ua for k in ['mobile', 'iphone', 'android', 'phone', 'ipod']):
        return 'mobile'
    return 'desktop'

class VisitorLogView(APIView):
    """
    Dedicated endpoint for recording anonymous, lightweight visitor logs.
    Rate-limited and fully isolated from core portfolio operations.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'visitor_log'

    def post(self, request, *args, **kwargs):
        # 1. Check if visitor logging is enabled in settings
        is_logging_enabled = getattr(settings, 'ENABLE_VISITOR_LOGGING', True)
        if not is_logging_enabled:
            return Response(
                {"status": "disabled", "message": "Visitor logging is currently disabled."},
                status=status.HTTP_200_OK
            )

        # 2. Validate payload safely
        serializer = VisitorLogSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation error", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Extract client network metadata safely
        try:
            ip = get_client_ip(request)
            raw_ua = request.META.get('HTTP_USER_AGENT', '')
            user_agent = raw_ua[:500] if raw_ua else ''

            # If device category is unknown, attempt heuristic fallback
            device = serializer.validated_data.get('device_category', 'unknown')
            if device == 'unknown' and user_agent:
                device = fallback_device_detection(user_agent)

            serializer.save(
                ip_address=ip,
                user_agent=user_agent,
                device_category=device,
            )
            return Response({"status": "logged"}, status=status.HTTP_201_CREATED)
        except Exception as exc:
            logger.warning(f"Failed to save visitor log record: {exc}")
            return Response(
                {"error": "Unable to save visitor log record."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

