from django.contrib import admin
from .models import SiteSettings, DesignSettings, NavigationItem, SectionConfig, HeroMetric

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Site Identity & Branding", {
            "fields": (
                "site_title",
                ("brand_mark_initial", "brand_mark_accent"),
                "owner_name",
                "professional_headline",
                "location",
                ("email", "phone"),
                ("profile_image", "resume_file", "favicon"),
            )
        }),
        ("Social Profiles", {
            "fields": (
                "linkedin_url",
                "github_url",
                "twitter_url",
            )
        }),
        ("Hero Section Content", {
            "fields": (
                "hero_eyebrow",
                "hero_kicker",
                "hero_headline_greeting",
                ("hero_headline_line1", "hero_headline_line2"),
                ("hero_primary_button_text", "hero_primary_button_url"),
                ("hero_secondary_button_text", "hero_secondary_button_url"),
            )
        }),
        ("About Section Content", {
            "fields": (
                "intro_text",
                "summary_text",
                "about_large_copy",
                "about_body_copy",
            )
        }),
        ("Footer Settings", {
            "fields": (
                "footer_tagline",
                "footer_copyright",
                ("footer_tech_stack", "footer_location"),
            )
        }),
        ("Contact & Availability Settings", {
            "fields": (
                "contact_enabled",
                "contact_availability_status",
                "contact_pitch",
            )
        }),
        ("SEO & Metadata", {
            "classes": ("collapse",),
            "fields": (
                "seo_meta_title",
                "seo_meta_description",
                "og_image",
                ("announcement_enabled", "announcement_text"),
            )
        }),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(DesignSettings)
class DesignSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Theme Configuration", {
            "fields": (
                "theme_name",
                "enable_animations",
                "border_radius",
            )
        }),
        ("Signature Accent Colors", {
            "fields": (
                ("accent_color", "accent2_color"),
            )
        }),
        ("Dark Mode Theme Palette", {
            "fields": (
                ("dark_bg", "dark_surface", "dark_surface2"),
                ("dark_text", "dark_muted", "dark_line"),
            )
        }),
        ("Light Mode Theme Palette", {
            "fields": (
                ("light_bg", "light_surface", "light_surface2"),
                ("light_text", "light_muted", "light_line", "light_accent"),
            )
        }),
        ("Typography", {
            "fields": (
                ("font_family_main", "font_family_mono"),
            )
        }),
    )

    def has_add_permission(self, request):
        return not DesignSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(NavigationItem)
class NavigationItemAdmin(admin.ModelAdmin):
    list_display = ('label', 'url', 'display_order', 'is_external', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('label',)
    list_filter = ('is_visible', 'is_external')
    search_fields = ('label', 'url')


@admin.register(SectionConfig)
class SectionConfigAdmin(admin.ModelAdmin):
    list_display = ('section_key', 'index_label', 'title_line1', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('section_key',)
    list_filter = ('is_visible',)
    search_fields = ('section_key', 'index_label', 'title_line1')


@admin.register(HeroMetric)
class HeroMetricAdmin(admin.ModelAdmin):
    list_display = ('text', 'icon_name', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('text',)
    search_fields = ('text',)

