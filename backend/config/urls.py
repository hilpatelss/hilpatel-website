from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Customize Admin Title and Header
admin.site.site_header = "Hil Patel CMS Admin"
admin.site.site_title = "Portfolio CMS"
admin.site.index_title = "Portfolio Content & Configuration Management"

api_v1_patterns = [
    path('site-settings/', include('apps.site_settings.urls')),
    path('', include('apps.portfolio.urls')),
    path('projects/', include('apps.projects.urls')),
    path('contact/', include('apps.contact.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_patterns)),
    # Legacy/convenience fallback for original frontend call /api/contact/
    path('api/', include([
        path('contact/', include('apps.contact.urls')),
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

