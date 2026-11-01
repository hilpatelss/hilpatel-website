from django.db import models
from apps.core.models import TimeStampedModel


class VisitorLog(TimeStampedModel):
    """
    Lightweight visitor logging model capturing visit metadata and active theme.
    Protected from public exposure and accessible exclusively via Django Admin.
    """
    THEME_CHOICES = [
        ('dark', 'Dark Mode'),
        ('light', 'Light Mode'),
        ('unknown', 'Unknown'),
    ]

    DEVICE_CHOICES = [
        ('desktop', 'Desktop'),
        ('tablet', 'Tablet'),
        ('mobile', 'Mobile'),
        ('unknown', 'Unknown'),
    ]

    path = models.CharField(
        max_length=255,
        default='/',
        db_index=True,
        help_text="Visited URL path or route"
    )
    device_category = models.CharField(
        max_length=20,
        choices=DEVICE_CHOICES,
        default='unknown',
        db_index=True,
        help_text="Detected client device category"
    )
    screen_resolution = models.CharField(
        max_length=50,
        default='unknown',
        blank=True,
        help_text="Browser-reported screen resolution (e.g. 1920x1080)"
    )
    active_theme = models.CharField(
        max_length=20,
        choices=THEME_CHOICES,
        default='unknown',
        db_index=True,
        help_text="Active website theme at time of visit (dark or light)"
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Client IP address"
    )
    user_agent = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Client User-Agent header"
    )
    referrer = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Referring URL if provided"
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Detected city name (rough location)"
    )
    region = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Detected state / region"
    )
    country = models.CharField(
        max_length=100,
        blank=True,
        default='',
        db_index=True,
        help_text="Detected country or country code"
    )
    timezone = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Client timezone (e.g. Asia/Kolkata)"
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Exact latitude if permitted and available"
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Exact longitude if permitted and available"
    )
    location_display = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Human-readable location summary (exact GPS or rough City/Region/Country/Timezone)"
    )

    class Meta:
        verbose_name = 'Visitor Log'
        verbose_name_plural = 'Visitor Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at', 'active_theme']),
            models.Index(fields=['-created_at', 'device_category']),
            models.Index(fields=['path', '-created_at']),
            models.Index(fields=['country', '-created_at']),
        ]

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {self.path} ({self.active_theme}) - {self.device_category}"


class AnalyticsSession(TimeStampedModel):
    """
    Represents an individual visitor session tracking active vs elapsed time,
    navigation journey, landing/exit pages, and device/traffic attributes.
    """
    DEVICE_CHOICES = [
        ('desktop', 'Desktop'),
        ('tablet', 'Tablet'),
        ('mobile', 'Mobile'),
        ('unknown', 'Unknown'),
    ]

    REFERRER_SOURCE_CHOICES = [
        ('direct', 'Direct / Bookmark'),
        ('search', 'Search Engine'),
        ('social', 'Social Media'),
        ('referral', 'Referral Link'),
        ('campaign', 'Marketing Campaign'),
    ]

    session_id = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="Unique client-generated or backend-generated session UUID"
    )
    visitor_id = models.CharField(
        max_length=64,
        db_index=True,
        help_text="Anonymous pseudonymous visitor identifier"
    )
    started_at = models.DateTimeField(
        db_index=True,
        help_text="UTC timestamp when the session commenced"
    )
    last_activity_at = models.DateTimeField(
        db_index=True,
        help_text="UTC timestamp of the most recent active heartbeat or interaction"
    )
    ended_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="UTC timestamp when the session was closed or timed out"
    )
    total_active_seconds = models.PositiveIntegerField(
        default=0,
        help_text="Accumulated active engagement time (tab visible and user active)"
    )
    total_elapsed_seconds = models.PositiveIntegerField(
        default=0,
        help_text="Total elapsed time from session start to last activity"
    )
    page_view_count = models.PositiveIntegerField(
        default=1,
        help_text="Total number of distinct page views recorded during this session"
    )
    landing_page = models.CharField(
        max_length=255,
        default='/',
        help_text="Initial entry URL or route"
    )
    exit_page = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Last recorded route before departure"
    )
    referrer_url = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Full external referrer URL (stripped of sensitive query parameters)"
    )
    referrer_source = models.CharField(
        max_length=50,
        choices=REFERRER_SOURCE_CHOICES,
        default='direct',
        db_index=True,
        help_text="Categorized traffic source"
    )
    utm_source = models.CharField(max_length=100, blank=True, default='')
    utm_medium = models.CharField(max_length=100, blank=True, default='')
    utm_campaign = models.CharField(max_length=100, blank=True, default='')
    device_category = models.CharField(
        max_length=20,
        choices=DEVICE_CHOICES,
        default='desktop',
        db_index=True
    )
    browser_category = models.CharField(
        max_length=50,
        default='unknown',
        db_index=True,
        help_text="Browser family (Chrome, Safari, Firefox, Edge, etc.)"
    )
    os_category = models.CharField(
        max_length=50,
        default='unknown',
        db_index=True,
        help_text="Operating system family (macOS, iOS, Windows, Android, Linux)"
    )
    screen_resolution = models.CharField(
        max_length=50,
        blank=True,
        default='unknown'
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Client IP address for geographical approximation only"
    )
    country = models.CharField(
        max_length=100,
        blank=True,
        default='',
        db_index=True
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        default=''
    )
    is_bounce = models.BooleanField(
        default=True,
        db_index=True,
        help_text="True if single page visit with under 10 seconds of active engagement"
    )

    class Meta:
        verbose_name = 'Analytics Session'
        verbose_name_plural = 'Analytics Sessions'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['-started_at', 'referrer_source']),
            models.Index(fields=['-started_at', 'device_category']),
            models.Index(fields=['visitor_id', '-started_at']),
            models.Index(fields=['country', '-started_at']),
        ]

    def __str__(self):
        return f"Session {self.session_id[:8]}... ({self.device_category}, {self.formatted_active_time()})"

    def formatted_active_time(self):
        """Returns human-friendly active engagement duration (e.g. '2m 14s')."""
        seconds = self.total_active_seconds
        if seconds < 60:
            return f"{seconds}s"
        minutes = seconds // 60
        rem_sec = seconds % 60
        if minutes < 60:
            return f"{minutes}m {rem_sec}s"
        hours = minutes // 60
        rem_min = minutes % 60
        return f"{hours}h {rem_min}m"

    def formatted_elapsed_time(self):
        """Returns human-friendly elapsed total session duration."""
        seconds = self.total_elapsed_seconds
        if seconds < 60:
            return f"{seconds}s"
        minutes = seconds // 60
        rem_sec = seconds % 60
        if minutes < 60:
            return f"{minutes}m {rem_sec}s"
        hours = minutes // 60
        rem_min = minutes % 60
        return f"{hours}h {rem_min}m"


