import os

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Creates a production superuser when explicitly enabled."

    def handle(self, *args, **options):
        enabled = os.getenv("CREATE_ADMIN_ON_DEPLOY", "").lower()

        if enabled not in ("true", "1", "yes"):
            self.stdout.write(
                "Admin creation is disabled. No account changes made."
            )
            return

        username = (
            os.getenv("ADMIN_USERNAME", "").strip()
            or os.getenv("DJANGO_SUPERUSER_USERNAME", "").strip()
        )
        email = (
            os.getenv("ADMIN_EMAIL", "").strip()
            or os.getenv("DJANGO_SUPERUSER_EMAIL", "").strip()
        )
        password = (
            os.getenv("ADMIN_PASSWORD", "")
            or os.getenv("DJANGO_SUPERUSER_PASSWORD", "")
        )

        if not username or not email or not password:
            raise CommandError(
                "Set ADMIN_USERNAME (or DJANGO_SUPERUSER_USERNAME), "
                "ADMIN_EMAIL (or DJANGO_SUPERUSER_EMAIL), and "
                "ADMIN_PASSWORD (or DJANGO_SUPERUSER_PASSWORD) "
                "in the deployment environment."
            )

        User = get_user_model()
        user = User.objects.filter(username=username).first()

        if user:
            if user.is_superuser:
                self.stdout.write(
                    self.style.WARNING(
                        f"Superuser '{username}' already exists. "
                        "No changes made."
                    )
                )
                return

            raise CommandError(
                f"Username '{username}' already belongs to a non-superuser. "
                "Choose a different ADMIN_USERNAME."
            )

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Superuser '{username}' created successfully."
            )
        )