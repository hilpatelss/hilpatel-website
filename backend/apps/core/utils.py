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
        sanitized = slugify(base)[:40] or 'upload'
        unique = uuid.uuid4().hex[:8]
        return f'{self.folder_name}/{sanitized}-{unique}{ext.lower()}'

def generate_upload_path(folder_name):
    return UploadToPath(folder_name)

