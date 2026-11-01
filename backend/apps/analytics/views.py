"""
Analytics Views

Provides:
1. Public Telemetry Ingestion Endpoints (rate-limited, isolated, failure-safe):
   - VisitorLogView: Legacy backward-compatible endpoint.
   - SessionTrackingView: Session start, heartbeat, and active duration updates.
   - PageViewTrackingView: Route navigation transitions and page dwell duration.
   - EventTrackingView: Button, link, download, and CTA click tracking.
   - BeaconFlushView: Unload/tab-hidden sendBeacon batch flush.
2. Staff-Only Admin Dashboard API:
   - AdminAnalyticsDataView: Aggregated metrics, timeseries, and distributions.
"""
import logging
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Avg, Sum, Q
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.throttling import ScopedRateThrottle

from .models import VisitorLog, AnalyticsSession, AnalyticsPageView, AnalyticsEvent
from .serializers import (
    VisitorLogSerializer,
    AnalyticsSessionSerializer,
    AnalyticsPageViewSerializer,
    AnalyticsEventSerializer,
    AnalyticsBeaconSerializer,
)
from .utils import get_client_ip, parse_user_agent, classify_referrer, sanitize_path

logger = logging.getLogger(__name__)


def extract_location_metadata(request):
    """Extracts country, city, and timezone from CDN/Cloudflare headers."""
    cf_country = (request.META.get('HTTP_CF_IPCOUNTRY') or '').strip()
    cf_city = (request.META.get('HTTP_CF_IPCITY') or '').strip()
    return {
        'country': cf_country[:100],
        'city': cf_city[:100],
    }


class VisitorLogView(APIView):
    """
    Dedicated endpoint for recording anonymous, lightweight visitor logs.
    Rate-limited and fully isolated from core portfolio operations.
    """
    permission_classes = [AllowAny]
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


