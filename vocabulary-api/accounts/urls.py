from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import BmkExchangeView, LocalLoginView, MeView

urlpatterns = [
    path('login/', LocalLoginView.as_view(), name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('bmk-exchange/', BmkExchangeView.as_view(), name='auth-bmk-exchange'),
    path('me/', MeView.as_view(), name='auth-me'),
]
