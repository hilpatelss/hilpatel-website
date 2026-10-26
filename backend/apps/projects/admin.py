from django.contrib import admin
from django.utils.html import format_html
from .models import ProjectCategory, TechnologyTag, Project, ProjectHighlight, ProjectImage

class ProjectHighlightInline(admin.TabularInline):
    model = ProjectHighlight
    extra = 3
    fields = ('display_order', 'text')


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1
    fields = ('display_order', 'image', 'caption')


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order', 'is_visible')
    list_editable = ('display_order', 'is_visible')
    list_display_links = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(TechnologyTag)
class TechnologyTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    list_display_links = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'number',
        'category',
        'custom_art_type',
        'is_featured',
        'is_published',
        'display_order',
        'thumbnail_preview',
    )
    list_editable = ('display_order', 'is_featured', 'is_published')
    list_display_links = ('title',)
    list_filter = ('category', 'is_published', 'is_featured', 'custom_art_type', 'tags')
    search_fields = ('number', 'title', 'short_description', 'full_description')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    inlines = [ProjectHighlightInline, ProjectImageInline]

    fieldsets = (
        ("Basic Information", {
            "fields": (
                ("number", "title", "slug"),
                ("category", "tags"),
                "short_description",
                "full_description",
            )
        }),
        ("Visual Presentation & Art Graphic", {
            "fields": (
                ("custom_art_type", "icon_name"),
                "thumbnail",
            )
        }),
        ("Links & Repositories", {
            "fields": (
                "repository_url",
                ("live_demo_url", "powerbi_embed_url"),
                ("documentation_url", "download_url"),
            )
        }),
        ("Publishing & Display", {
            "fields": (
                ("is_published", "is_featured", "display_order"),
                ("start_date", "completion_date"),
            )
        }),
    )

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="height: 35px; width: 50px; object-fit: cover; border-radius: 3px;" />', obj.thumbnail.url)
        return format_html('<span style="color: #9299a8;">{}</span>', obj.get_custom_art_type_display()[:15])
    thumbnail_preview.short_description = "Visual Preview"

