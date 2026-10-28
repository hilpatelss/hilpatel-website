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

    class Meta:
        verbose_name = 'Visitor Log'
        verbose_name_plural = 'Visitor Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at', 'active_theme']),
            models.Index(fields=['-created_at', 'device_category']),
            models.Index(fields=['path', '-created_at']),
        ]

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {self.path} ({self.active_theme}) - {self.device_category}"

