from django.urls import path
from . import views

urlpatterns = [
    path('words/', views.WordListCreate.as_view(), name='word-list-create'),
    path('words/<int:pk>/', views.WordDetail.as_view(), name='word-detail'),
    path('categories/', views.CategoryListCreate.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetail.as_view(), name='category-detail'),
    path('levels/', views.LevelListCreate.as_view(), name='level-list-create'),
    path('levels/<int:pk>/', views.LevelDetail.as_view(), name='level-detail'),
    path('lessons/', views.LessonListCreate.as_view(), name='lesson-list-create'),
    path('lessons/<int:pk>/', views.LessonDetail.as_view(), name='lesson-detail'),
]
