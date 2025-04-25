from django.urls import path
from . import views

urlpatterns = [
    path('decrypt-image/<int:image_id>/', views.DecryptImageView.as_view(), name='decrypt-image'),
     path('upload-image/', views.UploadImageView.as_view(), name='upload-image'),
    path('user-images/', views.get_user_images, name='get-user-images'),
]
