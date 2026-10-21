from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = (
        'username',
        'email',
        'role',
        'auth_source',
        'bmk_school_slug',
        'is_staff',
        'is_active',
    )
    list_filter = ('role', 'auth_source', 'is_staff', 'is_active')
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            'Vocabulary Platform',
            {
                'fields': (
                    'role',
                    'auth_source',
                    'bmk_user_id',
                    'bmk_username',
                    'bmk_school_slug',
                )
            },
        ),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ('Vocabulary Platform', {'fields': ('email', 'role', 'auth_source')}),
    )
    search_fields = ('username', 'email', 'bmk_username', 'bmk_school_slug')
