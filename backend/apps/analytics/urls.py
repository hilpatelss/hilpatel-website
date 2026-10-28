from django.urls import path
from .views import VisitorLogView

app_name = 'analytics'

urlpatterns = [
    path('log/', VisitorLogView.as_view(), name='visitor-log'),
]

