"""
==============================================================================
Project URL Routes (apps/projects/urls.py)
==============================================================================

WHAT IS THIS FILE?
Routes requests coming to `/api/v1/projects/...`:
- `/`                  -> List of published projects (with optional filters)
- `/categories/`       -> Available project categories
- `/tags/`             -> Available technology tags
- `/<slug:slug>/`      -> Specific project details looked up by slug (e.g. /projects/smart-bill/)
"""

from django.urls import path
from .views import (
    ProjectListView,
    ProjectDetailView,
    ProjectCategoryListView,
    TechnologyTagListView,
)

urlpatterns = [
    path('', ProjectListView.as_view(), name='project-list'),
    path('categories/', ProjectCategoryListView.as_view(), name='project-categories'),
    path('tags/', TechnologyTagListView.as_view(), name='project-tags'),
    path('<slug:slug>/', ProjectDetailView.as_view(), name='project-detail'),
]


