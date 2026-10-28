from django.contrib import admin
from .models import VisitorLog

@admin.register(VisitorLog)
class VisitorLogAdmin(admin.ModelAdmin):
    list_display = (
        'created_at',
        'path',
        'active_theme',
        'device_category',
        'screen_resolution',
        'ip_address',
    )
    list_filter = (
        'active_theme',
        'device_category',
        'created_at',
    )
    search_fields = (
        'path',
        'ip_address',
        'user_agent',
    )
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    readonly_fields = (
        'created_at',
        'updated_at',
        'path',
        'device_category',
        'screen_resolution',
        'active_theme',
        'ip_address',
        'user_agent',
        'referrer',
    )

    def has_add_permission(self, request):
        # Visitor logs are recorded via the client API, not manually added
        return False

