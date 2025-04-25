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
