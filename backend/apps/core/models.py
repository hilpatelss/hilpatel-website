from django.db import models
from django.core.exceptions import ValidationError

class TimeStampedModel(models.Model):
    """Abstract base model providing created_at and updated_at timestamps."""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class OrderableModel(TimeStampedModel):
    """Abstract base model providing ordering and visibility controls."""
    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Lower numbers appear first."
    )
    is_visible = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Check to display this item publicly on the website."
    )

    class Meta:
        abstract = True
        ordering = ['display_order', 'id']


class SingletonModel(TimeStampedModel):
    """
    Abstract model pattern ensuring only a single record exists in the database.
    Prevents duplicate singleton records in Django Admin and provides a reliable .load() accessor.
    """
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Prevent deletion of singleton settings
        pass

    @classmethod
    def load(cls):
        """Retrieves or creates the single record instance."""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

