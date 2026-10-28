import json
from datetime import datetime, timezone

from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render
from django.urls import path
from .models import (
    LearningLevel, Lesson, LessonWord, Resource, ResourceCategory,
    VocabularyCategory, Word,
)


@admin.register(VocabularyCategory)
class VocabularyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'active', 'created_at')
    list_filter = ('active',)
    search_fields = ('name',)
    change_list_template = 'admin/vocabulary/category/change_list.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'export/',
                self.admin_site.admin_view(self.export_categories),
                name='vocabulary_category_export',
            ),
            path(
                'import/',
                self.admin_site.admin_view(self.import_categories),
                name='vocabulary_category_import',
            ),
        ]
        return custom_urls + urls

    def export_categories(self, request: HttpRequest) -> HttpResponse:
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        payload = {
            'format': 'word-garden-categories',
            'version': 1,
            'exported_at': datetime.now(timezone.utc).isoformat(),
            'categories': [
                {
                    'name': category.name,
                    'parent': category.parent.name if category.parent else None,
                    'active': category.active,
                }
                for category in VocabularyCategory.objects.select_related('parent').all()
            ],
        }
        response = HttpResponse(
            json.dumps(payload, ensure_ascii=False, indent=2),
            content_type='application/json; charset=utf-8',
        )
        response['Content-Disposition'] = 'attachment; filename="word-garden-categories.json"'
        return response

    def import_categories(self, request: HttpRequest) -> HttpResponse:
        if not self.has_change_permission(request):
            raise PermissionDenied

        if request.method == 'POST':
            uploaded_file = request.FILES.get('json_file')
            if not uploaded_file:
                self.message_user(request, 'Choose a JSON file to import.', messages.ERROR)
            else:
                try:
                    payload = json.load(uploaded_file)
                    records = payload.get('categories') if isinstance(payload, dict) else payload
                    if not isinstance(records, list):
                        raise ValueError('The JSON must contain a "categories" list.')
                    created, updated = self._import_category_records(records)
                except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
                    self.message_user(request, f'Import failed: {exc}', messages.ERROR)
                else:
                    self.message_user(
                        request,
                        f'Import complete: {created} created, {updated} overwritten.',
                        messages.SUCCESS,
                    )
                    return redirect('admin:vocabulary_vocabularycategory_changelist')

        context = {
            **self.admin_site.each_context(request),
            'opts': self.model._meta,
            'title': 'Import categories from JSON',
        }
        return render(request, 'admin/vocabulary/category/import.html', context)

    @staticmethod
    def _import_category_records(records: list[object]) -> tuple[int, int]:
        for index, record in enumerate(records, start=1):
            if not isinstance(record, dict):
                raise ValueError(f'Category {index} must be an object.')
            if not isinstance(record.get('name'), str) or not record['name'].strip():
                raise ValueError(f'Category {index} is missing a name.')
            parent = record.get('parent')
            if parent is not None and (not isinstance(parent, str) or not parent.strip()):
                raise ValueError(f'Category {index} has an invalid parent.')
            if 'active' in record and not isinstance(record['active'], bool):
                raise ValueError(f'Category {index} has an invalid active value.')

        created = updated = 0
        with transaction.atomic():
            categories: dict[str, VocabularyCategory] = {}
            for record in records:
                category, was_created = VocabularyCategory.objects.update_or_create(
                    name=record['name'].strip(),
                    defaults={'active': record.get('active', True)},
                )
                categories[category.name] = category
                if was_created:
                    created += 1
                else:
                    updated += 1

            for record in records:
                category = categories[record['name'].strip()]
                parent_name = record.get('parent')
                parent = None
                if parent_name:
                    parent, _ = VocabularyCategory.objects.get_or_create(
                        name=parent_name.strip(), defaults={'active': True}
                    )
                if category == parent:
                    raise ValueError(f'Category "{category.name}" cannot be its own parent.')
                category.parent = parent
                category.save(update_fields=('parent', 'updated_at'))

        return created, updated


@admin.register(LearningLevel)
class LearningLevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'min_age', 'max_age', 'display_order', 'active')
    list_filter = ('active',)
    search_fields = ('name',)


