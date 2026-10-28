from django.db import migrations, models
import django.db.models.deletion


def add_initial_resources(apps, schema_editor):
    ResourceCategory = apps.get_model('vocabulary', 'ResourceCategory')
    Resource = apps.get_model('vocabulary', 'Resource')

    category, _ = ResourceCategory.objects.get_or_create(
        name='Balamukundam Text Books',
        defaults={
            'description': 'Balamukundam Telugu text books for primary classes.',
            'display_order': 1,
            'active': True,
        },
    )
    for name, description, display_order in [
        ('Story Books', 'Telugu stories for young readers.', 2),
        ('Chandamama Books', 'Classic Chandamama stories and magazines.', 3),
        ('Epics — Ramayanam', 'Resources based on the Ramayanam.', 4),
        ('Epics — Bharatam', 'Resources based on the Mahabharatam.', 5),
        ('Epics — Bhagavatam', 'Resources based on the Bhagavatam.', 6),
        ('Satakams', 'Poetry collections including Vemana and Sumathi Satakams.', 7),
        ('Academic Books', 'Academic study books and reference material.', 8),
        ('Worksheets', 'Printable learning and practice worksheets.', 9),
    ]:
        ResourceCategory.objects.get_or_create(
            name=name,
            defaults={'description': description, 'display_order': display_order, 'active': True},
        )
    books = [
        ('శేషాద్రి (1వ తరగతి)', 'Balamukundam Telugu text book for Class 1.', 'https://drive.google.com/file/d/1971wj0nhGNYvsypnNWYmPxY-fjtfgy02/preview'),
        ('గరుడాద్రి (2వ తరగతి)', 'Balamukundam Telugu text book for Class 2.', 'https://drive.google.com/file/d/1igrTSuuhptdt3S8F204GIR9tK1zLJRa2/preview'),
        ('వృషభాద్రి (3వ తరగతి)', 'Balamukundam Telugu text book for Class 3.', 'https://drive.google.com/file/d/1ShcWXzoYwIAZkkHt7YfTANT_Ddu3_VNK/preview'),
        ('వృషాద్రి (4వ తరగతి)', 'Balamukundam Telugu text book for Class 4.', 'https://drive.google.com/file/d/19hLNK63xjWrmNCRJPZ1n7QS2UIFqeO0u/preview'),
    ]
    for title, description, preview_url in books:
        Resource.objects.get_or_create(
            title=title,
            category=category,
            defaults={
                'description': description,
                'preview_url': preview_url,
                'author': 'Balamukundam',
                'active': True,
            },
        )


class Migration(migrations.Migration):
    dependencies = [('vocabulary', '0002_create_category_tree')]

    operations = [
        migrations.CreateModel(
            name='ResourceCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=120, unique=True)),
                ('description', models.TextField(blank=True)),
                ('display_order', models.PositiveSmallIntegerField(default=0)),
                ('active', models.BooleanField(default=True)),
            ],
            options={'verbose_name_plural': 'Resource categories', 'ordering': ('display_order', 'name')},
        ),
        migrations.CreateModel(
            name='Resource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=240)),
                ('description', models.TextField(blank=True)),
                ('preview_url', models.URLField(help_text='Public PDF or embeddable preview URL.')),
                ('author', models.CharField(blank=True, max_length=160)),
                ('active', models.BooleanField(default=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='resources', to='vocabulary.resourcecategory')),
            ],
            options={'ordering': ('category__display_order', 'title')},
        ),
        migrations.RunPython(add_initial_resources, migrations.RunPython.noop),
    ]
