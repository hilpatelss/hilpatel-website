"""
==============================================================================
Portfolio Content Django Admin Interface (apps/portfolio/admin.py)
==============================================================================

WHAT IS THIS FILE?
Configures the Django Admin screens for portfolio items:
- Ticker keywords
- About statistics cards
- Skill categories & inline skill tools (allows adding tools directly inside categories!)
- Education timeline entries
- Certifications & verification links (displays green checkmark if URL is present)
- Achievements and outcomes
"""

from django.contrib import admin
from .models import (
    TickerItem,
    AboutStat,
    SkillCategory,
    Skill,
    Education,
    CertificationCategory,
    Certification,
    Achievement,
)

@admin.register(TickerItem)
class TickerItemAdmin(admin.ModelAdmin):
    """Admin interface for marquee ribbon keywords."""
    list_display = ('text', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('text',)
    search_fields = ('text',)


@admin.register(AboutStat)
class AboutStatAdmin(admin.ModelAdmin):
    """Admin interface for About section statistics cards."""
    list_display = ('label', 'number', 'detail', 'is_accent', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_accent', 'is_visible')
    list_display_links = ('label',)
    search_fields = ('number', 'label', 'detail')


class SkillInline(admin.TabularInline):
    """
    Inline Skill Editor:
    Allows adding and editing individual tools (e.g. Pandas, NumPy)
    directly inside the SkillCategory screen without opening a separate page!
    """
    model = Skill
    extra = 1
    fields = ('display_order', 'name', 'proficiency_level', 'icon_name', 'is_visible')


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    """Admin interface for skill categories."""
    list_display = ('name', 'display_order', 'skill_count', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('name',)
    inlines = [SkillInline]

    def skill_count(self, obj):
        return obj.skills.count()
    skill_count.short_description = "Tools Count"


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Admin interface for individual skills."""
    list_display = ('name', 'category', 'display_order', 'proficiency_level', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('name',)
    list_filter = ('category', 'is_visible')
    search_fields = ('name', 'category__name')


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    """Admin interface for academic credentials."""
    list_display = ('degree', 'field_of_study', 'institution', 'year_display', 'badge_text', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('degree',)
    search_fields = ('degree', 'field_of_study', 'institution')


@admin.register(CertificationCategory)
class CertificationCategoryAdmin(admin.ModelAdmin):
    """Admin interface for certification category filters."""
    list_display = ('name', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('name',)


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    """Admin interface for professional certifications."""
    list_display = ('title', 'issuer', 'category', 'status_text', 'has_url', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('title',)
    list_filter = ('category', 'issuer', 'is_visible')
    search_fields = ('title', 'issuer', 'credential_id')

    def has_url(self, obj):
        """Displays a green checkmark icon in the table if a verification URL exists."""
        return bool(obj.credential_url)
    has_url.boolean = True
    has_url.short_description = "Has Link"


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    """Admin interface for key milestones and outcomes."""
    list_display = ('achievement_number', 'title', 'icon_name', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('achievement_number', 'title')
    search_fields = ('achievement_number', 'title', 'description')


