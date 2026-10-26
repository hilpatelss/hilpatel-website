from django.db import models
from apps.core.models import TimeStampedModel

class ContactMessage(TimeStampedModel):
    """Secure persistence of messages received from the portfolio contact form."""
    STATUS_CHOICES = [
        ('new', 'New / Unread'),
        ('in_progress', 'In Progress / Follow Up'),
        ('responded', 'Responded / Closed'),
        ('spam', 'Spam / Discarded'),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True, default="Portfolio Contact Form Inquiry")
    message = models.TextField()
    
    # Security & Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    
    # Administrative Processing
    is_read = models.BooleanField(default=False, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', db_index=True)
    admin_notes = models.TextField(
        blank=True, 
        default="", 
        help_text="Internal notes regarding follow-up, interview scheduling, or discussions."
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"

    def __str__(self):
        return f"[{self.get_status_display()}] {self.name} <{self.email}> on {self.created_at.strftime('%Y-%m-%d')}"

