from django.urls import path
from . import views

urlpatterns = [
     path('upload-image/', views.UploadImageView.as_view(), name='upload-image'),
    path('user-images/', views.get_user_images, name='get-user-images'),
]
