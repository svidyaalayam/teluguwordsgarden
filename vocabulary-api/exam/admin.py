import json
from django import forms
from django.contrib import admin
from .models import (
    ExamPaper,
    ExamQuestion,
    ExamAttempt,
    AttemptQuestion,
)


class PrettyJSONWidget(forms.Textarea):
    def format_value(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except Exception:
                return value
        if isinstance(value, (dict, list)):
            # Remove question_id if present — it's no longer used
            if isinstance(value, dict):
                value = {k: v for k, v in value.items() if k != 'question_id'}
            return json.dumps(value, indent=2, ensure_ascii=False)
        return super().format_value(value)


class ExamQuestionForm(forms.ModelForm):
    class Meta:
        model = ExamQuestion
        fields = '__all__'
        widgets = {
            'question_data': PrettyJSONWidget(attrs={
                'rows': 16,
                'style': 'width: 100%; max-width: 850px; font-family: Consolas, monospace; font-size: 13px; line-height: 1.4;',
            }),
        }


class ExamQuestionInline(admin.StackedInline):
    model = ExamQuestion
    form = ExamQuestionForm
    extra = 1
    fields = ('display_order', 'question_data')
    ordering = ('display_order', 'id')
    verbose_name = 'Question'
    verbose_name_plural = 'Questions (reorder via Display Order, check Delete to remove)'


class AttemptQuestionInline(admin.TabularInline):
    model = AttemptQuestion
    extra = 0
    readonly_fields = (
        'question_id', 'display_order', 'prepared_options',
        'correct_option_id', 'selected_option_id',
        'is_answered', 'is_correct', 'marks_awarded',
    )
    can_delete = False


@admin.register(ExamPaper)
class ExamPaperAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'slug', 'feedback_policy', 'time_limit_minutes', 'active', 'question_count', 'created_at')
    list_filter = ('active', 'feedback_policy')
    search_fields = ('title_en', 'title_te', 'slug')
    prepopulated_fields = {'slug': ('title_en',)}
    inlines = [ExamQuestionInline]
    fieldsets = (
        ('General Information', {
            'fields': ('title_en', 'title_te', 'slug', 'active', 'time_limit_minutes', 'feedback_policy'),
        }),
        ('Descriptions & Instructions', {
            'fields': ('description_en', 'description_te', 'instructions_en', 'instructions_te'),
        }),
    )


@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    form = ExamQuestionForm
    list_display = ('id', 'paper', 'display_order', 'display_text', 'display_correct', 'display_marks')
    list_filter = ('paper',)
    search_fields = ('question_data',)
    ordering = ('paper', 'display_order')

    def display_text(self, obj):
        return obj.question_text_en or obj.question_text_te or '-'
    display_text.short_description = 'Question Text'

    def display_correct(self, obj):
        return obj.correct_answer or '-'
    display_correct.short_description = 'Correct Answer'

    def display_marks(self, obj):
        return obj.marks
    display_marks.short_description = 'Marks'


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'paper', 'status', 'marks_awarded', 'total_marks', 'started_at', 'submitted_at')
    list_filter = ('status', 'paper')
    search_fields = ('student__username', 'student__email', 'paper__title_en')
    readonly_fields = ('started_at', 'submitted_at', 'marks_awarded', 'total_marks')
    inlines = [AttemptQuestionInline]