class SessionTrackingView(APIView):
    """
    Initiates or updates an AnalyticsSession with active duration heartbeat.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'analytics_ingest'

    def post(self, request, *args, **kwargs):
        serializer = AnalyticsSessionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid payload", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        session_id = data['session_id']
        visitor_id = data['visitor_id']
        now = timezone.now()

        try:
            session, created = AnalyticsSession.objects.get_or_create(
                session_id=session_id,
                defaults={
                    'visitor_id': visitor_id,
                    'started_at': now,
                    'last_activity_at': now,
                    'landing_page': data.get('landing_page', '/'),
                    'exit_page': data.get('current_page', '/'),
                    'total_active_seconds': data.get('total_active_seconds', 0) or data.get('active_seconds_delta', 0),
                    'total_elapsed_seconds': 0,
                    'page_view_count': 1,
                    'is_bounce': True,
                    'utm_source': data.get('utm_source', '')[:100],
                    'utm_medium': data.get('utm_medium', '')[:100],
                    'utm_campaign': data.get('utm_campaign', '')[:100],
                    'screen_resolution': data.get('screen_resolution', 'unknown')[:50],
                }
            )

            if created:
                raw_ua = request.META.get('HTTP_USER_AGENT', '')
                ua_info = parse_user_agent(raw_ua)
                session.device_category = data.get('device_category') or ua_info['device_category']
                session.browser_category = data.get('browser_category') or ua_info['browser_category']
                session.os_category = data.get('os_category') or ua_info['os_category']
                
                host = request.get_host()
                ref_source, clean_ref = classify_referrer(data.get('referrer', ''), host)
                # Check campaign tags
                if data.get('utm_source') or data.get('utm_campaign'):
                    ref_source = 'campaign'
                session.referrer_source = ref_source
                session.referrer_url = clean_ref[:500]

                loc = extract_location_metadata(request)
                session.country = loc['country']
                session.city = loc['city']
                ip = get_client_ip(request)
                if ip:
                    session.ip_address = ip

                session.save()

                # Also create the initial landing page view
                AnalyticsPageView.objects.create(
                    session=session,
                    page_path=session.landing_page,
                    entered_at=now,
                    is_landing=True,
                    is_exit=True
                )
            else:
                # Update existing session heartbeat
                delta = data.get('active_seconds_delta', 0)
                if delta > 0:
                    session.total_active_seconds += delta
                elif data.get('total_active_seconds', 0) > session.total_active_seconds:
                    session.total_active_seconds = data.get('total_active_seconds')

                session.last_activity_at = now
                session.total_elapsed_seconds = max(0, int((now - session.started_at).total_seconds()))
                current_page = data.get('current_page')
                if current_page:
                    session.exit_page = current_page

                # If active engagement is > 10s or visited > 1 page, no longer a bounce
                if session.total_active_seconds >= 10 or session.page_view_count > 1:
                    session.is_bounce = False

                session.save(update_fields=[
                    'total_active_seconds', 'total_elapsed_seconds', 'last_activity_at',
                    'exit_page', 'is_bounce'
                ])

            return Response({"status": "success", "session_id": session_id}, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.error(f"Error handling session tracking: {exc}")
            return Response({"status": "error", "message": "Failed to track session"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PageViewTrackingView(APIView):
    """
    Records page view transitions and page-specific active duration.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'analytics_ingest'

    def post(self, request, *args, **kwargs):
        serializer = AnalyticsPageViewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid payload", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        session_id = data['session_id']
        page_path = data['page_path']
        now = timezone.now()

        try:
            try:
                session = AnalyticsSession.objects.get(session_id=session_id)
            except AnalyticsSession.DoesNotExist:
                return Response({"status": "session_not_found"}, status=status.HTTP_404_NOT_FOUND)

            # Mark prior page views as not exit
            session.page_views.filter(is_exit=True).update(is_exit=False, exited_at=now)

            # Record or update current pageview
            pv, created = AnalyticsPageView.objects.get_or_create(
                session=session,
                page_path=page_path,
                defaults={
                    'entered_at': now,
                    'title': data.get('title', '')[:255],
                    'is_landing': False,
                    'is_exit': True,
                    'active_seconds': data.get('active_seconds_delta', 0)
                }
            )

            if not created:
                delta = data.get('active_seconds_delta', 0)
                if delta > 0:
                    pv.active_seconds += delta
                pv.is_exit = True
                pv.save(update_fields=['active_seconds', 'is_exit'])

            # Update session aggregates
            session.exit_page = page_path
            session.last_activity_at = now
            session.page_view_count = session.page_views.count()
            if session.page_view_count > 1 or session.total_active_seconds >= 10:
                session.is_bounce = False
            session.save(update_fields=['exit_page', 'last_activity_at', 'page_view_count', 'is_bounce'])

            return Response({"status": "recorded", "page_path": page_path}, status=status.HTTP_201_CREATED)
        except Exception as exc:
            logger.error(f"Error handling page view: {exc}")
            return Response({"status": "error", "message": "Failed to track page view"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventTrackingView(APIView):
    """
    Records clicked links, buttons, resume downloads, and CTAs.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'analytics_ingest'

    def post(self, request, *args, **kwargs):
        serializer = AnalyticsEventSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid payload", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        session_id = data['session_id']
        now = timezone.now()

        try:
            try:
                session = AnalyticsSession.objects.get(session_id=session_id)
            except AnalyticsSession.DoesNotExist:
                # Create minimal placeholder session if client sent event before session init resolved
                raw_ua = request.META.get('HTTP_USER_AGENT', '')
                ua_info = parse_user_agent(raw_ua)
                session = AnalyticsSession.objects.create(
                    session_id=session_id,
                    visitor_id=session_id,
                    started_at=now,
                    last_activity_at=now,
                    landing_page=data.get('page_path', '/'),
                    exit_page=data.get('page_path', '/'),
                    device_category=ua_info['device_category'],
                    browser_category=ua_info['browser_category'],
                    os_category=ua_info['os_category'],
                    is_bounce=False
                )

            AnalyticsEvent.objects.create(
                session=session,
                event_id=data.get('event_id', '')[:64],
                page_path=data.get('page_path', '/')[:255],
                event_type=data['event_type'][:64],
                element_category=data.get('element_category', 'button')[:50],
                element_label=data.get('element_label', '')[:255],
                destination_url=data.get('destination_url', '')[:500],
                created_at=now
            )

            # An explicit action proves engagement - mark is_bounce = False
            session.is_bounce = False
            session.last_activity_at = now
            session.save(update_fields=['is_bounce', 'last_activity_at'])

            return Response({"status": "recorded", "event_type": data['event_type']}, status=status.HTTP_201_CREATED)
        except Exception as exc:
            logger.error(f"Error handling event tracking: {exc}")
            return Response({"status": "error", "message": "Failed to track event"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BeaconFlushView(APIView):
    """
    Endpoint for navigator.sendBeacon or keepalive fetch requests on tab unload/hide.
    Flushes pending active seconds and optional queued events.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'analytics_ingest'

    def post(self, request, *args, **kwargs):
        serializer = AnalyticsBeaconSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid payload", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        session_id = data['session_id']
        delta = data.get('active_seconds_delta', 0)
        is_closing = data.get('is_closing', False)
        now = timezone.now()

        try:
            session = AnalyticsSession.objects.filter(session_id=session_id).first()
            if session:
                if delta > 0:
                    session.total_active_seconds += delta
                session.last_activity_at = now
                session.total_elapsed_seconds = max(0, int((now - session.started_at).total_seconds()))
                if data.get('current_page'):
                    session.exit_page = data.get('current_page')
                if is_closing:
                    session.ended_at = now
                if session.total_active_seconds >= 10 or session.page_view_count > 1:
                    session.is_bounce = False
                
                session.save(update_fields=[
                    'total_active_seconds', 'total_elapsed_seconds',
                    'last_activity_at', 'exit_page', 'ended_at', 'is_bounce'
                ])

                # Process batch events if attached
                events_data = data.get('events', [])
                for ev in events_data:
                    AnalyticsEvent.objects.create(
                        session=session,
                        event_id=ev.get('event_id', '')[:64],
                        page_path=ev.get('page_path', '/')[:255],
                        event_type=ev['event_type'][:64],
                        element_category=ev.get('element_category', 'button')[:50],
                        element_label=ev.get('element_label', '')[:255],
                        destination_url=ev.get('destination_url', '')[:500],
                        created_at=now
                    )

            return Response({"status": "flushed"}, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.error(f"Error handling beacon flush: {exc}")
            return Response({"status": "error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminAnalyticsDashboardDataView(APIView):
    """
    Staff-only API providing aggregated metric cards, timeseries charts,
    and distribution breakdowns for the analytics dashboard.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        # 1. Parse time period filter: 'today', '7d', '30d', '90d', 'all'
        days_param = request.GET.get('days', '30').lower()
        now = timezone.now()
        start_date = None

        if days_param == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif days_param == '7d' or days_param == '7':
            start_date = now - timedelta(days=7)
        elif days_param == '30d' or days_param == '30':
            start_date = now - timedelta(days=30)
        elif days_param == '90d' or days_param == '90':
            start_date = now - timedelta(days=90)
        elif days_param == 'all':
            start_date = None
        else:
            try:
                days_int = int(days_param)
                start_date = now - timedelta(days=days_int)
            except ValueError:
                start_date = now - timedelta(days=30)

        # Base querysets
        sessions_qs = AnalyticsSession.objects.all()
        views_qs = AnalyticsPageView.objects.all()
        events_qs = AnalyticsEvent.objects.all()

        if start_date:
            sessions_qs = sessions_qs.filter(started_at__gte=start_date)
            views_qs = views_qs.filter(entered_at__gte=start_date)
            events_qs = events_qs.filter(created_at__gte=start_date)

        total_sessions = sessions_qs.count()
        unique_visitors = sessions_qs.values('visitor_id').distinct().count()
        total_page_views = views_qs.count()
        total_events = events_qs.count()

        agg = sessions_qs.aggregate(
            avg_active=Avg('total_active_seconds'),
            total_active=Sum('total_active_seconds'),
            avg_elapsed=Avg('total_elapsed_seconds'),
            bounces=Count('id', filter=Q(is_bounce=True))
        )
        avg_active_sec = round(agg['avg_active'] or 0, 1)
        avg_elapsed_sec = round(agg['avg_elapsed'] or 0, 1)
        total_active_sec = agg['total_active'] or 0
        bounces_count = agg['bounces'] or 0
        bounce_rate = round((bounces_count / total_sessions * 100), 1) if total_sessions > 0 else 0.0

        # Device Breakdown
        devices = sessions_qs.values('device_category').annotate(count=Count('id')).order_by('-count')
        device_breakdown = {d['device_category']: d['count'] for d in devices}

        # Browser Breakdown
        browsers = list(sessions_qs.values('browser_category').annotate(count=Count('id')).order_by('-count')[:6])

        # Referrer Breakdown
        referrers = list(sessions_qs.values('referrer_source').annotate(count=Count('id')).order_by('-count'))

        # Top Pages
        top_pages = list(views_qs.values('page_path').annotate(
            views=Count('id'),
            avg_dwell=Avg('active_seconds')
        ).order_by('-views')[:8])
        for p in top_pages:
            p['avg_dwell'] = round(p['avg_dwell'] or 0, 1)

        # Top Events
        top_events = list(events_qs.values('event_type', 'element_label').annotate(
            count=Count('id')
        ).order_by('-count')[:10])

        # Daily Trend (last 14 days or chosen period, up to 30 days)
        trend_days = 14 if days_param in ('7d', '7', 'today') else 30
        daily_trend = []
        for i in range(trend_days - 1, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            day_sessions = AnalyticsSession.objects.filter(started_at__gte=day_start, started_at__lt=day_end).count()
            day_views = AnalyticsPageView.objects.filter(entered_at__gte=day_start, entered_at__lt=day_end).count()
            daily_trend.append({
                'date': day_start.strftime('%b %d'),
                'sessions': day_sessions,
                'views': day_views,
            })

        # Recent 25 Sessions
        recent = []
        for s in sessions_qs[:25]:
            recent.append({
                'session_id': s.session_id,
                'started_at': s.started_at.strftime('%Y-%m-%d %H:%M:%S'),
                'device': s.device_category,
                'browser': s.browser_category,
                'os': s.os_category,
                'country': s.country or 'Unknown',
                'landing_page': s.landing_page,
                'exit_page': s.exit_page or s.landing_page,
                'active_time': s.formatted_active_time(),
                'elapsed_time': s.formatted_elapsed_time(),
                'page_views': s.page_view_count,
                'is_bounce': s.is_bounce,
                'referrer_source': s.referrer_source,
            })

        return Response({
            'period': days_param,
            'summary': {
                'total_sessions': total_sessions,
                'unique_visitors': unique_visitors,
                'total_page_views': total_page_views,
                'avg_active_seconds': avg_active_sec,
                'avg_elapsed_seconds': avg_elapsed_sec,
                'total_active_seconds': total_active_sec,
                'bounce_rate': bounce_rate,
                'total_events': total_events,
            },
            'device_breakdown': device_breakdown,
            'browser_breakdown': browsers,
            'referrer_breakdown': referrers,
            'top_pages': top_pages,
            'top_events': top_events,
            'daily_trend': daily_trend,
            'recent_sessions': recent,
        }, status=status.HTTP_200_OK)
