from django.db import migrations, models
import django.db.models.deletion
import exam.models


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0006_remove_examquestion_and_use_json_questions'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExamQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('display_order', models.PositiveSmallIntegerField(default=0, help_text='Display order in the exam. Change numbers to move questions up or down.')),
                ('question_data', models.JSONField(default=exam.models.default_question_data, help_text='JSON data for this question: question_id, question_type, question_marks, question_text_en, question_text_te, word_to_pronounce, image_url, audio_url, correct_answer, wrong_answers, number_of_wrong_answers_to_select, explanation.')),
                ('paper', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='exam.exampaper')),
            ],
            options={
                'ordering': ('display_order', 'id'),
            },
        ),
        migrations.RemoveField(
            model_name='exampaper',
            name='questions_data',
        ),
        migrations.AddField(
            model_name='attemptquestion',
            name='exam_question',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='attempt_questions',
                to='exam.examquestion',
            ),
        ),
    ]
