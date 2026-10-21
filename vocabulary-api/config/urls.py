from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/vocabulary/', include('vocabulary.urls')),
    path('api/', include('vocabulary.urls')),
]
