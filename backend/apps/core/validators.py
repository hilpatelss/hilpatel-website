"""
==============================================================================
Core Form & Field Validators (apps/core/validators.py)
==============================================================================

WHAT IS THIS FILE?
"Validators" are security and quality checkpoints in Django.
Before any data or file is saved into the database, these functions inspect it
and reject it with a friendly error message if it is invalid, unsafe, or too large.

VALIDATORS INCLUDED:
1. `validate_hex_color`: Ensures theme color inputs are valid CSS hex codes (e.g. #0071E3).
2. `validate_image_file`: Restricts image uploads to safe formats (JPG, PNG, WebP, SVG) and max 8 MB.
3. `validate_document_file`: Restricts resume uploads to document formats (PDF, DOC) and max 15 MB.
"""

import os
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# Regular expression checking for valid 3- or 6-digit hex color format (#FFF or #1D1D1F)
HEX_COLOR_REGEX = re.compile(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')

def validate_hex_color(value):
    """Validates that a string is a valid 3- or 6-character hex color code."""
    if value and not HEX_COLOR_REGEX.match(value):
        raise ValidationError(
            _('%(value)s is not a valid hex color (e.g. #0071e3 or #fff).'),
            params={'value': value},
        )

def validate_image_file(file):
    """
    Validates uploaded image file size and extension.
    Rejects dangerous files (like .exe or .sh) and files exceeding 8 megabytes.
    """
    max_size_mb = 8
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']
    if ext not in valid_extensions:
        raise ValidationError(_('Unsupported image format. Allowed: %(exts)s'), params={'exts': ', '.join(valid_extensions)})
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(_('Image file size cannot exceed %(max)s MB.'), params={'max': max_size_mb})

def validate_document_file(file):
    """
    Validates uploaded document (e.g. Resume/CV) file size and extension.
    Accepts PDF, DOC, and DOCX files up to 15 megabytes.
    """
    max_size_mb = 15
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.pdf', '.doc', '.docx']
    if ext not in valid_extensions:
        raise ValidationError(_('Unsupported document format. Allowed: %(exts)s'), params={'exts': ', '.join(valid_extensions)})
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(_('Document file size cannot exceed %(max)s MB.'), params={'max': max_size_mb})


