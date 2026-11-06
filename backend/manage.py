#!/usr/bin/env python
"""
==============================================================================
Django Management Command-Line Utility (manage.py)
==============================================================================

WHAT IS THIS FILE?
`manage.py` is the central command center for this Python Django backend.
Think of it like a remote control for running administrative tasks.

COMMON COMMANDS YOU CAN RUN WITH THIS FILE:
- `python manage.py runserver`      -> Starts the local development backend server
- `python manage.py migrate`        -> Applies database table updates
- `python manage.py makemigrations` -> Detects changes in models.py and creates SQL scripts
- `python manage.py createsuperuser`-> Creates an admin account to log into /admin/
- `python manage.py test`           -> Runs automated unit tests to verify backend logic

HOW DOES IT WORK?
It points Django to the settings configuration at `config.settings` and passes
your command-line arguments (like `runserver` or `test`) to Django's execution engine.
"""
import os
import sys

def main():
    """Run administrative tasks."""
    # Point Django to the main configuration file in backend/config/settings.py
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    # Run the requested command with whatever arguments were typed in the terminal
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()


