from django.contrib import admin
from .models import LearningLevel, Lesson, LessonWord, VocabularyCategory, Word


@admin.register(VocabularyCategory)
class VocabularyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'active', 'created_at')
    list_filter = ('active',)
    search_fields = ('name',)


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


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'lesson_order', 'estimated_minutes', 'published')
    list_filter = ('published', 'level')
    search_fields = ('title', 'description')
    inlines = [LessonWordInline]
