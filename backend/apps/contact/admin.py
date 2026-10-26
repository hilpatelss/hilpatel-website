from django.contrib import admin
from django.utils.html import format_html
from .models import ContactMessage

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'name', 'email', 'status_badge', 'is_read')
    list_filter = ('status', 'is_read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message', 'admin_notes')
    readonly_fields = ('created_at', 'updated_at', 'name', 'email', 'subject', 'message', 'ip_address', 'user_agent')
    actions = ['mark_as_read', 'mark_as_in_progress', 'mark_as_responded', 'mark_as_spam']

    fieldsets = (
        ("Sender & Message Details", {
            "fields": (
                ("created_at", "is_read"),
                ("name", "email"),
                "subject",
                "message",
            )
        }),
        ("Processing & Notes", {
            "fields": (
                "status",
                "admin_notes",
            )
        }),
        ("Technical & Security Trace", {
            "classes": ("collapse",),
            "fields": (
                ("ip_address", "user_agent"),
                "updated_at",
            )
        }),
    )

    def status_badge(self, obj):
        colors = {
            'new': '#c7ff5e',
            'in_progress': '#e9c36c',
            'responded': '#8de0b7',
            'spam': '#ed7b70',
        }
        color = colors.get(obj.status, '#9299a8')
        text_color = '#11141c' if obj.status in ('new', 'responded', 'in_progress') else '#ffffff'
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 3px 8px; font-weight: bold; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            text_color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"

    @admin.action(description="Mark selected messages as Read")
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)

    @admin.action(description="Mark selected messages as In Progress")
    def mark_as_in_progress(self, request, queryset):
        queryset.update(status='in_progress', is_read=True)

    @admin.action(description="Mark selected messages as Responded")
    def mark_as_responded(self, request, queryset):
        queryset.update(status='responded', is_read=True)

    @admin.action(description="Mark selected messages as Spam")
    def mark_as_spam(self, request, queryset):
        queryset.update(status='spam')

    def has_add_permission(self, request):
        # Submissions should come from frontend contact API
        return False

