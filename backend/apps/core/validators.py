import os
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

HEX_COLOR_REGEX = re.compile(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')

def validate_hex_color(value):
    """Validates that a string is a valid 3- or 6-character hex color code."""
    if value and not HEX_COLOR_REGEX.match(value):
        raise ValidationError(
            _('%(value)s is not a valid hex color (e.g. #c7ff5e or #fff).'),
            params={'value': value},
        )

def validate_image_file(file):
    """Validates uploaded image file size and extension."""
    max_size_mb = 8
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']
    if ext not in valid_extensions:
        raise ValidationError(_('Unsupported image format. Allowed: %(exts)s'), params={'exts': ', '.join(valid_extensions)})
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(_('Image file size cannot exceed %(max)s MB.'), params={'max': max_size_mb})

def validate_document_file(file):
    """Validates uploaded document (e.g. Resume/CV) file size and extension."""
    max_size_mb = 15
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.pdf', '.doc', '.docx']
    if ext not in valid_extensions:
        raise ValidationError(_('Unsupported document format. Allowed: %(exts)s'), params={'exts': ', '.join(valid_extensions)})
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(_('Document file size cannot exceed %(max)s MB.'), params={'max': max_size_mb})

