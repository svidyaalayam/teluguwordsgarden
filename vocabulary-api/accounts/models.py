from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Vocabulary Platform user — local author/admin or linked Balamukundam user."""

    class AuthSource(models.TextChoices):
        LOCAL = 'local', 'Vocabulary Platform'
        BMK = 'bmk', 'Balamukundam'

    class Role(models.TextChoices):
        AUTHOR = 'AUTHOR', 'Author'
        VIEWER = 'VIEWER', 'Viewer'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.AUTHOR)
    auth_source = models.CharField(
        max_length=20,
        choices=AuthSource.choices,
        default=AuthSource.LOCAL,
    )
    bmk_user_id = models.CharField(max_length=64, blank=True, default='')
    bmk_username = models.CharField(max_length=150, blank=True, default='')
    bmk_school_slug = models.CharField(max_length=100, blank=True, default='')
    bmk_class_ids = models.JSONField(default=list, blank=True)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    @property
    def can_create_content(self) -> bool:
        return (self.role == self.Role.AUTHOR or self.is_staff or self.is_superuser) and self.is_active

    @property
    def is_preview_only(self) -> bool:
        return not self.can_create_content
