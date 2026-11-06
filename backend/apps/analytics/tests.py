"""
==============================================================================
Analytics Automated Test Suite (tests.py)
==============================================================================

WHAT IS THIS FILE?
This file contains automated checks (unit tests) that verify our visitor
logging system works reliably under all scenarios.

WHAT SCENARIOS ARE TESTED?
1. Valid desktop visitor log creation.
2. Mobile and light theme handling.
3. Fallback when given an invalid theme name.
4. Clean shutdown when logging is disabled in settings.
5. Protection of the admin dashboard from unauthenticated users.
6. Error isolation: if the database fails, the server reports an error without crashing.
7. Rough and GPS-level location logging.
8. Fallback to Cloudflare edge server headers when client location is omitted.
"""
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from apps.analytics.models import VisitorLog


class VisitorLogTests(TestCase):
    """Automated test cases for the visitor telemetry endpoint."""

    def setUp(self):
        """Prepares a mock HTTP client before each test method runs."""
        self.client = APIClient()
        self.log_url = reverse('analytics:visitor-log')

    def test_record_valid_visitor_log(self):
        """Verifies standard desktop log submission creates a valid record in the database."""
        payload = {
            "path": "/",
            "device_category": "desktop",
            "screen_resolution": "1920x1080",
            "active_theme": "dark",
            "referrer": "https://google.com"
        }
        response = self.client.post(self.log_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VisitorLog.objects.count(), 1)
        
        log = VisitorLog.objects.first()
        self.assertEqual(log.path, "/")
        self.assertEqual(log.active_theme, "dark")
        self.assertEqual(log.device_category, "desktop")
        self.assertEqual(log.screen_resolution, "1920x1080")
        self.assertTrue(log.ip_address)

    def test_record_light_theme_visitor_log(self):
        """Verifies light mode preferences and mobile viewports are recorded correctly."""
        payload = {
            "path": "/#projects",
            "device_category": "mobile",
            "screen_resolution": "390x844",
            "active_theme": "light",
            "referrer": ""
        }
        response = self.client.post(self.log_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        log = VisitorLog.objects.first()
        self.assertEqual(log.path, "/#projects")
        self.assertEqual(log.active_theme, "light")
        self.assertEqual(log.device_category, "mobile")

    def test_unknown_theme_fallback(self):
        """Verifies that unfamiliar theme names gracefully fallback to 'unknown'."""
        payload = {
            "path": "/#about",
            "device_category": "tablet",
            "screen_resolution": "768x1024",
            "active_theme": "invalid-theme-name"
        }
        response = self.client.post(self.log_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        log = VisitorLog.objects.first()
        self.assertEqual(log.active_theme, "unknown")

    @override_settings(ENABLE_VISITOR_LOGGING=False)
    def test_disabled_visitor_logging(self):
        """Verifies that when logging is toggled off in settings, nothing is saved to DB."""
        payload = {
            "path": "/",
            "device_category": "desktop",
            "screen_resolution": "1920x1080",
            "active_theme": "dark"
        }
        response = self.client.post(self.log_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('status'), 'disabled')
        self.assertEqual(VisitorLog.objects.count(), 0)

    def test_admin_access_protection(self):
        """Ensures that only logged-in superusers can view the visitor analytics admin page."""
        admin_url = reverse('admin:analytics_visitorlog_changelist')
        
        # Unauthenticated request redirects to admin login
        response = self.client.get(admin_url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn('/admin/login/', response.url)

        # Non-staff user cannot access admin
        user = User.objects.create_user(username='visitor', password='password123', is_staff=False)
        self.client.force_authenticate(user=user)
        response = self.client.get(admin_url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

        # Superuser / staff with permissions CAN access admin
        superuser = User.objects.create_superuser(username='admin_super', password='password123', email='admin@test.com')
        self.client.force_login(superuser)
        response = self.client.get(admin_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_database_error_isolation(self):
        """Verifies server returns a clean 500 error if the database write fails."""
        from unittest.mock import patch
        with patch('apps.analytics.serializers.VisitorLogSerializer.save', side_effect=Exception("Simulated database failure")):
            payload = {
                "path": "/",
                "device_category": "desktop",
                "screen_resolution": "1920x1080",
                "active_theme": "dark"
            }
            response = self.client.post(self.log_url, payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
            self.assertIn('error', response.data)

    def test_record_rough_location(self):
        """Verifies city, state, country, and timezone location strings are recorded accurately."""
        payload = {
            "path": "/",
            "device_category": "desktop",
            "screen_resolution": "1920x1080",
            "active_theme": "dark",
            "city": "Ahmedabad",
            "region": "Gujarat",
            "country": "IN",
            "timezone": "Asia/Kolkata"
        }
        response = self.client.post(self.log_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        log = VisitorLog.objects.latest('created_at')
        self.assertEqual(log.city, "Ahmedabad")
        self.assertEqual(log.region, "Gujarat")
        self.assertEqual(log.country, "IN")
        self.assertEqual(log.timezone, "Asia/Kolkata")
        self.assertIn("Ahmedabad", log.location_display)
        self.assertIn("Gujarat", log.location_display)
        self.assertIn("IN", log.location_display)

    def test_record_exact_location(self):
        """Verifies GPS coordinate floats are saved with high precision."""
        payload = {
            "path": "/#skills",
            "device_category": "mobile",
            "screen_resolution": "390x844",
            "active_theme": "light",
            "city": "Gandhinagar",
            "country": "IN",
            "latitude": 23.215635,
            "longitude": 72.636941
        }
        response = self.client.post(self.log_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        log = VisitorLog.objects.latest('created_at')
        self.assertEqual(float(log.latitude), 23.215635)
        self.assertEqual(float(log.longitude), 72.636941)
        self.assertIn("GPS:", log.location_display)

    def test_cloudflare_geo_headers_fallback(self):
        """Verifies fallback to HTTP headers if client does not supply location data."""
        payload = {
            "path": "/#projects",
            "device_category": "desktop",
            "screen_resolution": "2560x1440",
            "active_theme": "dark"
        }
        response = self.client.post(
            self.log_url,
            payload,
            format='json',
            HTTP_CF_IPCITY="London",
            HTTP_CF_REGION="England",
            HTTP_CF_IPCOUNTRY="GB",
            HTTP_CF_TIMEZONE="Europe/London"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        log = VisitorLog.objects.latest('created_at')
        self.assertEqual(log.city, "London")
        self.assertEqual(log.country, "GB")
        self.assertEqual(log.timezone, "Europe/London")
        self.assertIn("London", log.location_display)
