"""
==============================================================================
Contact Form Automated Tests (test_contact.py)
==============================================================================

WHAT IS THIS FILE?
This file contains automated tests for the contact form submission endpoint
(`/api/v1/contact/submit/`).

WHAT IS BEING VERIFIED?
1. Valid submission: Legitimate message from a recruiter is accepted and saved.
2. Honeypot anti-spam defense: Hidden field trapped bots are rejected with 400 Bad Request.
3. Message length validation: Messages with fewer than 10 characters are rejected.
4. Feature flag toggle: When contact is disabled in admin settings, the API returns 503 Service Unavailable.
5. Privacy protection: Public GET requests are forbidden (405 Method Not Allowed) to prevent snooping on private messages.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.contact.models import ContactMessage
from apps.site_settings.models import SiteSettings

class ContactAPITests(TestCase):
    """Automated tests for contact form processing and security."""

    def setUp(self):
        """Prepares a test client and turns on the contact form setting before each test."""
        self.client = APIClient()
        self.contact_url = reverse('contact-submit')
        self.site_settings = SiteSettings.load()
        self.site_settings.contact_enabled = True
        self.site_settings.save()

    def test_valid_contact_submission(self):
        """Verifies that a genuine contact message is validated, saved to database, and marked 'new'."""
        payload = {
            "name": "Jane Recruiter",
            "email": "jane@techcompany.com",
            "message": "Hi Hil, we have an opening for a Data Analyst role and loved your dashboards.",
            "website": "",  # Empty honeypot (genuine humans leave this blank)
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
        """Verifies that automated bots filling the hidden 'website' honeypot field are blocked immediately."""
        payload = {
            "name": "Spam Bot",
            "email": "bot@spamnetwork.com",
            "message": "Click here to buy backlinks for your portfolio website.",
            "website": "http://spamsite.xyz",  # Filled honeypot indicates a bot
        }
        response = self.client.post(self.contact_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Verify bot submission was NOT saved in database
        self.assertFalse(ContactMessage.objects.filter(email="bot@spamnetwork.com").exists())

    def test_short_message_validation(self):
        """Verifies that messages shorter than 10 characters are rejected with helpful validation errors."""
        payload = {
            "name": "User",
            "email": "user@example.com",
            "message": "Too short",  # < 10 chars
            "website": "",
        }
        response = self.client.post(self.contact_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_disabled_contact_form(self):
        """Verifies that if Hil turns off contact forms in the admin panel, the endpoint returns 503."""
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
        """CRITICAL PRIVACY TEST: Contact messages must NEVER be publicly readable via GET requests."""
        response = self.client.get(self.contact_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

