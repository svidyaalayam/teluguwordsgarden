from rest_framework import serializers
from .models import LearningLevel, Lesson, LessonWord, Resource, ResourceCategory, VocabularyCategory, Word


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VocabularyCategory
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class LearningLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningLevel
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class LessonWordSerializer(serializers.ModelSerializer):
    word = WordSerializer(read_only=True)
    word_id = serializers.PrimaryKeyRelatedField(
        queryset=Word.objects.all(), source='word', write_only=True
    )

    class Meta:
        model = LessonWord
        fields = ('id', 'word', 'word_id', 'display_order')


class LessonSerializer(serializers.ModelSerializer):
    lesson_words = LessonWordSerializer(source='lessonword_set', many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ResourceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
