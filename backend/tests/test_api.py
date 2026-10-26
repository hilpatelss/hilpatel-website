from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.site_settings.models import SiteSettings, DesignSettings, NavigationItem, SectionConfig
from apps.portfolio.models import SkillCategory, Skill, Education, Certification, CertificationCategory, Achievement, TickerItem
from apps.projects.models import Project, ProjectCategory, TechnologyTag, ProjectHighlight

class PortfolioAPITests(TestCase):
    def setUp(self):
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
        url = reverse('site-settings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['owner_name'], "Hil Patel")

    def test_design_settings_endpoint(self):
        url = reverse('design-settings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['accent_color'], "#c7ff5e")

    def test_projects_list_only_returns_published(self):
        url = reverse('project-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [p['slug'] for p in response.data]
        self.assertIn("digital-wellbeing-analytics", slugs)
        self.assertNotIn("secret-draft-project", slugs)

    def test_projects_category_filter(self):
        url = f"{reverse('project-list')}?category=power-bi"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_project_detail_by_slug(self):
        url = reverse('project-detail', kwargs={'slug': 'digital-wellbeing-analytics'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Digital Wellbeing Analytics")

    def test_unpublished_project_detail_returns_404(self):
        url = reverse('project-detail', kwargs={'slug': 'secret-draft-project'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

