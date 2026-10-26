from django.core.management.base import BaseCommand
from django.db import transaction
from apps.site_settings.models import SiteSettings, DesignSettings, NavigationItem, SectionConfig, HeroMetric
from apps.portfolio.models import (
    TickerItem,
    AboutStat,
    SkillCategory,
    Skill,
    Education,
    CertificationCategory,
    Certification,
    Achievement,
)
from apps.projects.models import (
    ProjectCategory,
    TechnologyTag,
    Project,
    ProjectHighlight,
)

class Command(BaseCommand):
    help = "Seeds database with authentic portfolio data matching original Hil Patel portfolio frontend."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding portfolio data..."))

        # 1. Site Settings
        site_settings = SiteSettings.load()
        site_settings.site_title = "Hil Patel Portfolio / 2026"
        site_settings.brand_mark_initial = "H"
        site_settings.brand_mark_accent = "."
        site_settings.owner_name = "Hil Patel"
        site_settings.professional_headline = "Data Analyst"
        site_settings.location = "Gandhinagar, Gujarat, India"
        site_settings.email = "hilpatelss@gmail.com"
        site_settings.linkedin_url = "https://linkedin.com/in/hilpatelss"
        site_settings.github_url = "https://github.com/hilpatelss"
        site_settings.intro_text = "I turn raw data into clear insights and practical decisions."
        site_settings.summary_text = (
            "Computer Engineering graduate with hands-on experience in data analysis, "
            "dashboard development, and business reporting. I work with Python, SQL, Excel, "
            "Power BI, and data visualization to make complex information easier to understand."
        )
        site_settings.hero_eyebrow = "OPEN TO ENTRY-LEVEL OPPORTUNITIES"
        site_settings.hero_kicker = "DATA ANALYTICS · BUSINESS INTELLIGENCE · PYTHON"
        site_settings.hero_headline_greeting = "Hi, I'm Hil."
        site_settings.hero_headline_line1 = "I make data"
        site_settings.hero_headline_line2 = "make sense"
        site_settings.hero_primary_button_text = "Explore my work"
        site_settings.hero_primary_button_url = "#projects"
        site_settings.hero_secondary_button_text = "Download resume"
        site_settings.hero_secondary_button_url = "/resume.pdf"
        site_settings.about_large_copy = (
            "I enjoy finding the signal in the noise — cleaning data, asking better questions, "
            "and turning analysis into something people can act on."
        )
        site_settings.about_body_copy = (
            "My work spans exploratory data analysis, interactive Power BI dashboards, and a Django-based "
            "billing system. I like connecting the technical details with the bigger business question: "
            "what does the data actually tell us?"
        )
        site_settings.footer_tagline = "Turning questions into insights, one dataset at a time."
        site_settings.footer_copyright = "© 2026 Hil Patel. Built with intention."
        site_settings.footer_tech_stack = "REACT · DJANGO REST FRAMEWORK"
        site_settings.footer_location = "GUJARAT, INDIA"
        site_settings.contact_enabled = True
        site_settings.contact_availability_status = "Open to entry-level roles"
        site_settings.contact_pitch = (
            "I'm interested in entry-level Data Analyst opportunities and conversations about "
            "analytics, dashboards, and data-driven problem solving."
        )
        site_settings.save()
        self.stdout.write(self.style.SUCCESS("✓ SiteSettings configured."))

        # 2. Design Settings
        design_settings = DesignSettings.load()
        design_settings.theme_name = "Executive Emerald Slate"
        design_settings.accent_color = "#10b981"
        design_settings.accent2_color = "#06b6d4"
        design_settings.dark_bg = "#0a0d14"
        design_settings.dark_surface = "#111726"
        design_settings.dark_surface2 = "#172033"
        design_settings.dark_text = "#f8fafc"
        design_settings.dark_muted = "#94a3b8"
        design_settings.dark_line = "#1e293b"
        design_settings.light_bg = "#f8fafc"
        design_settings.light_surface = "#ffffff"
        design_settings.light_surface2 = "#f1f5f9"
        design_settings.light_text = "#0f172a"
        design_settings.light_muted = "#64748b"
        design_settings.light_line = "#e2e8f0"
        design_settings.light_accent = "#059669"
        design_settings.font_family_main = "'Manrope', sans-serif"
        design_settings.font_family_mono = "'DM Mono', monospace"
        design_settings.border_radius = "4px"
        design_settings.enable_animations = True
        design_settings.save()
        self.stdout.write(self.style.SUCCESS("✓ DesignSettings configured."))

        # 3. Navigation Items
        nav_data = [
            ("About", "#about", 1),
            ("Projects", "#projects", 2),
            ("Skills", "#skills", 3),
            ("Education", "#education", 4),
            ("Certifications", "#certifications", 5),
        ]
        for label, url, order in nav_data:
            NavigationItem.objects.update_or_create(
                label=label,
                defaults={"url": url, "display_order": order, "is_visible": True, "is_external": False}
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(nav_data)} Navigation items seeded."))

        # 4. Section Config
        sections_data = [
            ("about", "01 / ABOUT", "Curious by nature.", "Analytical by design.", "", 1),
            ("projects", "02 / SELECTED WORK", "Projects with a", "point of view.", "Practical analytics work, from exploration to interactive reporting.", 2),
            ("skills", "03 / TOOLKIT", "Tools I use to", "find the story.", "", 3),
            ("education", "04 / EDUCATION", "Built on a foundation", "of engineering.", "", 4),
            ("certifications", "05 / CERTIFICATIONS", "Learning that", "keeps moving.", "Credentials listed on my resume, grouped by learning area.", 5),
            ("achievements", "06 / HIGHLIGHTS", "Work that turns", "into outcomes.", "", 6),
            ("contact", "07 / CONTACT", "Have a role or", "project in mind?", "", 7),
        ]
        for key, idx, t1, t2, note, order in sections_data:
            SectionConfig.objects.update_or_create(
                section_key=key,
                defaults={
                    "index_label": idx,
                    "title_line1": t1,
                    "title_line2": t2,
                    "heading_note": note,
                    "display_order": order,
                    "is_visible": True,
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(sections_data)} Sections configured."))

        # 5. Hero Metric Pills
        metrics_data = [
            ("Code2", "Python · SQL · Power BI", 1),
            ("GraduationCap", "Computer Engineering · 2026", 2),
        ]
        for icon, text, order in metrics_data:
            HeroMetric.objects.update_or_create(
                text=text,
                defaults={"icon_name": icon, "display_order": order, "is_visible": True}
            )

        # 6. Ticker items
        ticker_keywords = [
            "PYTHON", "SQL", "POWER BI", "EXCEL", "PANDAS",
            "DAX", "POSTGRESQL", "DATA STORYTELLING", "DATA CLEANING"
        ]
        for idx, kw in enumerate(ticker_keywords, start=1):
            TickerItem.objects.update_or_create(
                text=kw,
                defaults={"display_order": idx, "is_visible": True}
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(ticker_keywords)} Ticker items seeded."))

        # 7. About Stats
        stats_data = [
            ("03", "Featured projects", "Dashboards & applications", False, "", 1),
            ("02", "Certifications", "Listed in resume", False, "", 2),
            ("05+", "Tool categories", "From Python to BI", False, "", 3),
            ("", "My focus", "Useful insights, clear reporting", True, "ChartNoAxesCombined", 4),
        ]
        for num, label, detail, is_accent, icon, order in stats_data:
            AboutStat.objects.update_or_create(
                label=label,
                defaults={
                    "number": num,
                    "detail": detail,
                    "is_accent": is_accent,
                    "icon_name": icon,
                    "display_order": order,
                    "is_visible": True,
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(stats_data)} About stats seeded."))

        # 8. Skill Categories and Skills
        skills_tree = [
            ("Languages", ["Python", "SQL"], 1),
            ("Data analysis", ["Pandas", "NumPy", "Data Cleaning", "Exploratory Data Analysis"], 2),
            ("Visualization", ["Power BI", "Excel", "Matplotlib", "DAX"], 3),
            ("Databases", ["PostgreSQL", "SQLite"], 4),
            ("Tools & development", ["Git", "GitHub", "VS Code", "Django", "REST APIs"], 5),
        ]
        for cat_name, items, cat_order in skills_tree:
            cat_obj, _ = SkillCategory.objects.update_or_create(
                name=cat_name,
                defaults={"display_order": cat_order, "is_visible": True}
            )
            for skill_order, item_name in enumerate(items, start=1):
                Skill.objects.update_or_create(
                    category=cat_obj,
                    name=item_name,
                    defaults={"display_order": skill_order, "is_visible": True}
                )
        self.stdout.write(self.style.SUCCESS("✓ Skill categories and tools seeded."))

        # 9. Education
        edu_data = [
            (
                "Bachelor of Engineering",
                "Computer Engineering",
                "SVBIT · Gujarat Technological University (GTU)",
                "2026",
                "Undergraduate degree in Computer Engineering.",
                "COMPLETED",
                1
            ),
            (
                "Diploma in Engineering",
                "Computer Engineering",
                "SSP · Gujarat Technological University (GTU)",
                "2023",
                "Diploma in Computer Engineering.",
                "COMPLETED",
                2
            ),
        ]
        for deg, field, inst, yr, detail, badge, order in edu_data:
            Education.objects.update_or_create(
                degree=deg,
                field_of_study=field,
                defaults={
                    "institution": inst,
                    "year_display": yr,
                    "detail": detail,
                    "badge_text": badge,
                    "display_order": order,
                    "is_visible": True,
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(edu_data)} Education items seeded."))

        # 10. Certifications
        cert_cats = {
            "Data Analytics": CertificationCategory.objects.update_or_create(name="Data Analytics", defaults={"display_order": 1})[0],
            "Development": CertificationCategory.objects.update_or_create(name="Development", defaults={"display_order": 2})[0],
        }
        certs_data = [
            (
                "Data Analytics Certification",
                "Adani Skills & Development Center",
                cert_cats["Data Analytics"],
                "Listed on resume",
                "",
                1
            ),
            (
                "Python / Django / Web Development",
                "Moltech Solutions Pvt. Ltd.",
                cert_cats["Development"],
                "Listed on resume",
                "",
                2
            ),
        ]
        for title, issuer, cat, status, url, order in certs_data:
            Certification.objects.update_or_create(
                title=title,
                issuer=issuer,
                defaults={
                    "category": cat,
                    "status_text": status,
                    "credential_url": url,
                    "display_order": order,
                    "is_visible": True,
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(certs_data)} Certifications seeded."))

        # 11. Achievements
        achievements_data = [
            (
                "01",
                "Interactive BI dashboards",
                "Built Power BI dashboards with KPI cards, slicers, DAX measures, and analytical visuals.",
                "BarChart3",
                1
            ),
            (
                "02",
                "Data cleaning & EDA",
                "Explored datasets to identify patterns and trends across demographic and behavioural dimensions.",
                "Search",
                2
            ),
            (
                "03",
                "End-to-end analytics",
                "Combined Python, SQL, and Power BI across projects, connecting data processing to reporting.",
                "Database",
                3
            ),
        ]
        for num, title, desc, icon, order in achievements_data:
            Achievement.objects.update_or_create(
                achievement_number=num,
                title=title,
                defaults={
                    "description": desc,
                    "icon_name": icon,
                    "display_order": order,
                    "is_visible": True,
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(achievements_data)} Achievements seeded."))

        # 12. Projects, Categories, Tags, and Highlights
        proj_cat_powerbi, _ = ProjectCategory.objects.update_or_create(
            name="Power BI", defaults={"slug": "power-bi", "display_order": 1}
        )
        proj_cat_fullstack, _ = ProjectCategory.objects.update_or_create(
            name="Full-stack", defaults={"slug": "full-stack", "display_order": 2}
        )

        all_tags = {}
        for tag_name in ["Power BI", "Excel", "DAX", "EDA", "Django", "PostgreSQL", "Python"]:
            t, _ = TechnologyTag.objects.update_or_create(name=tag_name)
            all_tags[tag_name] = t

        projects_data = [
            {
                "number": "01",
                "title": "Digital Wellbeing Analytics",
                "slug": "digital-wellbeing-analytics",
                "category": proj_cat_powerbi,
                "tags": ["Power BI", "Excel", "DAX", "EDA"],
                "repository_url": "https://github.com/hilpatelss/Digital-Wellbeing-Dashboard",
                "custom_art_type": "kpi_bars",
                "icon_name": "BarChart3",
                "short_description": (
                    "An interactive dashboard exploring smartphone usage and digital wellbeing across focus "
                    "score, screen time, notifications, phone unlocks, stress, and high-risk users."
                ),
                "highlights": [
                    "KPI cards for key wellbeing indicators",
                    "Interactive charts, DAX measures, and slicers",
                    "Trend analysis across gender, region, education, and device type",
                ],
                "display_order": 1,
            },
            {
                "number": "02",
                "title": "BMI & Health Risk Analytics",
                "slug": "bmi-health-risk-analytics",
                "category": proj_cat_powerbi,
                "tags": ["Power BI", "Excel", "DAX", "EDA"],
                "repository_url": "https://github.com/hilpatelss/BMI-Analysis-Dashboard",
                "custom_art_type": "donut_chart",
                "icon_name": "ChartNoAxesCombined",
                "short_description": (
                    "A health analytics dashboard examining BMI, body fat, weight, calorie intake, and "
                    "risk patterns through interactive visuals."
                ),
                "highlights": [
                    "KPI cards for BMI, height, weight, body fat, and calories",
                    "Slicers, stacked bars, pie charts, line charts, treemaps, and Sankey diagrams",
                    "Exploration across age, activity, BMI class, and risk level",
                ],
                "display_order": 2,
            },
            {
                "number": "03",
                "title": "Smart Bill Management System",
                "slug": "smart-bill-management-system",
                "category": proj_cat_fullstack,
                "tags": ["Django", "PostgreSQL", "Python", "Power BI"],
                "repository_url": "",
                "custom_art_type": "billing_chart",
                "icon_name": "Database",
                "short_description": (
                    "A billing management system using Django and PostgreSQL, paired with Python-based "
                    "analysis and Power BI reporting."
                ),
                "highlights": [
                    "Billing and customer data analysis with Pandas",
                    "Revenue, customer activity, and billing performance dashboards",
                    "Backend development with Django and PostgreSQL",
                ],
                "display_order": 3,
            },
        ]

        for pdata in projects_data:
            proj_obj, _ = Project.objects.update_or_create(
                slug=pdata["slug"],
                defaults={
                    "number": pdata["number"],
                    "title": pdata["title"],
                    "category": pdata["category"],
                    "repository_url": pdata["repository_url"],
                    "custom_art_type": pdata["custom_art_type"],
                    "icon_name": pdata["icon_name"],
                    "short_description": pdata["short_description"],
                    "display_order": pdata["display_order"],
                    "is_featured": True,
                    "is_published": True,
                }
            )
            # Assign tags
            tag_objs = [all_tags[t] for t in pdata["tags"]]
            proj_obj.tags.set(tag_objs)

            # Assign highlights
            proj_obj.highlights.all().delete()
            for h_idx, h_text in enumerate(pdata["highlights"], start=1):
                ProjectHighlight.objects.create(
                    project=proj_obj,
                    text=h_text,
                    display_order=h_idx
                )

        self.stdout.write(self.style.SUCCESS(f"✓ {len(projects_data)} Projects and highlights seeded."))
        self.stdout.write(self.style.SUCCESS("🎉 Seeding completed successfully!"))

