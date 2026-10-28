from django.db import migrations


# "Animals" occurs both as a branch and a leaf in the supplied tree. Category
# names are unique, so the branch is named "Animals & Animal Life" while the
# existing "Animals" leaf keeps its familiar name.
CATEGORY_TREE = {
    'భాష & నేర్చుకోవడం (Language & Learning)': {
        'Language & Communication': ['Alphabet & Letters', 'Communication', 'Signs & Symbols', 'Books & Stories'],
        'Learning & School': ['Learning & Study', 'School'],
        'Classroom & Creative Learning': ['Classroom Objects', 'Art & Crafts', 'Music & Instruments', 'Technology'],
        'Concepts & Description': ['Basic Concepts', 'Opposites', 'Colors'],
    },
    'ప్రజలు & సమాజం (People & Community)': {
        'People & Relationships': ['Family', 'Friends & Relationships', 'Feelings', 'Personality Traits'],
        'Social Life & Responsibilities': ['Social Skills & Manners', 'Jobs & Occupations', 'Community Helpers'],
        'Places & Celebrations': ['Places & Buildings', 'Places in Town', 'Holidays & Celebrations'],
        'Getting Around & Staying Safe': ['Travel & Holidays', 'Transport', 'Vehicles', 'Safety', 'Road Safety', 'Shopping & Money'],
    },
    'ఇల్లు & రోజువారీ జీవితం (Home & Daily Life)': {
        'Home & Household': ['Rooms in Home', 'Household Objects', 'Kitchen Items', 'Clothing & Accessories'],
        'Food & Eating': ['Food', 'Fruits', 'Vegetables', 'Drinks', 'Meals & Cooking', 'Taste & Texture'],
        'Daily Routines & Wellbeing': ['Everyday Actions', 'Movement & Actions', 'Health & Hygiene', 'Toys & Games'],
    },
    'ప్రకృతి, జంతువులు & విజ్ఞానం (Nature, Animals & Science)': {
        'Animals & Animal Life': ['Animals', 'Pets', 'Wild Animals', 'Farm Animals', 'Sea Animals', 'Birds', 'Insects & Bugs', 'Garden Creatures', 'Animal Homes', 'Animal Sounds'],
        'Plants & Natural Environments': ['Nature', 'Plants & Flowers', 'Trees & Forests', 'Environment', 'Weather', 'Seasons'],
        'The Human Body & Discovery': ['Body Parts', 'Five Senses', 'Science & Discovery'],
    },
    'సమయం, అంతరిక్షం & పరిమాణాలు (Time, Space & Quantities)': {
        'Time & Calendar': ['Time of Day', 'Clock & Time', 'Days of the Week', 'Months of the Year', 'Calendar & Dates', 'Past, Present & Future'],
        'Numbers & Measurement': ['Numbers', 'Counting & Quantities', 'Sizes & Measurements'],
        'Spatial & Visual Concepts': ['Shapes', 'Directions', 'Patterns & Sequences', 'Space & Planets'],
    },
}


def find_or_create_leaf(Category, english_name):
    category = Category.objects.filter(name=english_name).first()
    if category:
        return category
    # Reuse current bilingual leaf categories, e.g. "జంతువులు (Animals)".
    category = Category.objects.filter(name__endswith=f'({english_name})').first()
    if category:
        return category
    return Category.objects.create(name=english_name, active=True)


def create_category_tree(apps, schema_editor):
    Category = apps.get_model('vocabulary', 'VocabularyCategory')
    for main_name, groups in CATEGORY_TREE.items():
        main, _ = Category.objects.get_or_create(name=main_name, defaults={'active': True})
        for group_name, leaf_names in groups.items():
            group, _ = Category.objects.get_or_create(
                name=group_name,
                defaults={'active': True, 'parent': main},
            )
            if group.parent_id != main.id:
                group.parent = main
                group.save(update_fields=('parent',))
            for leaf_name in leaf_names:
                leaf = find_or_create_leaf(Category, leaf_name)
                if leaf.parent_id != group.id:
                    leaf.parent = group
                    leaf.active = True
                    leaf.save(update_fields=('parent', 'active'))


def remove_created_parents(apps, schema_editor):
    Category = apps.get_model('vocabulary', 'VocabularyCategory')
    parent_names = set(CATEGORY_TREE)
    parent_names.update(group for groups in CATEGORY_TREE.values() for group in groups)
    Category.objects.filter(name__in=parent_names, words__isnull=True).delete()


class Migration(migrations.Migration):
    dependencies = [('vocabulary', '0001_initial')]

    operations = [migrations.RunPython(create_category_tree, remove_created_parents)]
