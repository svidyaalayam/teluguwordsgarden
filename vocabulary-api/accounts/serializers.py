from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    can_create_content = serializers.BooleanField(read_only=True)
    is_preview_only = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'auth_source',
            'bmk_user_id',
            'bmk_username',
            'bmk_school_slug',
            'bmk_class_ids',
            'can_create_content',
            'is_preview_only',
        )


class LocalLoginSerializer(TokenObtainPairSerializer):
    """Email/username + password -> JWT."""

    def validate(self, attrs):
        raw = attrs.get(self.username_field) or ''
        raw = str(raw).strip()
        if '@' in raw:
            user = User.objects.filter(email__iexact=raw.lower()).first()
            if user:
                attrs[self.username_field] = user.username
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class BmkExchangeSerializer(serializers.Serializer):
    """Exchange a Balamukundam access token for a Vocabulary Platform JWT."""

    bmk_access_token = serializers.CharField()
