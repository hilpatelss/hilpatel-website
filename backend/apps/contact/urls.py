"""
==============================================================================
Contact URL Routes (apps/contact/urls.py)
==============================================================================

WHAT IS THIS FILE?
Routes POST requests coming to `/api/v1/contact/` directly to `ContactSubmissionView`.
"""

from django.urls import path
from .views import ContactSubmissionView

urlpatterns = [
    path('', ContactSubmissionView.as_view(), name='contact-submit'),
]


