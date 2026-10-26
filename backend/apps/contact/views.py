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
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact'

    def post(self, request, *args, **kwargs):
        # Check if contact is enabled in SiteSettings
        site_settings = SiteSettings.load()
        if not site_settings.contact_enabled:
            return Response(
                {"error": "The contact form is currently paused by the administrator."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        serializer = ContactSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation error",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:300]

        # Save valid submission
        contact_message = serializer.save(
            ip_address=ip,
            user_agent=user_agent,
            is_read=False,
            status='new'
        )

        # Dispatch notification email safely to administrator
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
                fail_silently=True,
            )
        except Exception as e:
            # Catch email delivery errors so client request succeeds and message is preserved
            logger.warning("Failed to dispatch contact notification email: %s", str(e))

        return Response(
            {
                "status": "success",
                "message": "Message sent successfully! Thanks for reaching out.",
                "id": contact_message.id
            },
            status=status.HTTP_201_CREATED
        )

