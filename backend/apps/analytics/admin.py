"""
Analytics Django Admin Configuration

Registers:
- VisitorLogAdmin: Read-only audit log for incoming portfolio visits.
"""
from django.contrib import admin
from .models import VisitorLog


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
