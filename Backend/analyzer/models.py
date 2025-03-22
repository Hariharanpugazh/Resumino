from django.db import models

class ResumeAnalysis(models.Model):
    resume_file = models.FileField(upload_to='resumes/')
    job_description = models.TextField()
    analysis_result = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis {self.id} - {self.created_at}"
