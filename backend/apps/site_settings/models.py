from django.db import models
from apps.core.models import SingletonModel, OrderableModel
from apps.core.validators import validate_hex_color, validate_image_file, validate_document_file
from apps.core.utils import generate_upload_path

class SiteSettings(SingletonModel):
    """Global editable site configuration managed via Django Admin."""
    site_title = models.CharField(max_length=150, default="Hil Patel Portfolio / 2026")
    brand_mark_initial = models.CharField(max_length=10, default="H")
    brand_mark_accent = models.CharField(max_length=5, default=".")
    owner_name = models.CharField(max_length=100, default="Hil Patel")
    professional_headline = models.CharField(max_length=150, default="Data Analyst")
    location = models.CharField(max_length=150, default="Gandhinagar, Gujarat, India")
    email = models.EmailField(default="hilpatelss@gmail.com")
    phone = models.CharField(max_length=50, blank=True, default="")
    linkedin_url = models.URLField(default="https://linkedin.com/in/hilpatelss", blank=True)
    github_url = models.URLField(default="https://github.com/hilpatelss", blank=True)
    twitter_url = models.URLField(blank=True, default="")
    
    # Hero Content
    hero_eyebrow = models.CharField(max_length=120, default="OPEN TO ENTRY-LEVEL OPPORTUNITIES")
    hero_kicker = models.CharField(
        max_length=200, 
        default="DATA ANALYTICS · BUSINESS INTELLIGENCE · PYTHON"
    )
    hero_headline_greeting = models.CharField(max_length=100, default="Hi, I'm Hil.")
    hero_headline_line1 = models.CharField(max_length=100, default="I make data")
    hero_headline_line2 = models.CharField(max_length=100, default="make sense")
    hero_primary_button_text = models.CharField(max_length=50, default="Explore my work")
    hero_primary_button_url = models.CharField(max_length=200, default="#projects")
    hero_secondary_button_text = models.CharField(max_length=50, default="Download resume")
    hero_secondary_button_url = models.CharField(max_length=200, default="/resume.pdf")
    
    # Bio and Narratives
    intro_text = models.CharField(
        max_length=300, 
        default="I turn raw data into clear insights and practical decisions."
    )
    summary_text = models.TextField(
        default="Computer Engineering graduate with hands-on experience in data analysis, dashboard development, and business reporting. I work with Python, SQL, Excel, Power BI, and data visualization to make complex information easier to understand."
    )
    about_large_copy = models.TextField(
        default="I enjoy finding the signal in the noise — cleaning data, asking better questions, and turning analysis into something people can act on."
    )
    about_body_copy = models.TextField(
        default="My work spans exploratory data analysis, interactive Power BI dashboards, and a Django-based billing system. I like connecting the technical details with the bigger business question: what does the data actually tell us?"
    )
    
    # Media Files
    profile_image = models.ImageField(
        upload_to=generate_upload_path('profile'),
        validators=[validate_image_file],
        blank=True,
        null=True,
        help_text="Optional profile photo displayed in about/hero section."
    )
    resume_file = models.FileField(
        upload_to=generate_upload_path('resumes'),
        validators=[validate_document_file],
        blank=True,
        null=True,
        help_text="Upload your PDF resume here to automatically serve direct downloads."
    )
    resume_url = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="Direct public URL to your hosted resume PDF (e.g. Google Drive, GitHub raw, Cloudinary, AWS S3). Takes priority over ephemeral file uploads."
    )
    favicon = models.ImageField(
        upload_to=generate_upload_path('favicons'),
        blank=True,
        null=True
    )
    
    # SEO & OpenGraph
    seo_meta_title = models.CharField(
        max_length=200, 
        default="Hil Patel — Data Analyst Portfolio",
        blank=True
    )
    seo_meta_description = models.TextField(
        default="Portfolio of Hil Patel, Data Analyst and Computer Engineering graduate specializing in Python, SQL, Power BI, DAX, and Business Intelligence.",
        blank=True
    )
    og_image = models.ImageField(
        upload_to=generate_upload_path('seo'),
        blank=True,
        null=True
    )
    
    # Footer Settings
    footer_tagline = models.CharField(
        max_length=200, 
        default="Turning questions into insights, one dataset at a time."
    )
    footer_copyright = models.CharField(
        max_length=200, 
        default="© 2026 Hil Patel. Built with intention."
    )
    footer_tech_stack = models.CharField(
        max_length=150, 
        default="REACT · DJANGO REST FRAMEWORK"
    )
    footer_location = models.CharField(
        max_length=100, 
        default="GUJARAT, INDIA"
    )
    
    # Contact settings
    contact_enabled = models.BooleanField(
        default=True, 
        help_text="Toggle contact form on/off publicly."
    )
    contact_availability_status = models.CharField(
        max_length=100, 
        default="Open to entry-level roles"
    )
    contact_pitch = models.TextField(
        default="I'm interested in entry-level Data Analyst opportunities and conversations about analytics, dashboards, and data-driven problem solving."
    )
    
    # Website-wide announcement
    announcement_enabled = models.BooleanField(default=False)
    announcement_text = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        verbose_name = "Site Global Settings"
        verbose_name_plural = "Site Global Settings"

    def __str__(self):
        return f"Site Settings ({self.site_title})"


