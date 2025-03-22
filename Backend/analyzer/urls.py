from django.urls import path
from .views import analyze_resume_view

urlpatterns = [
    path('analyze-resume/', analyze_resume_view, name='analyze-resume'),
]
