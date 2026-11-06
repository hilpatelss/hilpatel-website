"""
==============================================================================
Django Project Settings Configuration (config/settings.py)
==============================================================================

WHAT IS THIS FILE?
This is the master configuration file for the Django backend.
It controls security, database connections, installed apps, email notifications,
file uploads, and Cross-Origin Resource Sharing (CORS).

KEY SECTIONS IN THIS FILE:
1. Security: SECRET_KEY, DEBUG toggle, and ALLOWED_HOSTS.
2. Apps & Middleware: Plugs in REST Framework, CORS headers, and local portfolio apps.
3. Database: Automatically uses SQLite locally and Neon PostgreSQL in production.
4. Static & Media: Serves website icons and stores uploaded PDF resumes & images.
5. CORS: Permits `hilpatel.site` (hosted on Cloudflare) to communicate with this API.
6. REST Framework: Configures API permissions, pagination, and anti-abuse rate limits.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# BASE_DIR points to the 'backend' root folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Load secret variables from the local .env file (if one exists)
load_dotenv(BASE_DIR / '.env')

# Add apps folder to Python's search path so we can import apps directly
sys.path.insert(0, str(BASE_DIR / 'apps'))

# -----------------------------------------------------------------------------
# 1. CORE SECURITY SETTINGS
# -----------------------------------------------------------------------------
# SECRET_KEY is used for cryptographic signing (sessions, tokens, passwords).
# In production, this must always be kept secret in environment variables.
SECRET_KEY = os.getenv('SECRET_KEY')

if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

# DEBUG: When True, shows detailed error pages for debugging.
# In production, this MUST be False so visitors/hackers cannot see internal code traces.
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')

# ALLOWED_HOSTS defines which web domain names can serve this Django application
ALLOWED_HOSTS_RAW = os.getenv(
    'ALLOWED_HOSTS',
    '127.0.0.1,localhost,api.hilpatel.site,.onrender.com'
)
ALLOWED_HOSTS = [
    host.strip()
    for host in ALLOWED_HOSTS_RAW.split(',')
    if host.strip()
]

# Ensure production API hostname and Render domains are always allowed
for host in ['api.hilpatel.site', '.onrender.com']:
    if host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(host)

# Automatically allow the Render hosting internal service hostname
RENDER_EXTERNAL_HOSTNAME = os.getenv('RENDER_EXTERNAL_HOSTNAME')

if RENDER_EXTERNAL_HOSTNAME and RENDER_EXTERNAL_HOSTNAME not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# -----------------------------------------------------------------------------
# 2. INSTALLED APPLICATIONS
# -----------------------------------------------------------------------------
INSTALLED_APPS = [
    # Standard built-in Django applications
    'django.contrib.admin',          # Built-in administrative dashboard at /admin/
    'django.contrib.auth',           # User accounts and authentication
    'django.contrib.contenttypes',   # Tracks all models installed in the project
    'django.contrib.sessions',       # Tracks logged-in administrator sessions
    'django.contrib.messages',       # Temporary flash messages for the admin
    'django.contrib.staticfiles',    # Collects CSS/JS assets for the admin

    # Third-party tools
    'rest_framework',                # Django REST Framework (turns models into JSON APIs)
    'corsheaders',                   # Allows the React frontend to make requests across domains

    # Local project apps
    'apps.core.apps.CoreConfig',                 # Shared utilities, validators, and seeding commands
    'apps.site_settings.apps.SiteSettingsConfig',# Site title, colors, navigation links, and bootstrap API
    'apps.portfolio.apps.PortfolioConfig',       # Skills, education history, and certifications
    'apps.projects.apps.ProjectsConfig',         # Featured case studies and project details
    'apps.contact.apps.ContactConfig',           # Contact form submissions and email alerts
    'apps.analytics.apps.AnalyticsConfig',       # Privacy-friendly visitor statistics
]

# -----------------------------------------------------------------------------
# 3. REQUEST PROCESSING MIDDLEWARE PIPELINE
# -----------------------------------------------------------------------------
# When a web request arrives, it travels down this list step-by-step
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',                 # Checks if frontend origin is permitted
    'django.middleware.security.SecurityMiddleware',         # Applies HTTP security headers
    'whitenoise.middleware.WhiteNoiseMiddleware',            # Serves static assets efficiently without Nginx
    'django.contrib.sessions.middleware.SessionMiddleware',  # Manages admin login sessions
    'django.middleware.common.CommonMiddleware',             # Standard URL routing helpers
    'django.middleware.csrf.CsrfViewMiddleware',             # Cross-Site Request Forgery protection
    'django.contrib.auth.middleware.AuthenticationMiddleware',# Identifies who is logged into the admin
    'django.contrib.messages.middleware.MessageMiddleware',  # Delivers notifications in admin
    'django.middleware.clickjacking.XFrameOptionsMiddleware', # Prevents malicious iframing
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# -----------------------------------------------------------------------------
# 4. DATABASE CONFIGURATION
# -----------------------------------------------------------------------------
# Intelligent dual database switching:
# - In production (Render): Uses PostgreSQL (Neon Serverless Postgres via DATABASE_URL).
# - In local development: If DATABASE_URL is not set, falls back to local SQLite (db.sqlite3).
DATABASE_URL = os.getenv('DATABASE_URL', '').strip()

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,            # Keeps database connections open for 10 minutes to speed up queries
            conn_health_checks=True,     # Reconnects automatically if connection drops
            ssl_require=True if not DEBUG else False,
        )
    }
elif not DEBUG:
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured(
        "DATABASE_URL environment variable is required in production (DEBUG=False). "
        "Configure your Neon PostgreSQL connection string in the deployment environment."
    )
else:
    # Local developer fallback: SQLite file
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation for admin users
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Timezone & Language settings
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, and images needed for Django Admin)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (Files uploaded by the site owner: resumes, certificate PDFs, project pictures)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR.parent / 'media'

# File upload limits (maximum 10 megabytes per file to prevent server memory exhaustion)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024

# -----------------------------------------------------------------------------
# 5. CROSS-ORIGIN RESOURCE SHARING (CORS) SETTINGS
# -----------------------------------------------------------------------------
# Web browsers normally block websites from asking for data from different domains.
# These rules allow the Cloudflare frontend (`hilpatel.site`) to call this API (`api.hilpatel.site`).
CORS_ALLOWED_ORIGINS_RAW = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'https://hilpatel.site,https://www.hilpatel.site,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000'
)
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in CORS_ALLOWED_ORIGINS_RAW.split(',')
    if origin.strip()
]
# Ensure production frontend origins are always permitted
for origin in ['https://hilpatel.site', 'https://www.hilpatel.site']:
    if origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(origin)

CORS_ALLOW_CREDENTIALS = True
if DEBUG:
    # Allow localhost on any port during local development
    CORS_ALLOW_ALL_ORIGINS = True

# CSRF Trusted Origins (Required by modern Django for secure form handling across domains)
CSRF_TRUSTED_ORIGINS_RAW = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'https://hilpatel.site,https://www.hilpatel.site,https://api.hilpatel.site'
)
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in CSRF_TRUSTED_ORIGINS_RAW.split(',')
    if origin.strip()
]
for origin in ['https://hilpatel.site', 'https://www.hilpatel.site', 'https://api.hilpatel.site']:
    if origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(origin)

# -----------------------------------------------------------------------------
# 6. DJANGO REST FRAMEWORK (API) CONFIGURATION
# -----------------------------------------------------------------------------
REST_FRAMEWORK = {
    # Public can read content (GET requests), but only logged-in admins can edit (POST/PUT/DELETE)
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    # Rate Limiting / Throttling: Prevents automated bots from spamming the API
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/minute',
        'user': '1000/minute',
        'contact': os.getenv('CONTACT_RATE_LIMIT', '15/hour'),          # Max 15 contact messages per hour
        'visitor_log': os.getenv('VISITOR_LOG_RATE_LIMIT', '60/minute'), # Max 60 visitor telemetry pings/min
        'analytics_ingest': os.getenv('ANALYTICS_RATE_LIMIT', '120/minute'),
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# Optional Visitor Logging Feature Toggle
ENABLE_VISITOR_LOGGING = os.getenv('ENABLE_VISITOR_LOGGING', 'True').lower() in ('true', '1', 'yes')

# -----------------------------------------------------------------------------
# 7. EMAIL NOTIFICATION CONFIGURATION
# -----------------------------------------------------------------------------
# When someone sends a message through the contact form, Django can email Hil Patel
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'portfolio@example.com')
CONTACT_NOTIFICATION_EMAIL = os.getenv('CONTACT_NOTIFICATION_EMAIL', 'hilpatelss@gmail.com')

# Anti-Spam hidden honeypot field name (bots fill it; humans leave it empty)
HONEYPOT_FIELD_NAME = os.getenv('HONEYPOT_FIELD_NAME', 'website')

# Default database ID column type (BigInteger = 64-bit numbers)
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -----------------------------------------------------------------------------
# 8. PRODUCTION SECURITY HARDENING
# -----------------------------------------------------------------------------
# Advanced browser security protections enabled in live production
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_CONTENT_TYPE_NOSNIFF = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


