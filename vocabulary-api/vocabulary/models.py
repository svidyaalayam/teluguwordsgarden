from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class VocabularyCategory(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.PROTECT, related_name='children')
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ('name',)
        verbose_name_plural = 'Vocabulary Categories'

    def __str__(self):
        return self.name


class LearningLevel(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    min_age = models.PositiveSmallIntegerField(null=True, blank=True)
    max_age = models.PositiveSmallIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    display_order = models.PositiveSmallIntegerField(default=0)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ('display_order', 'name')

    def __str__(self):
        return self.name


class Word(TimeStampedModel):
    term = models.CharField(max_length=160, unique=True, db_index=True)
    definition = models.TextField()
    part_of_speech = models.CharField(max_length=60, blank=True)
    pronunciation = models.CharField(max_length=160, blank=True)
    audio_url = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    example_sentence = models.TextField(blank=True)
    categories = models.ManyToManyField(VocabularyCategory, blank=True, related_name='words')
    levels = models.ManyToManyField(LearningLevel, blank=True, related_name='words')
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ('term',)

    def __str__(self):
        return self.term


class Lesson(TimeStampedModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    level = models.ForeignKey(LearningLevel, null=True, blank=True, on_delete=models.SET_NULL, related_name='lessons')
    words = models.ManyToManyField(Word, through='LessonWord', related_name='lessons')
    lesson_order = models.PositiveSmallIntegerField(default=0)
    estimated_minutes = models.PositiveSmallIntegerField(default=10)
    published = models.BooleanField(default=False)

    class Meta:
        ordering = ('lesson_order', 'title')

    def __str__(self):
        return self.title


class LessonWord(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        unique_together = ('lesson', 'word')
        ordering = ('display_order',)
