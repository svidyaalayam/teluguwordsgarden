// ============================================================
// Examination Module — Shared TypeScript Types
// ============================================================
// Security note: correct_option_id and answer keys are NEVER
// included in these frontend types. The backend is the sole
// authority for correctness checking and scoring.
// ============================================================

// --------------- Answer options -----------------

export interface ExamOption {
  id: string;
  text: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
}

// --------------- Question (as sent by backend) -----------------

export interface PreparedQuestion {
  /** AttemptQuestion PK — used as a stable key for state mapping */
  id: number;
  /** Stable question key like "Q001" */
  question_id: string;
  question_type: 'multiple_choice' | string;
  question_number: number;
  total_questions: number;
  question_text_en: string;
  question_text_te: string;
  image_url: string;
  audio_url: string;
  word_to_pronounce?: string;
  marks: number;
  /** Shuffled options — no answer key */
  prepared_options: ExamOption[];
  selected_option_id: string;
  is_answered: boolean;
  display_order: number;
}

// --------------- Exam attempt -----------------

export interface ExamAttempt {
  id: number;
  status: 'in_progress' | 'submitted' | 'expired';
  started_at: string;
  paper_title_en: string;
  paper_title_te: string;
  paper_instructions_en: string;
  paper_instructions_te: string;
  paper_time_limit_minutes: number | null;
  questions: PreparedQuestion[];
}

// --------------- Exam paper (list/detail) -----------------

export interface ExamPaper {
  id: number;
  slug: string;
  title_en: string;
  title_te: string;
  description_en: string;
  description_te: string;
  time_limit_minutes: number | null;
  feedback_policy: 'after_submit' | 'after_review' | 'never';
  question_count: number;
}

// --------------- Answer submission -----------------

export interface AnswerSubmitPayload {
  question_id: string;
  selected_option_id: string;
}

export interface AnswerFeedback {
  /** Only present when feedback_policy allows it */
  correct_answer?: string;
  explanation?: string;
}

export interface AnswerResponse {
  question_id: string;
  /** NOTE: frontend only uses this for display AFTER submission */
  is_correct: boolean;
  marks_awarded: number;
  feedback?: AnswerFeedback;
}

// --------------- Exam result -----------------

export interface ResultQuestion {
  question_id: string;
  question_type?: 'multiple_choice' | string;
  question_text_en: string;
  question_text_te: string;
  selected_option_id: string;
  is_correct: boolean | null;
  marks_awarded: number;
  prepared_options: ExamOption[];
  /** Only present when feedback_policy permits release */
  correct_answer?: string;
  explanation?: string;
}

export interface ExamResult {
  id: number;
  status: 'submitted';
  started_at: string;
  submitted_at: string;
  paper_title_en: string;
  paper_title_te: string;
  total_marks: number;
  marks_awarded: number;
  feedback_policy: 'after_submit' | 'after_review' | 'never';
  questions: ResultQuestion[];
}

// --------------- Component props -----------------

export interface MultipleChoiceQuestionProps {
  questionId: string;
  questionNumber: number;
  totalQuestions: number;
  questionTextEn: string;
  questionTextTe: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  wordToPronounce?: string | null;
  options: ExamOption[];
  selectedOptionId?: string | null;
  onAnswerChange: (questionId: string, optionId: string) => void;
  disabled?: boolean;
  feedback?: {
    message?: string;
    correct?: boolean;
  } | null;
}
