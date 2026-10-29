/**
 * examMock.ts
 * Development-only mock data for the examination module.
 *
 * Usage: Import MOCK_ATTEMPT in ExamPage.tsx during development when
 * the real backend endpoints are not yet available. Remove before production.
 *
 * IMPORTANT: This file must never be imported in production code paths.
 * The correct answer is NOT included here — it is just one of the options.
 */

import type { ExamAttempt, ExamPaper } from '../types/exam'

export const MOCK_PAPERS: ExamPaper[] = [
  {
    id: 1,
    slug: 'level-1-achulu',
    title_en: 'Level 1 · Achulu (Vowels)',
    title_te: 'స్థాయి 1 · అచ్చులు',
    description_en:
      'Identify the Telugu vowels from pictures and audio clues.',
    description_te: 'చిత్రాలు మరియు ఆడియో సూచనల నుండి తెలుగు అచ్చులను గుర్తించండి.',
    time_limit_minutes: null,
    feedback_policy: 'after_submit',
    question_count: 3,
  },
]

export const MOCK_ATTEMPT: ExamAttempt = {
  id: 1,
  status: 'in_progress',
  started_at: new Date().toISOString(),
  paper_title_en: 'Level 1 · Achulu (Vowels)',
  paper_title_te: 'స్థాయి 1 · అచ్చులు',
  paper_instructions_en:
    'Listen to the audio, look at the picture, and select the correct first letter of the word shown.',
  paper_instructions_te:
    'ఆడియో వినండి, చిత్రం చూడండి, మరియు చూపిన పదంలో మొదటి అక్షరాన్ని ఎంచుకోండి.',
  paper_time_limit_minutes: null,
  questions: [
    {
      id: 1,
      question_id: 'Q001',
      question_type: 'multiple_choice',
      question_number: 1,
      total_questions: 3,
      question_text_en: 'Identify the first letter of the word.',
      question_text_te: 'పదంలోని మొదటి అక్షరాన్ని గుర్తించండి.',
      image_url: '',
      audio_url: '',
      word_to_pronounce: 'అమ్మ',
      marks: 1,
      // Backend shuffles — correct answer (అ) appears at position opt_b here
      prepared_options: [
        { id: 'opt_a', text: 'ఈ' },
        { id: 'opt_b', text: 'అ' },   // correct — but frontend doesn't know this
        { id: 'opt_c', text: 'ఊ' },
        { id: 'opt_d', text: 'ఆ' },
        { id: 'opt_e', text: 'ఐ' },
      ],
      selected_option_id: '',
      is_answered: false,
      display_order: 0,
    },
    {
      id: 2,
      question_id: 'Q002',
      question_type: 'multiple_choice',
      question_number: 2,
      total_questions: 3,
      question_text_en: 'Identify the first letter of the word.',
      question_text_te: 'పదంలోని మొదటి అక్షరాన్ని గుర్తించండి.',
      image_url: '',
      audio_url: '',
      word_to_pronounce: 'అమ్మ',
      marks: 1,
      prepared_options: [
        { id: 'opt_a', text: 'అ' },
        { id: 'opt_b', text: 'ఉ' },   // correct (ఉసిరి)
        { id: 'opt_c', text: 'ఎ' },
        { id: 'opt_d', text: 'ఒ' },
        { id: 'opt_e', text: 'ఋ' },
      ],
      selected_option_id: '',
      is_answered: false,
      display_order: 1,
    },
    {
      id: 3,
      question_id: 'Q003',
      question_type: 'multiple_choice',
      question_number: 3,
      total_questions: 3,
      question_text_en: 'Identify the first letter of the word.',
      question_text_te: 'పదంలోని మొదటి అక్షరాన్ని గుర్తించండి.',
      image_url: '',
      audio_url: '',
      word_to_pronounce: 'అమ్మ',
      marks: 1,
      prepared_options: [
        { id: 'opt_a', text: 'ఇ' },   // correct (ఇల్లు)
        { id: 'opt_b', text: 'ఆ' },
        { id: 'opt_c', text: 'ఓ' },
        { id: 'opt_d', text: 'ఏ' },
        { id: 'opt_e', text: 'ఔ' },
      ],
      selected_option_id: '',
      is_answered: false,
      display_order: 2,
    },
  ],
}
