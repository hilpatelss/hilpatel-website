"""
==============================================================================
Master URL Routing Switchboard (config/urls.py)
==============================================================================

WHAT IS THIS FILE?
`urls.py` is the traffic director for the Django backend.
When a browser or API client sends an HTTP request to `api.hilpatel.site`,
Django looks down this list to find the matching route and passes the request
to the appropriate view function.

MAIN URL ROUTES:
1. `/admin/`   -> Django's visual administration dashboard for editing portfolio data
2. `/api/v1/`  -> REST API endpoints for projects, skills, education, contact, and settings
3. `/media/`   -> Serves uploaded files (such as resume PDFs and project thumbnails)
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

# Customize the visual branding of the Django Admin control panel
admin.site.site_header = "Hil Patel CMS Admin"
admin.site.site_title = "Portfolio CMS"
admin.site.index_title = "Portfolio Content & Configuration Management"

# Grouping all Version 1 (v1) API routes under a clean prefix
api_v1_patterns = [
    # Site settings, design tokens, navigation links, and initial bootstrap payload
    path('site-settings/', include('apps.site_settings.urls')),
    # Core portfolio content: skills, education, certifications, and marquee ticker
    path('', include('apps.portfolio.urls')),
    # Featured analytics projects and project categories
    path('projects/', include('apps.projects.urls')),
    # Contact form inquiry endpoint
    path('contact/', include('apps.contact.urls')),
    # Anonymous visitor telemetry endpoint
    path('analytics/', include('apps.analytics.urls')),
]

urlpatterns = [
    # 1. Django Admin Login & Management Dashboard
    path('admin/', admin.site.urls),

    # 2. Main API Version 1 Namespace: https://api.hilpatel.site/api/v1/...
    path('api/v1/', include(api_v1_patterns)),

    # 3. Legacy Fallback Route: Supports any older client calls to /api/contact/
    path('api/', include([
        path('contact/', include('apps.contact.urls')),
    ])),

    # 4. Uploaded Media Files: Allows direct downloading of resumes, certificates, and thumbnails
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# When developing locally, serve static files (CSS/JS for Django admin) directly
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


