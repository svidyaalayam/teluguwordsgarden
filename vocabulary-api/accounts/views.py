from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .bmk_sso import decode_bmk_token, user_from_bmk_claims
from .serializers import BmkExchangeSerializer, LocalLoginSerializer, UserSerializer

User = get_user_model()


class LocalLoginView(TokenObtainPairView):
    """POST /api/auth/login/ — local account login."""

    permission_classes = [permissions.AllowAny]
    serializer_class = LocalLoginSerializer


class BmkExchangeView(APIView):
    """POST /api/auth/bmk-exchange/ — exchange BMK access token for local JWT."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = BmkExchangeSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        claims = decode_bmk_token(ser.validated_data['bmk_access_token'])
        user = user_from_bmk_claims(claims)
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data,
            }
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
