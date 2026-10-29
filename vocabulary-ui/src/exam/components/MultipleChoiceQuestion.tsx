/**
 * MultipleChoiceQuestion.tsx
 * Primary reusable question component for the Telugu Words Garden exam module.
 *
 * Responsibilities:
 *  - Display bilingual question text (English + Telugu)
 *  - Render optional image and audio via QuestionMedia
 *  - Render answer options using AnswerOption (radio group)
 *  - Record student's selection via onAnswerChange callback
 *  - Display server-returned feedback after submission
 *
 * Security: This component does NOT receive or infer the correct answer.
 *  Feedback (correct/incorrect) is only shown when explicitly passed via
 *  the `feedback` prop after the backend authorises it.
 */

import type { ExamOption } from '../types/exam'
import AnswerOption from './AnswerOption'
import QuestionMedia from './QuestionMedia'

export type { ExamOption }

export interface MultipleChoiceQuestionProps {
  questionId: string
  questionNumber: number
  totalQuestions: number
  questionTextEn: string
  questionTextTe: string
  imageUrl?: string | null
  audioUrl?: string | null
  wordToPronounce?: string | null
  options: ExamOption[]
  selectedOptionId?: string | null
  onAnswerChange: (questionId: string, optionId: string) => void
  disabled?: boolean
  /**
   * Feedback from the server after answer submission.
   * `correct` is only set when the backend feedback_policy permits it.
   */
  feedback?: {
    message?: string
    correct?: boolean
    /** Option id the backend says is correct (only if policy permits) */
    correctOptionId?: string
  } | null
}

export default function MultipleChoiceQuestion({
  questionId,
  questionNumber,
  totalQuestions,
  questionTextEn,
  questionTextTe,
  imageUrl,
  audioUrl,
  wordToPronounce,
  options,
  selectedOptionId,
  onAnswerChange,
  disabled = false,
  feedback = null,
}: MultipleChoiceQuestionProps) {
  const groupName = `mcq-${questionId}`

  // Helper — only reveal correctness when backend sends it
  function optionCorrectness(optId: string): boolean | null {
    if (!feedback || feedback.correct === undefined) return null
    if (!feedback.correctOptionId) return null
    return optId === feedback.correctOptionId
  }

  return (
    <article className="mcq-root" aria-label={`Question ${questionNumber} of ${totalQuestions}`}>
      {/* Bilingual question text */}
      <header className="mcq-header">
        <p className="mcq-text-en">{questionTextEn}</p>
        <p className="mcq-text-te script-telugu">{questionTextTe}</p>
      </header>

      {/* Optional image / audio / TTS */}
      <QuestionMedia
        imageUrl={imageUrl}
        audioUrl={audioUrl}
        wordToPronounce={wordToPronounce}
        imageAlt={`Picture for question ${questionNumber}`}
      />

      {/* Answer options — rendered as a radio group */}
      <fieldset className="mcq-options" aria-label="Answer options">
        <legend className="sr-only">
          Select your answer for question {questionNumber}
        </legend>

        {options.map((option) => (
          <AnswerOption
            key={option.id}
            option={option}
            groupName={groupName}
            isSelected={selectedOptionId === option.id}
            disabled={disabled}
            correct={optionCorrectness(option.id)}
            onChange={(optId) => onAnswerChange(questionId, optId)}
          />
        ))}
      </fieldset>

      {/* Server-returned feedback message */}
      {feedback?.message && (
        <div
          className={`mcq-feedback${feedback.correct === true ? ' mcq-feedback-correct' : feedback.correct === false ? ' mcq-feedback-incorrect' : ''}`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </div>
      )}
    </article>
  )
}
