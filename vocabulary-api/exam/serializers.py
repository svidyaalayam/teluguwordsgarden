from rest_framework import serializers
from .models import ExamAttempt, AttemptQuestion, ExamPaper


class ExamPaperListSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = ExamPaper
        fields = [
            'id', 'slug', 'title_en', 'title_te',
            'description_en', 'description_te',
            'time_limit_minutes', 'feedback_policy', 'question_count',
        ]

    def get_question_count(self, obj):
        return obj.question_count


class PreparedQuestionSerializer(serializers.ModelSerializer):
    """
    Serializes a prepared AttemptQuestion for the frontend.
    NEVER includes correct_option_id in the output.
    """
    question_type = serializers.SerializerMethodField()
    question_text_en = serializers.SerializerMethodField()
    question_text_te = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    word_to_pronounce = serializers.SerializerMethodField()
    marks = serializers.SerializerMethodField()
    question_number = serializers.SerializerMethodField()
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = AttemptQuestion
        fields = [
            'id',
            'question_id',
            'question_type',
            'question_number',
            'total_questions',
            'question_text_en',
            'question_text_te',
            'image_url',
            'audio_url',
            'word_to_pronounce',
            'marks',
            'prepared_options',   # list of {id, text} — no answer key
            'selected_option_id',
            'is_answered',
            'display_order',
        ]

    def get_question_type(self, obj):
        return obj.question_data.get('question_type', 'multiple_choice')

    def get_question_text_en(self, obj):
        return obj.question_data.get('question_text_en', '')

    def get_question_text_te(self, obj):
        return obj.question_data.get('question_text_te', '')

    def get_image_url(self, obj):
        return obj.question_data.get('image_url', '')

    def get_audio_url(self, obj):
        return obj.question_data.get('audio_url', '')

    def get_word_to_pronounce(self, obj):
        return obj.question_data.get('word_to_pronounce', '')

    def get_marks(self, obj):
        return int(obj.question_data.get('question_marks') or obj.question_data.get('marks') or 1)

    def get_question_number(self, obj):
        return obj.display_order + 1

    def get_total_questions(self, obj):
        return obj.attempt.attempt_questions.count()


class AttemptSerializer(serializers.ModelSerializer):
    paper_title_en = serializers.CharField(source='paper.title_en', read_only=True)
    paper_title_te = serializers.CharField(source='paper.title_te', read_only=True)
    paper_instructions_en = serializers.CharField(source='paper.instructions_en', read_only=True)
    paper_instructions_te = serializers.CharField(source='paper.instructions_te', read_only=True)
    paper_time_limit_minutes = serializers.IntegerField(source='paper.time_limit_minutes', read_only=True)
    questions = PreparedQuestionSerializer(source='attempt_questions', many=True, read_only=True)

    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'status', 'started_at',
            'paper_title_en', 'paper_title_te',
            'paper_instructions_en', 'paper_instructions_te',
            'paper_time_limit_minutes',
            'questions',
        ]


class AnswerSubmitSerializer(serializers.Serializer):
    question_id = serializers.CharField()
    selected_option_id = serializers.CharField()


class ExamResultSerializer(serializers.ModelSerializer):
    paper_title_en = serializers.CharField(source='paper.title_en')
    paper_title_te = serializers.CharField(source='paper.title_te')
    feedback_policy = serializers.CharField(source='paper.feedback_policy')
    questions = serializers.SerializerMethodField()

    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'status', 'started_at', 'submitted_at',
            'paper_title_en', 'paper_title_te',
            'total_marks', 'marks_awarded', 'feedback_policy',
            'questions',
        ]

    def get_questions(self, obj):
        policy = obj.paper.feedback_policy
        show_answer = policy == 'after_submit' and obj.status == ExamAttempt.Status.SUBMITTED
        result = []
        for aq in obj.attempt_questions.all():
            qd = aq.question_data or {}
            item = {
                'question_id': aq.question_id,
                'question_type': qd.get('question_type', 'multiple_choice'),
                'question_text_en': qd.get('question_text_en', ''),
                'question_text_te': qd.get('question_text_te', ''),
                'selected_option_id': aq.selected_option_id,
                'is_correct': aq.is_correct,
                'marks_awarded': aq.marks_awarded,
                'prepared_options': aq.prepared_options,
            }
            if show_answer:
                item['correct_answer'] = qd.get('correct_answer', '')
                item['explanation'] = qd.get('explanation', '')
            result.append(item)
        return result
