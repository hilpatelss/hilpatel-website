"""
==============================================================================
Portfolio Core API Automated Tests (test_api.py)
==============================================================================

WHAT IS THIS FILE?
This file contains automated tests for all public REST API endpoints used by
the React frontend.

WHAT IS BEING VERIFIED?
1. `/api/v1/bootstrap/`: Consolidated payload containing site metadata, theme colors, navigation, and sections.
2. `/api/v1/settings/`: Individual site identity settings endpoint.
3. `/api/v1/settings/design/`: Design and theme tokens endpoint.
4. `/api/v1/projects/`: Project list endpoint, confirming that draft / unpublished projects are NEVER leaked.
5. Category filtering: Ensures `?category=power-bi` returns only matching items.
6. Detail view: Verifies published project details load by slug, and drafts return 404 Not Found.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.site_settings.models import SiteSettings, DesignSettings, NavigationItem, SectionConfig
from apps.portfolio.models import SkillCategory, Skill, Education, Certification, CertificationCategory, Achievement, TickerItem
from apps.projects.models import Project, ProjectCategory, TechnologyTag, ProjectHighlight

class PortfolioAPITests(TestCase):
    """Integration test suite for portfolio data retrieval endpoints."""

    def setUp(self):
        """Sets up mock database records in memory before each test runs."""
        self.client = APIClient()
        
        # Site settings
        self.site_settings = SiteSettings.load()
        self.site_settings.site_title = "Hil Patel Portfolio / 2026"
        self.site_settings.owner_name = "Hil Patel"
        self.site_settings.save()

        # Design settings
        self.design_settings = DesignSettings.load()
        self.design_settings.accent_color = "#c7ff5e"
        self.design_settings.save()

        # Navigation
        self.nav_item = NavigationItem.objects.create(
            label="About",
            url="#about",
            display_order=1,
            is_visible=True
        )

        # Category and Projects
        self.category_powerbi = ProjectCategory.objects.create(name="Power BI", slug="power-bi", display_order=1)
        self.tag_dax = TechnologyTag.objects.create(name="DAX", slug="dax")
        
        # Published project (should be visible)
        self.published_project = Project.objects.create(
            number="01",
            title="Digital Wellbeing Analytics",
            slug="digital-wellbeing-analytics",
            category=self.category_powerbi,
            short_description="An interactive dashboard exploring smartphone usage.",
            is_published=True,
            is_featured=True,
            display_order=1
        )
        self.published_project.tags.add(self.tag_dax)

        # Unpublished draft project (must NOT be visible publicly)
        self.unpublished_project = Project.objects.create(
            number="99",
            title="Secret Draft Project",
            slug="secret-draft-project",
            category=self.category_powerbi,
            short_description="Work in progress.",
            is_published=False,
            display_order=99
        )

    def test_bootstrap_endpoint(self):
        """Ensures the all-in-one /bootstrap/ endpoint returns all necessary data in 1 request."""
        url = reverse('bootstrap-data')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('site', response.data)
        self.assertIn('design', response.data)
        self.assertIn('navigation', response.data)
        self.assertIn('sections', response.data)
        self.assertEqual(response.data['site']['owner_name'], "Hil Patel")
        self.assertEqual(response.data['design']['accent_color'], "#c7ff5e")

    def test_site_settings_endpoint(self):
        """Verifies /api/v1/settings/ returns site identity information."""
        url = reverse('site-settings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['owner_name'], "Hil Patel")

    def test_design_settings_endpoint(self):
        """Verifies /api/v1/settings/design/ returns design tokens."""
        url = reverse('design-settings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['accent_color'], "#c7ff5e")

    def test_projects_list_only_returns_published(self):
        """CRITICAL SECURITY CHECK: Unpublished draft projects must never appear in public lists."""
        url = reverse('project-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [p['slug'] for p in response.data]
        self.assertIn("digital-wellbeing-analytics", slugs)
        self.assertNotIn("secret-draft-project", slugs)

    def test_projects_category_filter(self):
        """Ensures ?category= filter correctly narrows down the returned projects."""
        url = f"{reverse('project-list')}?category=power-bi"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_project_detail_by_slug(self):
        """Verifies that accessing a published project by its slug returns full project details."""
        url = reverse('project-detail', kwargs={'slug': 'digital-wellbeing-analytics'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Digital Wellbeing Analytics")

    def test_unpublished_project_detail_returns_404(self):
        """Verifies that attempting to view an unpublished draft by direct URL returns 404 Not Found."""
        url = reverse('project-detail', kwargs={'slug': 'secret-draft-project'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

