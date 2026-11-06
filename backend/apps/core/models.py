"""
==============================================================================
Core Abstract Base Models (apps/core/models.py)
==============================================================================

WHAT IS THIS FILE?
In Python and Django, "models" define the structure of tables in the database.
An "abstract base model" is like a blueprint or reusable template. It does not
create a database table of its own, but other models (like Projects, Skills,
or Education) inherit from it to automatically gain useful fields and behavior.

BASE MODELS INCLUDED:
1. `TimeStampedModel`: Gives any model automatic `created_at` and `updated_at` timestamps.
2. `OrderableModel`: Gives any model drag-and-drop order (`display_order`) and a visibility toggle (`is_visible`).
3. `SingletonModel`: Ensures there is only ever ONE record in the database table (ideal for website settings).
"""

from django.db import models
from django.core.exceptions import ValidationError

class TimeStampedModel(models.Model):
    """
    Abstract base model providing created_at and updated_at timestamps.
    Automatically records when an item was first inserted and when it was last modified.
    """
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True  # Tells Django: Do not create a database table for this class directly


class OrderableModel(TimeStampedModel):
    """
    Abstract base model providing ordering and visibility controls.
    Allows the site owner to rearrange the order of projects or skills
    and toggle whether they are publicly visible.
    """
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
        # Sorts items by display_order first, then by database ID
        ordering = ['display_order', 'id']


class SingletonModel(TimeStampedModel):
    """
    Abstract model pattern ensuring only a single record exists in the database.
    
    WHY IS THIS NEEDED?
    For things like website title, bio copy, or theme colors, you only ever want
    ONE settings record, not twenty. This forces the primary key to always be 1 (pk=1)
    and provides a convenient `.load()` helper method.
    """
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        # Force the primary key to 1 so saving updates the single existing row
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Prevent accidental deletion of essential website settings
        pass

    @classmethod
    def load(cls):
        """Retrieves or creates the single record instance."""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


