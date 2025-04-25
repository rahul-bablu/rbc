from django.db import models
from django.contrib.auth.models import User

    
class UserImage(models.Model):
    image = models.ImageField(upload_to='user_images/')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    key = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.username} - {self.key}"
