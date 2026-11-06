"""
==============================================================================
Core Utilities (apps/core/utils.py)
==============================================================================

WHAT IS THIS FILE?
Provides helper utilities shared across all Django apps in the project.

WHAT DOES UploadToPath DO?
When an admin uploads a file (such as a PDF resume or a project screenshot),
two problems can happen:
1. File names with strange characters (spaces, symbols) can break web URLs.
2. If two files have the same name (like "resume.pdf"), one could overwrite the other!

`UploadToPath` solves both:
- It cleans the file name (slugify) so it's safe for web URLs.
- It attaches a short unique 8-character random ID (UUID) so files never overwrite each other.
Example: "My Resume 2026.pdf" becomes "resumes/my-resume-2026-a1b2c3d4.pdf".
"""

import os
import uuid
from django.utils.deconstruct import deconstructible
from django.utils.text import slugify

@deconstructible
class UploadToPath:
    def __init__(self, folder_name):
        self.folder_name = folder_name

    def __call__(self, instance, filename):
        base, ext = os.path.splitext(filename)
        # Convert base name to safe URL characters (max 40 chars)
        sanitized = slugify(base)[:40] or 'upload'
        # Generate an 8-character random hex string
        unique = uuid.uuid4().hex[:8]
        return f'{self.folder_name}/{sanitized}-{unique}{ext.lower()}'

def generate_upload_path(folder_name):
    """Factory function returning an UploadToPath callable."""
    return UploadToPath(folder_name)


