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

