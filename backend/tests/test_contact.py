from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.contact.models import ContactMessage
from apps.site_settings.models import SiteSettings

class ContactAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.contact_url = reverse('contact-submit')
        self.site_settings = SiteSettings.load()
        self.site_settings.contact_enabled = True
        self.site_settings.save()

    def test_valid_contact_submission(self):
        payload = {
            "name": "Jane Recruiter",
            "email": "jane@techcompany.com",
            "message": "Hi Hil, we have an opening for a Data Analyst role and loved your dashboards.",
            "website": "",  # Empty honeypot
        }
        response = self.client.post(self.contact_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get('status'), 'success')
        
        # Verify saved in database
        message_obj = ContactMessage.objects.filter(email="jane@techcompany.com").first()
        self.assertIsNotNone(message_obj)
        self.assertEqual(message_obj.name, "Jane Recruiter")
        self.assertEqual(message_obj.status, "new")
        self.assertFalse(message_obj.is_read)

    def test_honeypot_spam_rejection(self):
        payload = {
            "name": "Spam Bot",
            "email": "bot@spamnetwork.com",
            "message": "Click here to buy backlinks for your portfolio website.",
            "website": "http://spamsite.xyz",  # Filled honeypot
        }
        response = self.client.post(self.contact_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Verify not saved in database
        self.assertFalse(ContactMessage.objects.filter(email="bot@spamnetwork.com").exists())

    def test_short_message_validation(self):
        payload = {
            "name": "User",
            "email": "user@example.com",
            "message": "Too short",  # < 10 chars
            "website": "",
        }
        response = self.client.post(self.contact_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_disabled_contact_form(self):
        self.site_settings.contact_enabled = False
        self.site_settings.save()

        payload = {
            "name": "Jane Recruiter",
            "email": "jane@techcompany.com",
            "message": "Hi Hil, we have an opening for a Data Analyst role.",
            "website": "",
        }
        response = self.client.post(self.contact_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def test_no_public_message_listing(self):
        # Contact endpoint must not allow GET requests from unauthenticated clients
        response = self.client.get(self.contact_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

