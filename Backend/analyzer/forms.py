from django import forms
from .models import ResumeAnalysis  # Add this import
from django.conf import settings

class ResumeAnalysisForm(forms.ModelForm):
    api_key = settings.API_KEY
    
    class Meta:
        model = ResumeAnalysis
        fields = ['resume_file', 'job_description']