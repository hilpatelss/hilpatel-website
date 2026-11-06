"""
==============================================================================
ASGI Server Entrypoint (config/asgi.py)
==============================================================================

WHAT IS ASGI?
ASGI stands for "Asynchronous Server Gateway Interface". It is the modern
counterpart to WSGI that supports asynchronous Python servers (like Uvicorn
or Daphne) and handles real-time protocols like WebSockets or HTTP/2.
"""

import os
from django.core.asgi import get_asgi_application

# Point to project configuration in config/settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# The standard ASGI callable
application = get_asgi_application()


