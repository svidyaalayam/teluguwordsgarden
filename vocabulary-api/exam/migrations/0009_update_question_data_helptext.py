from django.db import migrations, models
import exam.models


class Migration(migrations.Migration):
    """
    Update help_text on question_data and remove question_id from default.
    Help text changes do not alter the database schema.
    """

    dependencies = [
        ('exam', '0008_alter_attemptquestion_unique_together'),
    ]

    operations = [
        migrations.AlterField(
            model_name='examquestion',
            name='question_data',
            field=models.JSONField(
                default=exam.models.default_question_data,
                help_text=(
                    'JSON data for this question: question_type, question_marks, '
                    'question_text_en, question_text_te, word_to_pronounce, image_url, audio_url, '
                    'correct_answer, wrong_answers, number_of_wrong_answers_to_select, explanation.'
                ),
            ),
        ),
    ]
