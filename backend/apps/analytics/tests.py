from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from apps.analytics.models import VisitorLog, AnalyticsSession, AnalyticsPageView, AnalyticsEvent

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

    def test_record_rough_location(self):
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


class AnalyticsEngineTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.session_url = reverse('analytics:analytics-session')
        self.pageview_url = reverse('analytics:analytics-pageview')
        self.event_url = reverse('analytics:analytics-event')
        self.beacon_url = reverse('analytics:analytics-beacon')
        self.dash_data_url = reverse('analytics:analytics-dashboard-data')
        self.admin_user = User.objects.create_superuser('admin_test', 'admin@example.com', 'pass1234')

    def test_session_lifecycle_and_heartbeat(self):
        # 1. Start Session
        init_payload = {
            "session_id": "sess-test-101",
            "visitor_id": "vis-anon-999",
            "landing_page": "/",
            "current_page": "/",
            "referrer": "https://www.google.com/search?q=hil+patel",
            "device_category": "desktop",
            "screen_resolution": "1920x1080",
            "active_seconds_delta": 5,
        }
        res1 = self.client.post(self.session_url, init_payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        session = AnalyticsSession.objects.get(session_id="sess-test-101")
        self.assertEqual(session.visitor_id, "vis-anon-999")
        self.assertEqual(session.referrer_source, "search")
        self.assertEqual(session.total_active_seconds, 5)
        self.assertTrue(session.is_bounce)

        # 2. Heartbeat update adding 15 seconds of active dwell
        heartbeat_payload = {
            "session_id": "sess-test-101",
            "visitor_id": "vis-anon-999",
            "current_page": "/#projects",
            "active_seconds_delta": 15,
        }
        res2 = self.client.post(self.session_url, heartbeat_payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

        session.refresh_from_db()
        self.assertEqual(session.total_active_seconds, 20)
        self.assertEqual(session.exit_page, "/#projects")
        self.assertFalse(session.is_bounce)  # > 10s active duration is not a bounce

    def test_pageview_navigation(self):
        AnalyticsSession.objects.create(
            session_id="sess-test-102",
            visitor_id="vis-2",
            started_at=timezone.now(),
            last_activity_at=timezone.now(),
            landing_page="/"
        )
        pv_payload = {
            "session_id": "sess-test-102",
            "page_path": "/#about",
            "title": "About Hil Patel",
            "active_seconds_delta": 8
        }
        res = self.client.post(self.pageview_url, pv_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        pv = AnalyticsPageView.objects.get(session__session_id="sess-test-102", page_path="/#about")
        self.assertEqual(pv.active_seconds, 8)
        self.assertTrue(pv.is_exit)

    def test_event_tracking(self):
        AnalyticsSession.objects.create(
            session_id="sess-test-103",
            visitor_id="vis-3",
            started_at=timezone.now(),
            last_activity_at=timezone.now()
        )
        event_payload = {
            "session_id": "sess-test-103",
            "event_id": "ev-uuid-1",
            "page_path": "/#projects",
            "event_type": "project_link_clicked",
            "element_category": "link",
            "element_label": "Digital Wellbeing Repo",
            "destination_url": "https://github.com/hilpatelss/Digital-Wellbeing-Dashboard"
        }
        res = self.client.post(self.event_url, event_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        ev = AnalyticsEvent.objects.get(session__session_id="sess-test-103", event_type="project_link_clicked")
        self.assertEqual(ev.element_label, "Digital Wellbeing Repo")

    def test_beacon_flush(self):
        session = AnalyticsSession.objects.create(
            session_id="sess-test-104",
            visitor_id="vis-4",
            started_at=timezone.now(),
            last_activity_at=timezone.now(),
            total_active_seconds=10
        )
        beacon_payload = {
            "session_id": "sess-test-104",
            "active_seconds_delta": 12,
            "current_page": "/#contact",
            "is_closing": True
        }
        res = self.client.post(self.beacon_url, beacon_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        session.refresh_from_db()
        self.assertEqual(session.total_active_seconds, 22)
        self.assertEqual(session.exit_page, "/#contact")
        self.assertIsNotNone(session.ended_at)

    def test_admin_dashboard_permissions(self):
        # 1. Unauthenticated request to staff API gets 401 or 403
        res = self.client.get(self.dash_data_url)
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # 2. Staff user succeeds
        self.client.force_authenticate(user=self.admin_user)
        res_auth = self.client.get(self.dash_data_url + '?days=7d')
        self.assertEqual(res_auth.status_code, status.HTTP_200_OK)
        self.assertIn('summary', res_auth.data)
        self.assertIn('daily_trend', res_auth.data)
        self.assertIn('device_breakdown', res_auth.data)
