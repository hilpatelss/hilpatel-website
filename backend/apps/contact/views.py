"""
==============================================================================
Contact Submission API View (apps/contact/views.py)
==============================================================================

WHAT IS THIS FILE?
Handles incoming contact form submissions from the React frontend.

SECURITY & RESILIENCE FEATURES:
1. Rate Limiting (`throttle_scope = 'contact'`): Prevents spam bots from hammering the form.
2. IP Extraction (`get_client_ip`): Reads the real visitor IP through Cloudflare headers.
3. Master Toggle: Respects `site_settings.contact_enabled` (returns 503 if paused).
4. Safe Email Dispatch: Attempts to email Hil Patel immediately when a message arrives.
   If the email fails (e.g. SMTP server timeout), it fails silently so the user's
   message is still safely saved in the database!
"""

import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings
from django.core.mail import send_mail
from .serializers import ContactSubmissionSerializer
from apps.site_settings.models import SiteSettings

logger = logging.getLogger(__name__)

def get_client_ip(request):
    """Safely extracts the client IP address from proxy headers or remote addr."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

class ContactSubmissionView(APIView):
    """
    Receives contact form submissions.
    Validates name, email, message, and checks the honeypot anti-spam trap.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact'  # Throttled according to settings.REST_FRAMEWORK rate limits

    def post(self, request, *args, **kwargs):
        # 1. Check if contact form is paused in SiteSettings
        site_settings = SiteSettings.load()
        if not site_settings.contact_enabled:
            return Response(
                {"error": "The contact form is currently paused by the administrator."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # 2. Validate incoming JSON data
        serializer = ContactSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation error",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Collect client network metadata
        ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:300]

        # 4. Save valid submission to the database
        contact_message = serializer.save(
            ip_address=ip,
            user_agent=user_agent,
            is_read=False,
            status='new'
        )

        # 5. Dispatch notification email safely to administrator
        try:
            admin_email = getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', 'hilpatelss@gmail.com')
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@hilpatel.com')
            email_subject = f"[Portfolio Contact] New message from {contact_message.name}"
            email_body = (
                f"You received a new message through your portfolio contact form.\n\n"
                f"From: {contact_message.name} <{contact_message.email}>\n"
                f"Date: {contact_message.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                f"IP: {ip}\n\n"
                f"Message:\n{contact_message.message}\n\n"
                f"---\nManage this inquiry at: /admin/contact/contactmessage/{contact_message.id}/change/"
            )
            send_mail(
                subject=email_subject,
                message=email_body,
                from_email=from_email,
                recipient_list=[admin_email],
                fail_silently=True,  # Ensures client receives success even if mail server fails
            )
        except Exception as e:
            logger.warning("Failed to dispatch contact notification email: %s", str(e))

        # 6. Return friendly success confirmation
        return Response(
            {
                "status": "success",
                "message": "Message sent successfully! Thanks for reaching out.",
                "id": contact_message.id
            },
            status=status.HTTP_201_CREATED
        )


