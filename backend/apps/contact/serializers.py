"""
==============================================================================
Contact Submission Serializer (apps/contact/serializers.py)
==============================================================================

WHAT IS THIS FILE?
Validates the contact form inputs sent by the website visitor:
1. Name validation: Strips whitespace and enforces 2 to 120 characters.
2. Email validation: Checks that the email is a valid web email address.
3. Message validation: Enforces at least 10 characters to prevent empty pings.
4. Honeypot check: If the hidden `website` field has ANY content, marks it as spam!
"""

from rest_framework import serializers
from django.conf import settings
from .models import ContactMessage

class ContactSubmissionSerializer(serializers.ModelSerializer):
    # Honeypot field: invisible to human users, but filled by automated spam bots
    website = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        help_text="Spam protection honeypot field. Must be left blank."
    )

    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message', 'website']
        extra_kwargs = {
            'name': {'min_length': 2, 'max_length': 120},
            'subject': {'required': False, 'max_length': 200},
            'message': {'min_length': 10, 'max_length': 4000},
        }

    def validate_name(self, value):
        trimmed = value.strip()
        if len(trimmed) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return trimmed

    def validate_message(self, value):
        trimmed = value.strip()
        if len(trimmed) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return trimmed

    def validate(self, attrs):
        # Honeypot anti-spam check: humans leave this blank; bots fill it out
        honeypot = attrs.pop('website', '')
        if honeypot:
            raise serializers.ValidationError({"spam": "Spam detected."})
        return attrs


