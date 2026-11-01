"""
Analytics Django Admin Configuration

Registers:
- VisitorLogAdmin: Legacy visitor log model.
- AnalyticsSessionAdmin: Comprehensive session logs + custom Dashboard view.
- AnalyticsPageViewAdmin: Page dwell duration and route transition logs.
- AnalyticsEventAdmin: Interaction events (buttons, links, downloads).
All models are strictly read-only to prevent tampering.
"""
import json
from datetime import timedelta
from django.contrib import admin
from django.urls import path
from django.template.response import TemplateResponse
from django.utils import timezone
from django.db.models import Count, Avg, Sum, Q
from django.utils.html import format_html

from .models import VisitorLog, AnalyticsSession, AnalyticsPageView, AnalyticsEvent


@admin.register(VisitorLog)
class VisitorLogAdmin(admin.ModelAdmin):
    list_display = (
        'created_at',
        'location_display',
        'path',
        'active_theme',
        'device_category',
        'ip_address',
    )
    list_filter = (
        'active_theme',
        'device_category',
        'country',
        'created_at',
    )
    search_fields = (
        'path',
        'location_display',
        'city',
        'country',
        'timezone',
        'ip_address',
        'user_agent',
    )
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    readonly_fields = [f.name for f in VisitorLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(AnalyticsSession)
class AnalyticsSessionAdmin(admin.ModelAdmin):
    list_display = (
        'started_at',
        'session_id_short',
        'device_category',
        'browser_category',
        'country',
        'landing_page',
        'exit_page',
        'active_time_badge',
        'page_view_count',
        'is_bounce_badge',
    )
    list_filter = (
        'device_category',
        'browser_category',
        'os_category',
        'referrer_source',
        'is_bounce',
        'started_at',
    )
    search_fields = (
        'session_id',
        'visitor_id',
        'landing_page',
        'exit_page',
        'country',
        'city',
        'referrer_url',
    )
    ordering = ('-started_at',)
    date_hierarchy = 'started_at'
    readonly_fields = [f.name for f in AnalyticsSession._meta.fields]

    def has_add_permission(self, request):
        return False

    def session_id_short(self, obj):
        return f"{obj.session_id[:8]}..."
    session_id_short.short_description = "Session"

    def active_time_badge(self, obj):
        return format_html("<strong>{}</strong>", obj.formatted_active_time())
    active_time_badge.short_description = "Active Time"

    def is_bounce_badge(self, obj):
        if obj.is_bounce:
            return format_html("<span style='color: #dc2626;'>Yes</span>")
        return format_html("<span style='color: #16a34a; font-weight: 600;'>No</span>")
    is_bounce_badge.short_description = "Bounce"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_site.admin_view(self.dashboard_view), name='analytics_dashboard'),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['dashboard_url'] = 'dashboard/'
        return super().changelist_view(request, extra_context=extra_context)

    def dashboard_view(self, request):
        """Custom Apple-inspired analytics dashboard in Django Admin."""
        days_param = request.GET.get('days', '30d').lower()
        now = timezone.now()
        start_date = None

        if days_param == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif days_param == '7d':
            start_date = now - timedelta(days=7)
        elif days_param == '90d':
            start_date = now - timedelta(days=90)
        elif days_param == 'all':
            start_date = None
        else: # 30d default
            days_param = '30d'
            start_date = now - timedelta(days=30)

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
            avg_elapsed=Avg('total_elapsed_seconds'),
            bounces=Count('id', filter=Q(is_bounce=True))
        )
        avg_active = int(agg['avg_active'] or 0)
        avg_elapsed = int(agg['avg_elapsed'] or 0)
        bounces = agg['bounces'] or 0
        bounce_rate = round((bounces / total_sessions * 100), 1) if total_sessions > 0 else 0.0
        avg_views_per_session = round((total_page_views / total_sessions), 1) if total_sessions > 0 else 0.0

        def fmt_time(seconds):
            if seconds < 60:
                return f"{seconds}s"
            m, s = divmod(seconds, 60)
            return f"{m}m {s}s"

        # Device Breakdown
        devices = list(sessions_qs.values('device_category').annotate(count=Count('id')).order_by('-count'))
        device_labels = [d['device_category'].title() for d in devices]
        device_counts = [d['count'] for d in devices]

        # Top Pages
        top_pages = list(views_qs.values('page_path').annotate(
            views=Count('id'),
            avg_dwell=Avg('active_seconds')
        ).order_by('-views')[:8])

        # Referrers
        referrers = list(sessions_qs.values('referrer_source').annotate(count=Count('id')).order_by('-count'))

        # Top Events
        top_events = list(events_qs.values('event_type', 'element_label').annotate(count=Count('id')).order_by('-count')[:8])

        # Trend Data (last 14 days)
        trend_days = 14
        trend_labels = []
        trend_sessions = []
        trend_views = []
        for i in range(trend_days - 1, -1, -1):
            d_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            d_end = d_start + timedelta(days=1)
            trend_labels.append(d_start.strftime('%b %d'))
            trend_sessions.append(AnalyticsSession.objects.filter(started_at__gte=d_start, started_at__lt=d_end).count())
            trend_views.append(AnalyticsPageView.objects.filter(entered_at__gte=d_start, entered_at__lt=d_end).count())

        recent_sessions = sessions_qs.order_by('-started_at')[:25]

        context = {
            **self.admin_site.each_context(request),
            'title': 'Visitor Analytics Dashboard',
            'current_days': days_param,
            'total_sessions': total_sessions,
            'unique_visitors': unique_visitors,
            'total_page_views': total_page_views,
            'total_events': total_events,
            'formatted_avg_active': fmt_time(avg_active),
            'formatted_avg_elapsed': fmt_time(avg_elapsed),
            'bounce_rate': bounce_rate,
            'avg_views_per_session': avg_views_per_session,
            'top_pages': top_pages,
            'referrers': referrers,
            'top_events': top_events,
            'recent_sessions': recent_sessions,
            'trend_labels_json': json.dumps(trend_labels),
            'trend_sessions_json': json.dumps(trend_sessions),
            'trend_views_json': json.dumps(trend_views),
            'device_labels_json': json.dumps(device_labels),
            'device_counts_json': json.dumps(device_counts),
        }
        return TemplateResponse(request, 'admin/analytics/dashboard.html', context)


@admin.register(AnalyticsPageView)
class AnalyticsPageViewAdmin(admin.ModelAdmin):
    list_display = ('entered_at', 'page_path', 'active_seconds', 'is_landing', 'is_exit', 'session')
    list_filter = ('is_landing', 'is_exit', 'entered_at')
    search_fields = ('page_path', 'title', 'session__session_id')
    ordering = ('-entered_at',)
    date_hierarchy = 'entered_at'
    readonly_fields = [f.name for f in AnalyticsPageView._meta.fields]

    def has_add_permission(self, request):
        return False


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'event_type', 'element_label', 'element_category', 'page_path', 'destination_url')
    list_filter = ('event_type', 'element_category', 'created_at')
    search_fields = ('event_type', 'element_label', 'destination_url', 'page_path', 'session__session_id')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    readonly_fields = [f.name for f in AnalyticsEvent._meta.fields]

    def has_add_permission(self, request):
        return False
