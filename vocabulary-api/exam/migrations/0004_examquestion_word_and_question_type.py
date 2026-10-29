from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('vocabulary', '0001_initial'),
        ('exam', '0003_examquestion_word_to_pronounce'),
    ]

    operations = [
        migrations.AddField(
            model_name='examquestion',
            name='word',
            field=models.ForeignKey(
                blank=True,
                help_text='Select vocabulary word for word-based question types (e.g. Identify First Letter).',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='exam_questions',
                to='vocabulary.word',
            ),
        ),
        migrations.AlterField(
            model_name='examquestion',
            name='question_type',
            field=models.CharField(
                choices=[
                    ('multiple_choice', 'Multiple Choice (General)'),
                    ('identify_first_letter', 'Identify First Letter of Word'),
                ],
                default='multiple_choice',
                max_length=40,
            ),
        ),
        migrations.AlterField(
            model_name='examquestion',
            name='correct_answer',
            field=models.CharField(
                blank=True,
                default='',
                help_text='The correct answer text (auto-populated if Identify First Letter is selected).',
                max_length=400,
            ),
        ),
        migrations.AlterField(
            model_name='examquestion',
            name='explanation',
            field=models.TextField(
                blank=True,
                default='',
                help_text='Explanation shown after submission/review.',
            ),
        ),
        migrations.AlterField(
            model_name='examquestion',
            name='question_text_en',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='examquestion',
            name='question_text_te',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='examquestion',
            name='word_to_pronounce',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Telugu word to pronounce using SpeechSynthesis if no audio file is provided (e.g. ఉడుత).',
                max_length=160,
            ),
        ),
        migrations.AlterField(
            model_name='examquestion',
            name='wrong_answers',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='List of wrong answers pool. The server picks 4 at random. If empty for Identify First Letter, defaults to Telugu alphabet.',
            ),
        ),
    ]
