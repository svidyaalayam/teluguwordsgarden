import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='examquestion',
            name='correct_answer',
            field=models.CharField(default='', help_text='The correct answer text.', max_length=400),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='examquestion',
            name='explanation',
            field=models.TextField(blank=True, help_text='Explanation shown after submission/review.'),
        ),
        migrations.AddField(
            model_name='examquestion',
            name='wrong_answers',
            field=models.JSONField(blank=True, default=list, help_text='List of wrong answers pool. The server picks 4 at random.'),
        ),
        migrations.DeleteModel(
            name='QuestionOption',
        ),
        migrations.DeleteModel(
            name='WrongAnswerPool',
        ),
    ]
