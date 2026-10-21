from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LearningLevel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=120, unique=True)),
                ('min_age', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('max_age', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('description', models.TextField(blank=True)),
                ('display_order', models.PositiveSmallIntegerField(default=0)),
                ('active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ('display_order', 'name'),
            },
        ),
        migrations.CreateModel(
            name='VocabularyCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=120, unique=True)),
                ('active', models.BooleanField(default=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='children', to='vocabulary.vocabularycategory')),
            ],
            options={
                'verbose_name_plural': 'Vocabulary Categories',
                'ordering': ('name',),
            },
        ),
        migrations.CreateModel(
            name='Word',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('term', models.CharField(db_index=True, max_length=160, unique=True)),
                ('definition', models.TextField()),
                ('part_of_speech', models.CharField(blank=True, max_length=60)),
                ('pronunciation', models.CharField(blank=True, max_length=160)),
                ('audio_url', models.URLField(blank=True)),
                ('image_url', models.URLField(blank=True)),
                ('example_sentence', models.TextField(blank=True)),
                ('active', models.BooleanField(default=True)),
                ('categories', models.ManyToManyField(blank=True, related_name='words', to='vocabulary.vocabularycategory')),
                ('levels', models.ManyToManyField(blank=True, related_name='words', to='vocabulary.learninglevel')),
            ],
            options={
                'ordering': ('term',),
            },
        ),
        migrations.CreateModel(
            name='Lesson',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('lesson_order', models.PositiveSmallIntegerField(default=0)),
                ('estimated_minutes', models.PositiveSmallIntegerField(default=10)),
                ('published', models.BooleanField(default=False)),
                ('level', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='lessons', to='vocabulary.learninglevel')),
            ],
            options={
                'ordering': ('lesson_order', 'title'),
            },
        ),
        migrations.CreateModel(
            name='LessonWord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('display_order', models.PositiveSmallIntegerField(default=0)),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vocabulary.lesson')),
                ('word', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vocabulary.word')),
            ],
            options={
                'ordering': ('display_order',),
                'unique_together': {('lesson', 'word')},
            },
        ),
        migrations.AddField(
            model_name='lesson',
            name='words',
            field=models.ManyToManyField(related_name='lessons', through='vocabulary.LessonWord', to='vocabulary.word'),
        ),
    ]
