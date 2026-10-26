from rest_framework import serializers
from .models import ProjectCategory, TechnologyTag, Project, ProjectHighlight, ProjectImage

class TechnologyTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnologyTag
        fields = ['id', 'name', 'slug']


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ['id', 'name', 'slug', 'display_order']


class ProjectHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectHighlight
        fields = ['id', 'text', 'display_order']


class ProjectImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectImage
        fields = ['id', 'image_url', 'caption', 'display_order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request and obj.image else (obj.image.url if obj.image else None)


class ProjectListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    highlights = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'number',
            'title',
            'slug',
            'category_name',
            'category_slug',
            'tags',
            'short_description',
            'highlights',
            'repository_url',
            'live_demo_url',
            'powerbi_embed_url',
            'documentation_url',
            'thumbnail_url',
            'custom_art_type',
            'icon_name',
            'is_featured',
            'display_order',
        ]

    def get_highlights(self, obj):
        return [h.text for h in obj.highlights.all().order_by('display_order', 'id')]

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None


class ProjectDetailSerializer(ProjectListSerializer):
    gallery_images = ProjectImageSerializer(many=True, read_only=True)

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + [
            'full_description',
            'download_url',
            'start_date',
            'completion_date',
            'gallery_images',
        ]

