from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0002_remove_questionoption_wronganswerpool_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='examquestion',
            name='word_to_pronounce',
            field=models.CharField(
                blank=True,
                help_text='Telugu word to pronounce using SpeechSynthesis if no audio file is provided (e.g. ఉడుత).',
                max_length=160,
            ),
        ),
    ]
