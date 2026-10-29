from django.db import migrations, models


def clear_old_attempts(apps, schema_editor):
    AttemptQuestion = apps.get_model('exam', 'AttemptQuestion')
    AttemptQuestion.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0005_alter_examquestion_question_key'),
    ]

    operations = [
        migrations.RunPython(clear_old_attempts, migrations.RunPython.noop),
        migrations.AddField(
            model_name='exampaper',
            name='questions_data',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text=(
                    'List of question objects in JSON format. Each question object contains: '
                    'question_id, question_type ("multiple_choice"), question_marks, '
                    'question_text_en, question_text_te, word_to_pronounce, image_url, audio_url, '
                    'correct_answer, wrong_answers (list), number_of_wrong_answers_to_select, explanation.'
                ),
            ),
        ),
        migrations.AlterUniqueTogether(
            name='attemptquestion',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='attemptquestion',
            name='question',
        ),
        migrations.AddField(
            model_name='attemptquestion',
            name='question_id',
            field=models.CharField(default='', max_length=60),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='attemptquestion',
            name='question_data',
            field=models.JSONField(
                default=dict,
                help_text='Question snapshot (text, media, correct answer, explanation, etc.)',
            ),
        ),
        migrations.AlterUniqueTogether(
            name='attemptquestion',
            unique_together={('attempt', 'question_id')},
        ),
        migrations.DeleteModel(
            name='examquestion',
        ),
    ]