class DesignSettings(SingletonModel):
    """Editable Design & Theme configurations exposed via API to drive CSS variables dynamically."""
    theme_name = models.CharField(max_length=50, default="Executive Emerald Slate")
    
    # Accent colors
    accent_color = models.CharField(
        max_length=20, 
        default="#10b981", 
        validators=[validate_hex_color],
        help_text="Primary signature accent color (default: #10b981 emerald)."
    )
    accent2_color = models.CharField(
        max_length=20, 
        default="#06b6d4", 
        validators=[validate_hex_color],
        help_text="Secondary accent color (default: #06b6d4 cyan)."
    )
    
    # Dark Mode Colors
    dark_bg = models.CharField(max_length=20, default="#0a0d14", validators=[validate_hex_color])
    dark_surface = models.CharField(max_length=20, default="#111726", validators=[validate_hex_color])
    dark_surface2 = models.CharField(max_length=20, default="#172033", validators=[validate_hex_color])
    dark_text = models.CharField(max_length=20, default="#f8fafc", validators=[validate_hex_color])
    dark_muted = models.CharField(max_length=20, default="#94a3b8", validators=[validate_hex_color])
    dark_line = models.CharField(max_length=20, default="#1e293b", validators=[validate_hex_color])
    
    # Light Mode Colors
    light_bg = models.CharField(max_length=20, default="#f8fafc", validators=[validate_hex_color])
    light_surface = models.CharField(max_length=20, default="#ffffff", validators=[validate_hex_color])
    light_surface2 = models.CharField(max_length=20, default="#f1f5f9", validators=[validate_hex_color])
    light_text = models.CharField(max_length=20, default="#0f172a", validators=[validate_hex_color])
    light_muted = models.CharField(max_length=20, default="#64748b", validators=[validate_hex_color])
    light_line = models.CharField(max_length=20, default="#e2e8f0", validators=[validate_hex_color])
    light_accent = models.CharField(max_length=20, default="#059669", validators=[validate_hex_color])
    
    # Typography & Appearance
    font_family_main = models.CharField(max_length=100, default="'Manrope', sans-serif")
    font_family_mono = models.CharField(max_length=100, default="'DM Mono', monospace")
    border_radius = models.CharField(max_length=20, default="4px", help_text="e.g. 0px, 4px, 8px")
    enable_animations = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Design & Theme Settings"
        verbose_name_plural = "Design & Theme Settings"

    def __str__(self):
        return f"Design Settings ({self.theme_name})"


class NavigationItem(OrderableModel):
    """Editable navigation menu links in the header and mobile drawer."""
    label = models.CharField(max_length=50)
    url = models.CharField(max_length=200, help_text="Anchor like #about or URL like /projects")
    is_external = models.BooleanField(default=False)

    class Meta(OrderableModel.Meta):
        verbose_name = "Navigation Menu Item"
        verbose_name_plural = "Navigation Menu Items"

    def __str__(self):
        return f"{self.display_order}: {self.label} ({self.url})"


class SectionConfig(OrderableModel):
    """Configuration to order, toggle, and customize headings of portfolio sections."""
    section_key = models.SlugField(max_length=50, unique=True, help_text="e.g. about, projects, skills, education, certs, highlights, contact")
    index_label = models.CharField(max_length=50, default="01 / SECTION", help_text="e.g. 01 / ABOUT")
    title_line1 = models.CharField(max_length=150, help_text="First line of section title")
    title_line2 = models.CharField(max_length=150, blank=True, default="", help_text="Second line of section title")
    heading_note = models.CharField(max_length=255, blank=True, default="", help_text="Subtext/note beside heading")

    class Meta(OrderableModel.Meta):
        verbose_name = "Section Layout & Visibility"
        verbose_name_plural = "Section Layouts & Visibility"

    def __str__(self):
        return f"[{self.display_order}] {self.section_key.upper()} - {self.index_label}"


class HeroMetric(OrderableModel):
    """Pills shown below the hero description (e.g. Code2 with Python, SQL, Power BI)."""
    icon_name = models.CharField(max_length=50, default="Code2", help_text="Lucide icon name (e.g. Code2, GraduationCap)")
    text = models.CharField(max_length=150)

    class Meta(OrderableModel.Meta):
        verbose_name = "Hero Metric Pill"
        verbose_name_plural = "Hero Metric Pills"

    def __str__(self):
        return self.text

