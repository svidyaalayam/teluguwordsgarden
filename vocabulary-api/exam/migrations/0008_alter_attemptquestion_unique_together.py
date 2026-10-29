from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0007_examquestion_individual_json'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='attemptquestion',
            unique_together={('attempt', 'display_order')},
        ),
    ]
