from rest_framework import serializers
from .models import SiteSettings, DesignSettings, NavigationItem, SectionConfig, HeroMetric

class SiteSettingsSerializer(serializers.ModelSerializer):
    resume_download_url = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            'site_title',
            'brand_mark_initial',
            'brand_mark_accent',
            'owner_name',
            'professional_headline',
            'location',
            'email',
            'phone',
            'linkedin_url',
            'github_url',
            'twitter_url',
            'hero_eyebrow',
            'hero_kicker',
            'hero_headline_greeting',
            'hero_headline_line1',
            'hero_headline_line2',
            'hero_primary_button_text',
            'hero_primary_button_url',
            'hero_secondary_button_text',
            'hero_secondary_button_url',
            'intro_text',
            'summary_text',
            'about_large_copy',
            'about_body_copy',
            'resume_download_url',
            'profile_image_url',
            'favicon_url',
            'footer_tagline',
            'footer_copyright',
            'footer_tech_stack',
            'footer_location',
            'contact_enabled',
            'contact_availability_status',
            'contact_pitch',
            'announcement_enabled',
            'announcement_text',
            'seo_meta_title',
            'seo_meta_description',
        ]

    def get_resume_download_url(self, obj):
        if obj.resume_file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.resume_file.url) if request else obj.resume_file.url
        return "/resume.pdf"

    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url
        return None

    def get_favicon_url(self, obj):
        if obj.favicon:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.favicon.url) if request else obj.favicon.url
        return None


class DesignSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignSettings
        fields = [
            'theme_name',
            'accent_color',
            'accent2_color',
            'dark_bg',
            'dark_surface',
            'dark_surface2',
            'dark_text',
            'dark_muted',
            'dark_line',
            'light_bg',
            'light_surface',
            'light_surface2',
            'light_text',
            'light_muted',
            'light_line',
            'light_accent',
            'font_family_main',
            'font_family_mono',
            'border_radius',
            'enable_animations',
        ]


class NavigationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavigationItem
        fields = ['id', 'label', 'url', 'is_external', 'display_order']


class SectionConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionConfig
        fields = [
            'id',
            'section_key',
            'index_label',
            'title_line1',
            'title_line2',
            'heading_note',
            'display_order',
            'is_visible',
        ]


class HeroMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroMetric
        fields = ['id', 'icon_name', 'text', 'display_order']

