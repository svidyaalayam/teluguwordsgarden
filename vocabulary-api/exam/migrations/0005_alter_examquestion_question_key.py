from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0004_examquestion_word_and_question_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='examquestion',
            name='question_key',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Optional stable key (e.g. Q001). Leave blank to auto-generate.',
                max_length=40,
            ),
        ),
    ]
