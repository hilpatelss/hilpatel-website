from django.db import models
from apps.core.models import OrderableModel
from apps.core.utils import generate_upload_path
from apps.core.validators import validate_image_file, validate_document_file

class TickerItem(OrderableModel):
    """Keywords scrolling continuously in the marquee ticker tape."""
    text = models.CharField(max_length=50, help_text="e.g. PYTHON, SQL, POWER BI, DAX")

    class Meta(OrderableModel.Meta):
        verbose_name = "Ticker Keyword"
        verbose_name_plural = "Ticker Keywords"

    def __str__(self):
        return self.text


class AboutStat(OrderableModel):
    """Statistics / Highlights cards shown in the About section."""
    number = models.CharField(max_length=20, help_text="e.g. 03, 02, 05+")
    label = models.CharField(max_length=100, help_text="e.g. Featured projects")
    detail = models.CharField(max_length=150, help_text="e.g. Dashboards & applications")
    is_accent = models.BooleanField(
        default=False, 
        help_text="If checked, this card will use the lime accent background."
    )
    icon_name = models.CharField(
        max_length=50, 
        blank=True, 
        default="", 
        help_text="Lucide icon name if applicable (e.g. ChartNoAxesCombined)"
    )

    class Meta(OrderableModel.Meta):
        verbose_name = "About Stat Card"
        verbose_name_plural = "About Stat Cards"

    def __str__(self):
        return f"{self.number} - {self.label}"


class SkillCategory(OrderableModel):
    """Groupings for skills (e.g. Languages, Data analysis, Visualization)."""
    name = models.CharField(max_length=100, unique=True)

    class Meta(OrderableModel.Meta):
        verbose_name = "Skill Category"
        verbose_name_plural = "Skill Categories"

    def __str__(self):
        return self.name


class Skill(OrderableModel):
    """Individual tools / technologies within a category."""
    category = models.ForeignKey(
        SkillCategory, 
        on_delete=models.CASCADE, 
        related_name="skills"
    )
    name = models.CharField(max_length=100)
    proficiency_level = models.CharField(
        max_length=50, 
        blank=True, 
        default="",
        help_text="Optional proficiency or experience level (e.g. Advanced, Intermediate)."
    )
    icon_name = models.CharField(
        max_length=50, 
        blank=True, 
        default="",
        help_text="Optional Lucide icon name or image identifier."
    )

    class Meta(OrderableModel.Meta):
        verbose_name = "Skill / Tool"
        verbose_name_plural = "Skills / Tools"
        unique_together = ('category', 'name')

    def __str__(self):
        return f"{self.category.name} → {self.name}"


class Education(OrderableModel):
    """Academic qualifications and degrees."""
    degree = models.CharField(max_length=150, help_text="e.g. Bachelor of Engineering")
    field_of_study = models.CharField(max_length=150, help_text="e.g. Computer Engineering")
    institution = models.CharField(max_length=255, help_text="e.g. SVBIT · Gujarat Technological University (GTU)")
    year_display = models.CharField(max_length=50, default="2026", help_text="e.g. 2026 or 2020 - 2023")
    detail = models.CharField(max_length=255, help_text="e.g. Undergraduate degree in Computer Engineering.")
    badge_text = models.CharField(max_length=50, default="COMPLETED")

    class Meta(OrderableModel.Meta):
        verbose_name = "Education History"
        verbose_name_plural = "Education History"

    def __str__(self):
        return f"{self.degree} ({self.year_display}) - {self.institution}"


class CertificationCategory(OrderableModel):
    """Categories for filtering certifications (e.g. Data Analytics, Development)."""
    name = models.CharField(max_length=100, unique=True)

    class Meta(OrderableModel.Meta):
        verbose_name = "Certification Category"
        verbose_name_plural = "Certification Categories"

    def __str__(self):
        return self.name


class Certification(OrderableModel):
    """Professional certifications and verified credentials."""
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200, help_text="e.g. Adani Skills & Development Center")
    category = models.ForeignKey(
        CertificationCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certifications"
    )
    status_text = models.CharField(
        max_length=100, 
        default="Listed on resume"
    )
    credential_id = models.CharField(max_length=150, blank=True, default="")
    credential_url = models.URLField(
        blank=True, 
        default="", 
        help_text="Direct link to verify credential on issuing portal."
    )
    certificate_file = models.FileField(
        upload_to=generate_upload_path('certificates'),
        validators=[validate_document_file, validate_image_file],
        blank=True,
        null=True,
        help_text="Upload certificate image or PDF document."
    )
    issue_date = models.DateField(null=True, blank=True)

    class Meta(OrderableModel.Meta):
        verbose_name = "Certification"
        verbose_name_plural = "Certifications"

    def __str__(self):
        return f"{self.title} ({self.issuer})"


class Achievement(OrderableModel):
    """Milestones and key outcomes displayed in the Highlights section."""
    achievement_number = models.CharField(max_length=10, default="01")
    title = models.CharField(max_length=150)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default="BarChart3", help_text="Lucide icon name")
    external_link = models.URLField(blank=True, default="")

    class Meta(OrderableModel.Meta):
        verbose_name = "Achievement / Outcome"
        verbose_name_plural = "Achievements / Outcomes"

    def __str__(self):
        return f"{self.achievement_number}: {self.title}"

