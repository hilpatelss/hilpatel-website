"""
==============================================================================
Portfolio Content Serializers (apps/portfolio/serializers.py)
==============================================================================

WHAT IS THIS FILE?
Translates portfolio database models into clean JSON formats that match
the exact data structures expected by the React frontend components.
"""

from rest_framework import serializers
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

class TickerItemSerializer(serializers.ModelSerializer):
    """Translates ticker keywords into JSON."""
    class Meta:
        model = TickerItem
        fields = ['id', 'text', 'display_order']


class AboutStatSerializer(serializers.ModelSerializer):
    """Translates About section highlight cards into JSON."""
    class Meta:
        model = AboutStat
        fields = ['id', 'number', 'label', 'detail', 'is_accent', 'icon_name', 'display_order']


class SkillItemSerializer(serializers.ModelSerializer):
    """Translates an individual skill tool into JSON."""
    class Meta:
        model = Skill
        fields = ['id', 'name', 'proficiency_level', 'icon_name', 'display_order']


class SkillCategorySerializer(serializers.ModelSerializer):
    """
    Translates a skill category into JSON.
    Notice: get_items() extracts the list of tool names (e.g. ['Python', 'SQL'])
    so the React frontend can directly loop over string pills.
    """
    items = serializers.SerializerMethodField()

    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'display_order', 'items']

    def get_items(self, obj):
        visible_skills = obj.skills.filter(is_visible=True).order_by('display_order', 'id')
        return [skill.name for skill in visible_skills]


class EducationSerializer(serializers.ModelSerializer):
    """Translates academic credentials into JSON."""
    class Meta:
        model = Education
        fields = [
            'id',
            'degree',
            'field_of_study',
            'institution',
            'year_display',
            'detail',
            'badge_text',
            'display_order',
        ]


class CertificationCategorySerializer(serializers.ModelSerializer):
    """Translates certification category filters into JSON."""
    class Meta:
        model = CertificationCategory
        fields = ['id', 'name', 'display_order']


class CertificationSerializer(serializers.ModelSerializer):
    """
    Translates certifications into JSON.
    Flattens category.name into 'category_name' and builds the full URL for uploaded certificate documents.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    certificate_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            'id',
            'title',
            'issuer',
            'category_name',
            'status_text',
            'credential_id',
            'credential_url',
            'certificate_file_url',
            'issue_date',
            'display_order',
        ]

    def get_certificate_file_url(self, obj):
        if obj.certificate_file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.certificate_file.url) if request else obj.certificate_file.url
        return None


class AchievementSerializer(serializers.ModelSerializer):
    """Translates milestone outcomes into JSON."""
    class Meta:
        model = Achievement
        fields = [
            'id',
            'achievement_number',
            'title',
            'description',
            'icon_name',
            'external_link',
            'display_order',
        ]

