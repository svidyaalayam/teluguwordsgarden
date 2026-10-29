"""Verify Balamukundam JWTs and map them to Vocabulary Platform users."""

from __future__ import annotations

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


def decode_bmk_token(token: str) -> dict:
    options = {'verify_aud': bool(settings.BMK_JWT_AUDIENCE)}
    kwargs = {
        'algorithms': [settings.BMK_JWT_ALGORITHM],
        'options': options,
    }
    if settings.BMK_JWT_AUDIENCE:
        kwargs['audience'] = settings.BMK_JWT_AUDIENCE
    try:
        return jwt.decode(token, settings.BMK_JWT_SECRET, **kwargs)
    except jwt.PyJWTError as exc:
        raise AuthenticationFailed(f'Invalid Balamukundam token: {exc}') from exc


def user_from_bmk_claims(claims: dict) -> User:
    """
    Expected BMK claim shapes:
    - user_id / userId / sub
    - username / preferred_username
    - email
    - school_slug / school
    - class_ids
    """
    bmk_user_id = str(
        claims.get('user_id')
        or claims.get('userId')
        or claims.get('sub')
        or ''
    ).strip()
    username = (
        claims.get('username')
        or claims.get('preferred_username')
        or claims.get('email')
        or f'bmk_{bmk_user_id or "user"}'
    )
    username = str(username).strip()[:150]
    email = (claims.get('email') or f'{username}@bmk.linked').strip().lower()
    first_name = str(claims.get('first_name') or claims.get('given_name') or '').strip()[:150]
    last_name = str(claims.get('last_name') or claims.get('family_name') or '').strip()[:150]
    if not first_name and not last_name:
        full_name = str(claims.get('name') or claims.get('display_name') or '').strip()
        if full_name:
            first_name, _, last_name = full_name.partition(' ')
            first_name = first_name[:150]
            last_name = last_name.strip()[:150]
    school_slug = str(claims.get('school_slug') or claims.get('school') or '')[:100]

    # BMK SSO users default to VIEWER role
    role = User.Role.VIEWER

    user = None
    if bmk_user_id:
        user = User.objects.filter(bmk_user_id=bmk_user_id).first()
    if user is None:
        user = User.objects.filter(email__iexact=email).first()

    if user is None:
        base = username.replace('@', '_').replace('.', '_')[:120]
        unique = base
        n = 1
        while User.objects.filter(username=unique).exists():
            unique = f'{base}_{n}'
            n += 1
        user = User(
            username=unique,
            email=email,
            auth_source=User.AuthSource.BMK,
            bmk_user_id=bmk_user_id,
            role=role,
        )
        user.set_unusable_password()

    user.auth_source = User.AuthSource.BMK
    user.bmk_user_id = bmk_user_id or user.bmk_user_id
    user.bmk_username = username
    user.bmk_school_slug = school_slug
    user.email = email
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    user.role = User.Role.VIEWER

    class_ids = claims.get('class_ids') or claims.get('classIds') or []
    parsed: list[int] = []
    if isinstance(class_ids, list):
        for item in class_ids:
            try:
                parsed.append(int(item))
            except (TypeError, ValueError):
                continue
    user.bmk_class_ids = parsed
    user.is_active = True
    user.save()
    return user
