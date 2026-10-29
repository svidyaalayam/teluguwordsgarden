import random
import string
from datetime import datetime, timezone

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AttemptQuestion, ExamAttempt, ExamPaper, ExamQuestion
from .serializers import (
    AnswerSubmitSerializer,
    AttemptSerializer,
    ExamPaperListSerializer,
    ExamResultSerializer,
)


def _make_option_id(index: int) -> str:
    """Generate a stable option id like opt_a, opt_b ... opt_e."""
    return f'opt_{string.ascii_lowercase[index]}'


def _prepare_attempt(attempt: ExamAttempt) -> None:
    """
    For each question in the paper's questions, pick N wrong
    answers at random according to number_of_wrong_answers_to_select, combine
    with the correct answer, shuffle, and store as AttemptQuestion rows.
    question_id in AttemptQuestion is derived from the ExamQuestion database pk,
    ensuring it is always unique — no JSON question_id needed.
    """
    questions = attempt.paper.questions.order_by('display_order', 'id')
    total_marks = 0

    for order, eq in enumerate(questions):
        q = eq.question_data or {}
        # Use the DB primary key as the stable, always-unique question identifier
        q_id = str(eq.pk)
        marks = int(q.get('question_marks') or q.get('marks') or 1)
        total_marks += marks

        correct_text = str(q.get('correct_answer') or '').strip()
        wrong_pool = q.get('wrong_answers') or []
        if isinstance(wrong_pool, str):
            wrong_pool = [w.strip() for w in wrong_pool.split(',') if w.strip()]

        num_wrong = int(q.get('number_of_wrong_answers_to_select') or 4)
        wrong_choices = random.sample(wrong_pool, min(num_wrong, len(wrong_pool))) if wrong_pool else []

        all_options = wrong_choices + [correct_text]
        random.shuffle(all_options)

        prepared = [{'id': _make_option_id(i), 'text': text} for i, text in enumerate(all_options)]
        correct_id = next((opt['id'] for opt in prepared if opt['text'] == correct_text), '')

        AttemptQuestion.objects.create(
            attempt=attempt,
            exam_question=eq,
            question_id=q_id,
            display_order=order,
            question_data=q,
            prepared_options=prepared,
            correct_option_id=correct_id,
        )

    attempt.total_marks = total_marks
    attempt.save(update_fields=['total_marks'])


class ExamPaperListView(generics.ListAPIView):
    """List available (active) exam papers."""
    serializer_class = ExamPaperListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return ExamPaper.objects.filter(active=True).prefetch_related('questions')


class ExamPaperDetailView(generics.RetrieveAPIView):
    """Get a single exam paper's details (no questions)."""
    serializer_class = ExamPaperListSerializer
    permission_classes = [permissions.AllowAny]
    queryset = ExamPaper.objects.filter(active=True)
    lookup_field = 'slug'


class StartAttemptView(APIView):
    """POST /api/exam/papers/<slug>/start/ — start a new attempt."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, slug):
        paper = get_object_or_404(ExamPaper, slug=slug, active=True)
        user = request.user if request.user.is_authenticated else None

        # Prevent multiple in-progress attempts for the same paper if authenticated
        if user:
            existing = ExamAttempt.objects.filter(
                student=user,
                paper=paper,
                status=ExamAttempt.Status.IN_PROGRESS,
            ).first()
            if existing:
                serializer = AttemptSerializer(existing)
                return Response(serializer.data)

        attempt = ExamAttempt.objects.create(student=user, paper=paper)
        _prepare_attempt(attempt)

        serializer = AttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AttemptDetailView(generics.RetrieveAPIView):
    """GET /api/exam/attempts/<id>/ — retrieve attempt with prepared questions."""
    serializer_class = AttemptSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return ExamAttempt.objects.all().prefetch_related('attempt_questions')


class SubmitAnswerView(APIView):
    """
    POST /api/exam/attempts/<id>/answer/
    Body: { question_id, selected_option_id }
    Returns: { question_id, is_correct, marks_awarded, feedback (if policy allows) }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        attempt = get_object_or_404(
            ExamAttempt,
            pk=pk,
            status=ExamAttempt.Status.IN_PROGRESS,
        )
        if attempt.student and request.user.is_authenticated and attempt.student != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question_id = serializer.validated_data['question_id']
        selected_option_id = serializer.validated_data['selected_option_id']

        aq = get_object_or_404(
            AttemptQuestion,
            attempt=attempt,
            question_id=question_id,
        )

        valid_ids = {opt['id'] for opt in aq.prepared_options}
        if selected_option_id not in valid_ids:
            return Response(
                {'detail': 'Invalid option id.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_correct = selected_option_id == aq.correct_option_id
        marks = int(aq.question_data.get('question_marks') or aq.question_data.get('marks') or 1) if is_correct else 0

        aq.selected_option_id = selected_option_id
        aq.is_answered = True
        aq.is_correct = is_correct
        aq.marks_awarded = marks
        aq.save(update_fields=['selected_option_id', 'is_answered', 'is_correct', 'marks_awarded', 'updated_at'])

        response_data = {
            'question_id': question_id,
            'is_correct': is_correct,
            'marks_awarded': marks,
        }

        policy = attempt.paper.feedback_policy
        if policy == 'always':
            response_data['feedback'] = {
                'correct_answer': aq.question_data.get('correct_answer', ''),
                'explanation': aq.question_data.get('explanation', ''),
            }

        return Response(response_data)


class SubmitExamView(APIView):
    """POST /api/exam/attempts/<id>/submit/ — submit the entire exam."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        attempt = get_object_or_404(
            ExamAttempt,
            pk=pk,
            status=ExamAttempt.Status.IN_PROGRESS,
        )
        if attempt.student and request.user.is_authenticated and attempt.student != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        total_marks_awarded = sum(
            aq.marks_awarded for aq in attempt.attempt_questions.all()
        )

        attempt.status = ExamAttempt.Status.SUBMITTED
        attempt.submitted_at = datetime.now(timezone.utc)
        attempt.marks_awarded = total_marks_awarded
        attempt.save(update_fields=['status', 'submitted_at', 'marks_awarded', 'updated_at'])

        serializer = ExamResultSerializer(attempt)
        return Response(serializer.data)


class ExamResultView(generics.RetrieveAPIView):
    """GET /api/exam/attempts/<id>/result/ — get final result (submitted only)."""
    serializer_class = ExamResultSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return ExamAttempt.objects.filter(
            status=ExamAttempt.Status.SUBMITTED,
        ).prefetch_related('attempt_questions')
