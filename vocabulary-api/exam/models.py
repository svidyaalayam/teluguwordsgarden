from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ExamPaper(TimeStampedModel):
    """An examination paper (e.g. Level-1 Achulu exam)."""
    slug = models.SlugField(max_length=80, unique=True)
    title_en = models.CharField(max_length=200)
    title_te = models.CharField(max_length=200, blank=True)
    description_en = models.TextField(blank=True)
    description_te = models.TextField(blank=True)
    instructions_en = models.TextField(blank=True)
    instructions_te = models.TextField(blank=True)
    time_limit_minutes = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text='Null means untimed.'
    )
    feedback_policy = models.CharField(
        max_length=20,
        choices=[
            ('after_submit', 'After submission'),
            ('after_review', 'After teacher releases'),
            ('never', 'Never'),
        ],
        default='after_submit',
    )
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ('title_en',)

    def __str__(self):
        return self.title_en

    @property
    def question_count(self) -> int:
        return self.questions.count()


def default_question_data():
    return {
        "question_type": "multiple_choice",
        "question_marks": 1,
        "question_text_en": "",
        "question_text_te": "",
        "word_to_pronounce": "",
        "image_url": "",
        "audio_url": "",
        "correct_answer": "",
        "wrong_answers": [],
        "number_of_wrong_answers_to_select": 4,
        "explanation": "",
    }


class ExamQuestion(TimeStampedModel):
    """
    An individual question belonging to an ExamPaper.
    Stores its full question configuration as JSON data.
    Can be reordered, moved up/down, or deleted.
    """
    paper = models.ForeignKey(ExamPaper, on_delete=models.CASCADE, related_name='questions')
    display_order = models.PositiveSmallIntegerField(
        default=0,
        help_text='Display order in the exam. Change numbers to move questions up or down.',
    )
    question_data = models.JSONField(
        default=default_question_data,
        help_text=(
            'JSON data for this question: question_type, question_marks, '
            'question_text_en, question_text_te, word_to_pronounce, image_url, audio_url, '
            'correct_answer, wrong_answers, number_of_wrong_answers_to_select, explanation.'
        ),
    )

    class Meta:
        ordering = ('display_order', 'id')

    def __str__(self):
        text = self.question_text_en or self.question_text_te or 'Question'
        return f'{self.paper.title_en} — #{self.display_order + 1}: {text[:40]}'

    def save(self, *args, **kwargs):
        if self.display_order == 0 and not self.pk and self.paper_id:
            max_order = ExamQuestion.objects.filter(paper_id=self.paper_id).aggregate(models.Max('display_order'))['display_order__max']
            if max_order is not None and ExamQuestion.objects.filter(paper_id=self.paper_id, display_order=0).exists():
                self.display_order = max_order + 1
        super().save(*args, **kwargs)

    @property
    def question_text_en(self) -> str:
        return self.question_data.get('question_text_en', '') if isinstance(self.question_data, dict) else ''

    @property
    def question_text_te(self) -> str:
        return self.question_data.get('question_text_te', '') if isinstance(self.question_data, dict) else ''

    @property
    def correct_answer(self) -> str:
        return self.question_data.get('correct_answer', '') if isinstance(self.question_data, dict) else ''

    @property
    def word_to_pronounce(self) -> str:
        return self.question_data.get('word_to_pronounce', '') if isinstance(self.question_data, dict) else ''

    @property
    def marks(self) -> int:
        if isinstance(self.question_data, dict):
            return int(self.question_data.get('question_marks') or self.question_data.get('marks') or 1)
        return 1


class ExamAttempt(TimeStampedModel):
    """A student's attempt at an exam paper."""

    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        SUBMITTED = 'submitted', 'Submitted'
        EXPIRED = 'expired', 'Expired'

    paper = models.ForeignKey(ExamPaper, on_delete=models.PROTECT, related_name='attempts')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='exam_attempts',
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    total_marks = models.PositiveSmallIntegerField(default=0)
    marks_awarded = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.student or "Guest"} attempt at {self.paper}'


class AttemptQuestion(TimeStampedModel):
    """
    Prepared question within an attempt. Stores the shuffled options as JSON
    so the same shuffle is consistent across navigation. Never exposes the
    correct answer key to the frontend.
    """
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='attempt_questions')
    exam_question = models.ForeignKey(
        ExamQuestion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attempt_questions',
    )
    question_id = models.CharField(max_length=60)
    display_order = models.PositiveSmallIntegerField(default=0)
    question_data = models.JSONField(
        default=dict,
        help_text='Question snapshot (text, media, correct answer, explanation, etc.)',
    )
    # Stored as [{"id": "opt_a", "text": "అ"}, ...] — no is_correct field
    prepared_options = models.JSONField(default=list)
    # Stores the id from prepared_options that maps to the correct answer (server-side only)
    correct_option_id = models.CharField(max_length=20)
    # Student's selected option id (from prepared_options)
    selected_option_id = models.CharField(max_length=20, blank=True)
    is_answered = models.BooleanField(default=False)
    is_correct = models.BooleanField(null=True, blank=True)
    marks_awarded = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ('display_order',)
        unique_together = ('attempt', 'display_order')

    def __str__(self):
        return f'Attempt {self.attempt_id} Q{self.display_order} ({self.question_id})'
