"""
==============================================================================
Analytics Django Admin Dashboard (admin.py)
==============================================================================

WHAT IS THIS FILE?
This file controls how visitor analytics are presented inside the secure Django
Admin panel (`/admin/analytics/visitorlog/`).

KEY FEATURES & SECURITY:
1. Quick Overview: Shows timestamp, location, path, theme, and device category at a glance.
2. Filtering & Search: Hil can filter logs by country, device (mobile/desktop), theme (dark/light), or date.
3. Read-Only Protection:
   - Nobody can manually forge or add a fake visitor log via admin (`has_add_permission -> False`).
   - All fields are marked read-only so past logs cannot be altered.
   - Only superusers have permission to delete logs (e.g. for maintenance or compliance).
"""
from django.contrib import admin
from .models import VisitorLog


@admin.register(VisitorLog)
class VisitorLogAdmin(admin.ModelAdmin):
    # Columns shown in the admin table
    list_display = (
        'created_at',
        'location_display',
        'path',
        'active_theme',
        'device_category',
        'ip_address',
    )
    # Sidebar filter options
    list_filter = (
        'active_theme',
        'device_category',
        'country',
        'created_at',
    )
    # Search box functionality
    search_fields = (
        'path',
        'location_display',
        'city',
        'country',
        'timezone',
        'ip_address',
        'user_agent',
    )
    # Show newest visits at the top
    ordering = ('-created_at',)
    # Date navigation bar across the top (Year > Month > Day)
    date_hierarchy = 'created_at'
    # Lock all fields from being edited
    readonly_fields = [f.name for f in VisitorLog._meta.fields]

    def has_add_permission(self, request):
        """Disallow creating fake log entries by hand."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Only allow superusers to delete log records."""
        return request.user.is_superuser
