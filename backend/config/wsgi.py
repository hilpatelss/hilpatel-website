"""
==============================================================================
WSGI Server Entrypoint (config/wsgi.py)
==============================================================================

WHAT IS WSGI?
WSGI stands for "Web Server Gateway Interface". It is the standard universal 
bridge used by production Python web servers (such as Gunicorn on Render)
to forward incoming HTTP requests to our Django code.
"""

import os
from django.core.wsgi import get_wsgi_application

# Point to project configuration in config/settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# The standard WSGI callable that web servers hook into
application = get_wsgi_application()