class AnalyticsPageView(TimeStampedModel):
    """
    Detailed log of individual page or section route visits within an AnalyticsSession.
    """
    session = models.ForeignKey(
        AnalyticsSession,
        on_delete=models.CASCADE,
        related_name='page_views',
        db_index=True
    )
    page_path = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Sanitized SPA route or path (e.g. /, /#projects, /#about)"
    )
    title = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Page title"
    )
    entered_at = models.DateTimeField(
        db_index=True,
        help_text="UTC timestamp when the visitor navigated to this page"
    )
    exited_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="UTC timestamp when the visitor navigated away or ended session"
    )
    active_seconds = models.PositiveIntegerField(
        default=0,
        help_text="Active viewing duration spent on this specific page"
    )
    is_landing = models.BooleanField(
        default=False,
        help_text="Whether this page view was the session landing page"
    )
    is_exit = models.BooleanField(
        default=False,
        help_text="Whether this page view was the session exit page"
    )

    class Meta:
        verbose_name = 'Analytics Page View'
        verbose_name_plural = 'Analytics Page Views'
        ordering = ['-entered_at']
        indexes = [
            models.Index(fields=['page_path', '-entered_at']),
            models.Index(fields=['session', 'page_path']),
        ]

    def __str__(self):
        return f"{self.page_path} ({self.active_seconds}s) [Session {self.session.session_id[:8]}]"


class AnalyticsEvent(TimeStampedModel):
    """
    Captures purposeful user interactions such as button clicks, resume downloads,
    external links, social profile views, and navigation clicks.
    """
    session = models.ForeignKey(
        AnalyticsSession,
        on_delete=models.CASCADE,
        related_name='events',
        db_index=True
    )
    event_id = models.CharField(
        max_length=64,
        blank=True,
        default='',
        help_text="Client-side unique event UUID"
    )
    page_path = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Page path where the interaction occurred"
    )
    event_type = models.CharField(
        max_length=64,
        db_index=True,
        help_text="Standardized event name (e.g. project_link_clicked, resume_download_clicked)"
    )
    element_category = models.CharField(
        max_length=50,
        default='button',
        db_index=True,
        help_text="Category of element: link, button, download, nav, social, form"
    )
    element_label = models.CharField(
        max_length=255,
        default='',
        help_text="Safe human-readable label or text of the interacted element"
    )
    destination_url = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Target URL or external destination, sanitized"
    )

    class Meta:
        verbose_name = 'Analytics Event'
        verbose_name_plural = 'Analytics Events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', '-created_at']),
            models.Index(fields=['element_category', '-created_at']),
            models.Index(fields=['session', 'event_type']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.element_label} ({self.page_path})"
