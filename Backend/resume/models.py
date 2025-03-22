from django.db import models
from django.utils.timezone import now

class UserInfo(models.Model):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    professional_summary = models.TextField()
    social_links = models.JSONField(default=dict)
    fresher_or_professional = models.CharField(max_length=50)
    education = models.JSONField()
    skills = models.CharField(max_length=500)
    projects = models.JSONField()
    experience = models.JSONField()
    certifications = models.JSONField()
    achievements = models.JSONField()
    languages = models.JSONField()
    last_modified = models.DateTimeField(auto_now=True)

    def _str_(self):
        return self.full_name