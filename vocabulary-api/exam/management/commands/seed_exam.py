from django.core.management.base import BaseCommand
from exam.models import ExamPaper, ExamQuestion


class Command(BaseCommand):
    help = 'Seed Level-1 Achulu exam paper and individual JSON questions'

    def handle(self, *args, **options):
        paper, created = ExamPaper.objects.get_or_create(
            slug='level-1-achulu',
            defaults={
                'title_en': 'Level 1 · Achulu (Telugu Vowels)',
                'title_te': 'స్థాయి 1 · అచ్చులు',
                'description_en': 'Practice identifying Telugu vowels (Achulu) from pictures and audio prompts.',
                'description_te': 'చిత్రాలు మరియు ఆడియో ఆధారంగా తెలుగు అచ్చులను గుర్తించే పరీక్ష.',
                'instructions_en': (
                    'Look at each question, listen to the audio clue if available, and select the correct '
                    'Telugu letter from the options. Each question has 5 options.'
                ),
                'instructions_te': (
                    'ప్రతి ప్రశ్నను చదివి, ఆడియో వింటూ సరైన అక్షరాన్ని ఎంచుకోండి.'
                ),
                'time_limit_minutes': None,
                'feedback_policy': 'after_submit',
                'active': True,
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created ExamPaper: {paper.title_en}'))
        else:
            self.stdout.write(f'ExamPaper already exists: {paper.title_en}')

        sample_questions = [
            {
                'question_type': 'multiple_choice',
                'question_marks': 1,
                'question_text_en': 'Identify the first letter of the word.',
                'question_text_te': 'పదంలోని మొదటి అక్షరాన్ని గుర్తించండి (అమ్మ).',
                'word_to_pronounce': 'అమ్మ',
                'image_url': '/media/questions/mother.png',
                'audio_url': '/media/questions/amma.mp3',
                'correct_answer': 'అ',
                'wrong_answers': ['ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ౠ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ'],
                'number_of_wrong_answers_to_select': 4,
                'explanation': 'The word అమ్మ begins with the Telugu letter అ.',
            },
            {
                'question_type': 'multiple_choice',
                'question_marks': 1,
                'question_text_en': 'Identify the first letter of the word.',
                'question_text_te': 'పదంలోని మొదటి అక్షరాన్ని గుర్తించండి (ఆవు).',
                'word_to_pronounce': 'ఆవు',
                'image_url': '/media/questions/cow.png',
                'audio_url': '/media/questions/aavu.mp3',
                'correct_answer': 'ఆ',
                'wrong_answers': ['అ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ'],
                'number_of_wrong_answers_to_select': 4,
                'explanation': 'The word ఆవు begins with the Telugu letter ఆ.',
            },
            {
                'question_type': 'multiple_choice',
                'question_marks': 1,
                'question_text_en': 'Identify the first letter of the word.',
                'question_text_te': 'పదంలోని మొదటి అక్షరాన్ని గుర్తించండి (ఇల్లు).',
                'word_to_pronounce': 'ఇల్లు',
                'image_url': '/media/questions/house.png',
                'audio_url': '/media/questions/illu.mp3',
                'correct_answer': 'ఇ',
                'wrong_answers': ['అ', 'ఆ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ'],
                'number_of_wrong_answers_to_select': 4,
                'explanation': 'The word ఇల్లు begins with the Telugu letter ఇ.',
            },
            {
                'question_type': 'multiple_choice',
                'question_marks': 1,
                'question_text_en': 'Identify the first letter of the word.',
                'question_text_te': 'పదంలోని మొదటి అక్షరాన్ని గుర్తించండి (ఈగ).',
                'word_to_pronounce': 'ఈగ',
                'image_url': '',
                'audio_url': '',
                'correct_answer': 'ఈ',
                'wrong_answers': ['అ', 'ఆ', 'ఇ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ'],
                'number_of_wrong_answers_to_select': 4,
                'explanation': 'The word ఈగ begins with the Telugu letter ఈ.',
            },
            {
                'question_type': 'multiple_choice',
                'question_marks': 1,
                'question_text_en': 'Identify the first letter of the word.',
                'question_text_te': 'పదంలోని మొదటి అక్షరాన్ని గుర్తించండి (ఉడుత).',
                'word_to_pronounce': 'ఉడుత',
                'image_url': '',
                'audio_url': '',
                'correct_answer': 'ఉ',
                'wrong_answers': ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ'],
                'number_of_wrong_answers_to_select': 4,
                'explanation': 'The word ఉడుత begins with the Telugu letter ఉ.',
            },
        ]

        # Ensure existing questions for this paper are updated or recreated
        ExamQuestion.objects.filter(paper=paper).delete()

        for idx, q_data in enumerate(sample_questions):
            ExamQuestion.objects.create(
                paper=paper,
                display_order=idx,
                question_data=q_data,
            )
            self.stdout.write(f'  Created Question #{idx + 1} ({q_data.get("question_type", "multiple_choice")})')

        self.stdout.write(self.style.SUCCESS(f'Level-1 Achulu seeded with {len(sample_questions)} individual questions.'))
