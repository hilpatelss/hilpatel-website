from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from apps.analytics.models import VisitorLog

class VisitorLogTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.log_url = reverse('analytics:visitor-log')

    def test_record_valid_visitor_log(self):
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
        # Visitor log admin URL
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