class LessonWordInline(admin.TabularInline):
    model = LessonWord
    extra = 1


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ('term', 'part_of_speech', 'pronunciation', 'active', 'created_at')
    list_filter = ('active', 'categories', 'levels', 'part_of_speech')
    search_fields = ('term', 'definition', 'pronunciation')
    filter_horizontal = ('categories', 'levels')
    change_list_template = 'admin/vocabulary/word/change_list.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'export/',
                self.admin_site.admin_view(self.export_words),
                name='vocabulary_word_export',
            ),
            path(
                'import/',
                self.admin_site.admin_view(self.import_words),
                name='vocabulary_word_import',
            ),
        ]
        return custom_urls + urls

    def export_words(self, request: HttpRequest) -> HttpResponse:
        if not self.has_view_or_change_permission(request):
            raise PermissionDenied

        words = Word.objects.prefetch_related('categories', 'levels').all()
        payload = {
            'format': 'word-garden-words',
            'version': 1,
            'exported_at': datetime.now(timezone.utc).isoformat(),
            'words': [
                {
                    'term': word.term,
                    'definition': word.definition,
                    'part_of_speech': word.part_of_speech,
                    'pronunciation': word.pronunciation,
                    'audio_url': word.audio_url,
                    'image_url': word.image_url,
                    'example_sentence': word.example_sentence,
                    'active': word.active,
                    'categories': list(word.categories.values_list('name', flat=True)),
                    'levels': list(word.levels.values_list('name', flat=True)),
                }
                for word in words
            ],
        }
        response = HttpResponse(
            json.dumps(payload, ensure_ascii=False, indent=2),
            content_type='application/json; charset=utf-8',
        )
        response['Content-Disposition'] = 'attachment; filename="word-garden-words.json"'
        return response

    def import_words(self, request: HttpRequest) -> HttpResponse:
        if not self.has_change_permission(request):
            raise PermissionDenied

        if request.method == 'POST':
            uploaded_file = request.FILES.get('json_file')
            if not uploaded_file:
                self.message_user(request, 'Choose a JSON file to import.', messages.ERROR)
            else:
                try:
                    payload = json.load(uploaded_file)
                    records = payload.get('words') if isinstance(payload, dict) else payload
                    if not isinstance(records, list):
                        raise ValueError('The JSON must contain a "words" list.')
                    created, updated = self._import_word_records(records)
                except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
                    self.message_user(request, f'Import failed: {exc}', messages.ERROR)
                else:
                    self.message_user(
                        request,
                        f'Import complete: {created} created, {updated} overwritten.',
                        messages.SUCCESS,
                    )
                    return redirect('admin:vocabulary_word_changelist')

        context = {
            **self.admin_site.each_context(request),
            'opts': self.model._meta,
            'title': 'Import words from JSON',
        }
        return render(request, 'admin/vocabulary/word/import.html', context)

    @staticmethod
    def _import_word_records(records: list[object]) -> tuple[int, int]:
        required_fields = ('term', 'definition')
        editable_fields = (
            'definition',
            'part_of_speech',
            'pronunciation',
            'audio_url',
            'image_url',
            'example_sentence',
            'active',
        )

        for index, record in enumerate(records, start=1):
            if not isinstance(record, dict):
                raise ValueError(f'Word {index} must be an object.')
            missing = [field for field in required_fields if not str(record.get(field, '')).strip()]
            if missing:
                raise ValueError(f'Word {index} is missing: {", ".join(missing)}.')
            for relation in ('categories', 'levels'):
                values = record.get(relation, [])
                if not isinstance(values, list) or not all(isinstance(value, str) for value in values):
                    raise ValueError(f'Word {index} has an invalid {relation} list.')

        created = updated = 0
        with transaction.atomic():
            for record in records:
                term = record['term'].strip()
                defaults = {
                    field: record.get(field, Word._meta.get_field(field).get_default())
                    for field in editable_fields
                }
                word, was_created = Word.objects.update_or_create(term=term, defaults=defaults)
                if was_created:
                    created += 1
                else:
                    updated += 1

                categories = [
                    VocabularyCategory.objects.get_or_create(name=name.strip(), defaults={'active': True})[0]
                    for name in record.get('categories', [])
                    if name.strip()
                ]
                levels = [
                    LearningLevel.objects.get_or_create(name=name.strip())[0]
                    for name in record.get('levels', [])
                    if name.strip()
                ]
                word.categories.set(categories)
                word.levels.set(levels)

        return created, updated


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'lesson_order', 'estimated_minutes', 'published')
    list_filter = ('published', 'level')
    search_fields = ('title', 'description')
    inlines = [LessonWordInline]


@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_order', 'active', 'created_at')
    list_filter = ('active',)
    search_fields = ('name', 'description')
    ordering = ('display_order', 'name')


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'active', 'updated_at')
    list_filter = ('active', 'category')
    search_fields = ('title', 'description', 'author')
    list_select_related = ('category',)
