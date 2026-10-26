from django.db import models
from django.utils.text import slugify
from apps.core.models import OrderableModel, TimeStampedModel
from apps.core.utils import generate_upload_path
from apps.core.validators import validate_image_file

class ProjectCategory(OrderableModel):
    """Categories for projects (e.g. Power BI, Full-stack, Machine Learning)."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta(OrderableModel.Meta):
        verbose_name = "Project Category"
        verbose_name_plural = "Project Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class TechnologyTag(TimeStampedModel):
    """Reusable technology and tool tags (e.g. Python, DAX, PostgreSQL, Excel)."""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    class Meta:
        verbose_name = "Technology Tag"
        verbose_name_plural = "Technology Tags"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Project(OrderableModel):
    """Comprehensive portfolio project entry managed in Django Admin."""
    ART_TYPE_CHOICES = [
        ('kpi_bars', 'Animated KPI & Bar Chart (Digital Wellbeing style)'),
        ('donut_chart', 'Donut & Sparkline Chart (BMI & Risk style)'),
        ('billing_chart', 'Billing Revenue Bar Chart (Smart Bill style)'),
        ('custom_image', 'Uploaded Screenshot / Thumbnail Image'),
    ]

    number = models.CharField(max_length=10, default="01", help_text="e.g. 01, 02, 03")
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.ForeignKey(
        ProjectCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="projects"
    )
    tags = models.ManyToManyField(
        TechnologyTag,
        related_name="projects",
        blank=True
    )
    short_description = models.TextField(
        help_text="Concise description displayed on the main portfolio card."
    )
    full_description = models.TextField(
        blank=True, 
        default="", 
        help_text="Detailed case study explanation."
    )
    
    # URLs
    repository_url = models.URLField(
        blank=True, 
        default="", 
        help_text="GitHub repository URL (if blank, links to owner GitHub profile)."
    )
    live_demo_url = models.URLField(blank=True, default="", help_text="Live web demo URL.")
    documentation_url = models.URLField(blank=True, default="")
    powerbi_embed_url = models.URLField(
        blank=True, 
        default="", 
        help_text="Optional Power BI public report link or embed URL."
    )
    download_url = models.URLField(blank=True, default="")
    
    # Media and Visuals
    thumbnail = models.ImageField(
        upload_to=generate_upload_path('projects/thumbnails'),
        validators=[validate_image_file],
        blank=True,
        null=True,
        help_text="Project preview image or thumbnail."
    )
    custom_art_type = models.CharField(
        max_length=30,
        choices=ART_TYPE_CHOICES,
        default='custom_image',
        help_text="Choose between the built-in animated interactive chart graphics or uploaded image."
    )
    icon_name = models.CharField(
        max_length=50, 
        default="BarChart3", 
        help_text="Lucide icon name (e.g. BarChart3, ChartNoAxesCombined, Database, Code2)."
    )
    
    # Flags and Status
    is_featured = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Highlight this project in featured sections."
    )
    is_published = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Only published projects are returned by public API endpoints."
    )
    
    # Timeline
    start_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)

    class Meta(OrderableModel.Meta):
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.number} - {self.title}"


class ProjectHighlight(TimeStampedModel):
    """Bullet points displayed on a project card (e.g. 'KPI cards for key wellbeing indicators')."""
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="highlights"
    )
    text = models.CharField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = "Project Highlight"
        verbose_name_plural = "Project Highlights"

    def __str__(self):
        return f"{self.project.title}: {self.text[:40]}"


class ProjectImage(TimeStampedModel):
    """Screenshots and gallery images for project case studies."""
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="gallery_images"
    )
    image = models.ImageField(
        upload_to=generate_upload_path('projects/gallery'),
        validators=[validate_image_file]
    )
    caption = models.CharField(max_length=200, blank=True, default="")
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = "Project Screenshot / Gallery Image"
        verbose_name_plural = "Project Screenshots / Gallery Images"

    def __str__(self):
        return f"{self.project.title} Screenshot #{self.display_order}"

