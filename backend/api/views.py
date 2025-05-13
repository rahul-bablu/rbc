import os
import base64
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
import cv2 as cv
import numpy as np
from io import BytesIO
from .models import UserImage
from .serializers import UserImageSerializer
from .utils.enc import enc
from .utils.decrypt import decrypt

from rest_framework import generics
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UploadImageView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        uploaded_image = request.FILES.get("image")
        title = request.data.get("title")

        if not uploaded_image:
            return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)
        if not title:
            return Response({"error": "Title is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate random 16-byte salt
        salt_bytes = os.urandom(16)
        salt = base64.b64encode(salt_bytes).decode()  # store as string

        # Use user password hash + salt as the encryption key
        user_password_hash = request.user.password  # this is already a hash
        key = user_password_hash + salt

        # Encrypt the image
        modified_image, _ = enc(uploaded_image, key, salt)

        # Save the image and salt
        user_image = UserImage.objects.create(
            user=request.user,
            image=modified_image,
            title=title,
            key=salt
        )

        serializer = UserImageSerializer(user_image)
        return Response({"message": "Image uploaded and encrypted successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_images(request):
    images = UserImage.objects.filter(user=request.user).order_by('-uploaded_at')
    serializer = UserImageSerializer(images, many=True)
    return Response(serializer.data)

class DecryptImageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, image_id):
        try:
            user_image = UserImage.objects.get(id=image_id, user=request.user)
        except UserImage.DoesNotExist:
            raise Http404("Encrypted image not found for this user.")

        salt = user_image.key
        user_password_hash = request.user.password
        key = user_password_hash + salt

        with open(user_image.image.path, 'rb') as f:
            image_bytes = f.read()

        np_arr = np.frombuffer(image_bytes, np.uint8)
        enc_img = cv.imdecode(np_arr, cv.IMREAD_COLOR)

        dec_img = decrypt(enc_img, key, salt)

        _, buffer = cv.imencode(".png", dec_img)
        img_io = BytesIO(buffer.tobytes())

        return FileResponse(img_io, content_type='image/png', filename="decrypted.png")
    
    
class DeleteImageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, image_id):
        try:
            user_image = UserImage.objects.get(id=image_id, user=request.user)
        except UserImage.DoesNotExist:
            raise Http404("Image not found or access denied.")

        user_image.image.delete()  # Deletes file from storage
        user_image.delete()        # Deletes record from DB

        return Response({"message": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
