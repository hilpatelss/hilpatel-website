"""
==============================================================================
Portfolio Content URL Routes (apps/portfolio/urls.py)
==============================================================================

WHAT IS THIS FILE?
Maps URL endpoints to views for portfolio content:
- `/api/v1/ticker/`                   -> Marquee keywords
- `/api/v1/about-stats/`              -> About section highlight cards
- `/api/v1/skills/`                   -> Grouped technical skill pills
- `/api/v1/education/`                -> Chronological education history
- `/api/v1/certifications/`           -> Filterable & searchable credentials
- `/api/v1/certification-categories/` -> Category filters
- `/api/v1/achievements/`             -> Key milestone outcomes
"""

from django.urls import path
from .views import (
    TickerListView,
    AboutStatListView,
    SkillCategoryListView,
    EducationListView,
    CertificationCategoryListView,
    CertificationListView,
    AchievementListView,
)

urlpatterns = [
    path('ticker/', TickerListView.as_view(), name='ticker-list'),
    path('about-stats/', AboutStatListView.as_view(), name='about-stats-list'),
    path('skills/', SkillCategoryListView.as_view(), name='skills-list'),
    path('education/', EducationListView.as_view(), name='education-list'),
    path('certifications/', CertificationListView.as_view(), name='certifications-list'),
    path('certification-categories/', CertificationCategoryListView.as_view(), name='certification-categories-list'),
    path('achievements/', AchievementListView.as_view(), name='achievements-list'),
]


