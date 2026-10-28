from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import LearningLevel, Lesson, Resource, ResourceCategory, VocabularyCategory, Word
from .serializers import (
    CategorySerializer, LearningLevelSerializer, LessonSerializer, ResourceCategorySerializer,
    ResourceSerializer, WordSerializer,
)


class StaffOrAuthorWriteMixin:
    """Allows read to all authenticated (or preview) users, but restrict writes to author/staff."""

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.method not in permissions.SAFE_METHODS:
            if not (request.user.can_create_content or request.user.is_staff):
                raise PermissionDenied('Only authors can modify vocabulary content.')


class WordListCreate(StaffOrAuthorWriteMixin, generics.ListCreateAPIView):
    serializer_class = WordSerializer

    def get_queryset(self):
        qs = Word.objects.prefetch_related('categories', 'levels').all()
        active_only = self.request.query_params.get('active_only')
        if active_only in ('1', 'true', 'True'):
            qs = qs.filter(active=True)

        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(categories__id=category_id)

        level_id = self.request.query_params.get('level')
        if level_id:
            qs = qs.filter(levels__id=level_id)

        term = self.request.query_params.get('q', '').strip()
        if term:
            qs = qs.filter(
                Q(term__icontains=term)
                | Q(definition__icontains=term)
                | Q(pronunciation__icontains=term)
            )
        return qs.distinct()


class WordDetail(StaffOrAuthorWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Word.objects.prefetch_related('categories', 'levels').all()
    serializer_class = WordSerializer

    def perform_destroy(self, instance):
        if not (self.request.user.can_create_content or self.request.user.is_staff):
            raise PermissionDenied('Permission denied.')
        instance.active = False
        instance.save(update_fields=('active', 'updated_at'))


class CategoryListCreate(StaffOrAuthorWriteMixin, generics.ListCreateAPIView):
    queryset = VocabularyCategory.objects.filter(active=True).select_related('parent')
    serializer_class = CategorySerializer


class CategoryDetail(StaffOrAuthorWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = VocabularyCategory.objects.all()
    serializer_class = CategorySerializer


class LevelListCreate(StaffOrAuthorWriteMixin, generics.ListCreateAPIView):
    queryset = LearningLevel.objects.all()
    serializer_class = LearningLevelSerializer


class LevelDetail(StaffOrAuthorWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = LearningLevel.objects.all()
    serializer_class = LearningLevelSerializer


class LessonListCreate(StaffOrAuthorWriteMixin, generics.ListCreateAPIView):
    serializer_class = LessonSerializer

    def get_queryset(self):
        qs = Lesson.objects.prefetch_related('words', 'lessonword_set__word').all()
        published_only = self.request.query_params.get('published')
        if published_only in ('1', 'true', 'True'):
            qs = qs.filter(published=True)
        return qs


class LessonDetail(StaffOrAuthorWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.prefetch_related('words', 'lessonword_set__word').all()
    serializer_class = LessonSerializer


class ResourceCategoryListCreate(StaffOrAuthorWriteMixin, generics.ListCreateAPIView):
    serializer_class = ResourceCategorySerializer

    def get_queryset(self):
        return ResourceCategory.objects.filter(active=True)


class ResourceCategoryDetail(StaffOrAuthorWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer


class ResourceListCreate(StaffOrAuthorWriteMixin, generics.ListCreateAPIView):
    serializer_class = ResourceSerializer

    def get_queryset(self):
        qs = Resource.objects.select_related('category').filter(active=True, category__active=True)
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        query = self.request.query_params.get('q', '').strip()
        if query:
            qs = qs.filter(Q(title__icontains=query) | Q(description__icontains=query) | Q(author__icontains=query))
        return qs


class ResourceDetail(StaffOrAuthorWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Resource.objects.select_related('category').all()
    serializer_class = ResourceSerializer

    def perform_destroy(self, instance):
        instance.active = False
        instance.save(update_fields=('active', 'updated_at'))
