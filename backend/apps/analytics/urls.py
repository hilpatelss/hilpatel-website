"""
==============================================================================
Analytics URL Routing (urls.py)
==============================================================================

WHAT IS THIS FILE?
This file connects visitor analytics web addresses (endpoints) to their
corresponding Python view logic.

ROUTE:
POST /api/v1/analytics/log/ -> VisitorLogView
When the frontend finishes loading or changes pages, it sends anonymous visit
data to this exact URL.
"""
from django.urls import path
from .views import VisitorLogView

# Namespace for reverse URL lookups (e.g. reverse('analytics:visitor-log'))
app_name = 'analytics'

urlpatterns = [
    # HTTP endpoint for saving an anonymous visitor record
    path('log/', VisitorLogView.as_view(), name='visitor-log'),
]
