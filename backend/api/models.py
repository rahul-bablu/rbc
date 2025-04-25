from django.db import models
from django.contrib.auth.models import User

class UserImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='user_images/')
    title = models.CharField(max_length=255, blank=True)
    key = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title or 'Untitled'}"
