from rest_framework import serializers
from django.conf import settings
from .models import ContactMessage

class ContactSubmissionSerializer(serializers.ModelSerializer):
    # Honeypot field: bots usually fill hidden form inputs
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
        # Honeypot validation
        honeypot = attrs.pop('website', '')
        if honeypot:
            raise serializers.ValidationError({"spam": "Spam detected."})
        return attrs

