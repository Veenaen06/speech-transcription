from django.db import models


class Transcription(models.Model):
    title = models.CharField(max_length=200, default="Untitled Transcription")
    text = models.TextField()
    language = models.CharField(max_length=50, default="Auto-detected")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title