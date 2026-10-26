import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Creates a default superuser if none exists."

    def add_arguments(self, parser):
        parser.add_argument('--username', default=os.getenv('ADMIN_USERNAME', 'admin'))
        parser.add_argument('--email', default=os.getenv('ADMIN_EMAIL', 'hilpatelss@gmail.com'))
        parser.add_argument('--password', default=os.getenv('ADMIN_PASSWORD', 'admin12345'))

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        email = options['email']
        password = options['password']

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"Superuser '{username}' already exists."))
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"✓ Superuser '{username}' created successfully! (password: {password})"))

