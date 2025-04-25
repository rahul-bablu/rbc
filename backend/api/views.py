from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .utils.enc import enc


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import UserImage
from .serializers import UserImageSerializer
from rest_framework.decorators import api_view, permission_classes

class UploadImageView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]  # ensure only logged-in users can upload

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        data['user'] = request.user.id  # assign the authenticated user
        serializer = UserImageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Image uploaded successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UploadImageView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        uploaded_image = request.FILES.get("image")
        key = request.data.get("key")
        if not uploaded_image:
            return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

        modified_image, salt = enc(uploaded_image, key)

        # Create the UserImage instance
        user_image = UserImage.objects.create(
            user=request.user,
            image=modified_image,
            key=salt
        )

        serializer = UserImageSerializer(user_image)
        return Response({"message": "Modified image stored.", "data": serializer.data}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_images(request):
    images = UserImage.objects.filter(user=request.user).order_by('-uploaded_at')
    serializer = UserImageSerializer(images, many=True)
    return Response(serializer.data)

from django.http import FileResponse, Http404
import cv2 as cv
import numpy as np
from io import BytesIO
from .utils.decrypt import decrypt

class DecryptImageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, image_id):
        try:
            user_image = UserImage.objects.get(id=image_id, user=request.user)
        except UserImage.DoesNotExist:
            raise Http404("Encrypted image not found for this user.")

        # Read the encrypted image into OpenCV format
        image_bytes = user_image.image.read()
        salt = user_image.key
        np_arr = np.frombuffer(image_bytes, np.uint8)
        enc_img = cv.imdecode(np_arr, cv.IMREAD_COLOR)

        # Decrypt the image using your function
        dec_img = decrypt(enc_img, "Test@123", salt)

        # Encode the image back to memory buffer
        _, buffer = cv.imencode(".png", dec_img)
        img_io = BytesIO(buffer.tobytes())

        # Return image as response
        return FileResponse(img_io, content_type='image/png', filename="decrypted.png")
