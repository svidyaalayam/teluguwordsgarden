/**
 * ExamResult.tsx
 * Displays the final exam result returned by the server.
 *
 * Security: Only shows correct answers and explanations when the
 *  backend includes them in the response (controlled by feedback_policy).
 *  The frontend does NOT calculate the score — it displays what the server returns.
 */

import type { ExamResult, ResultQuestion } from '../types/exam'

interface ExamResultProps {
  result: ExamResult
  onReturnToList: () => void
}

export default function ExamResultComponent({ result, onReturnToList }: ExamResultProps) {
  const percentage = result.total_marks > 0
    ? Math.round((result.marks_awarded / result.total_marks) * 100)
    : 0

  const showReview =
    result.feedback_policy === 'after_submit' && result.status === 'submitted'

  return (
    <div className="er-root">
      {/* Printable result header with Balamukundam logo */}
      <header className="er-print-header">
        <div className="er-print-brand">
          <img
            src="/bmk-logo.png"
            alt="Balamukundam"
            className="er-print-logo"
            width={56}
            height={56}
          />
          <div>
            <h2 className="er-print-org">Balamukundam · బాలముకుందము</h2>
            <p className="er-print-tagline">Telugu Learning Examination Sheet</p>
          </div>
        </div>
        <div className="er-print-meta">
          <p className="er-print-paper-title">
            <strong>Exam:</strong> {result.paper_title_en}
            {result.paper_title_te && ` (${result.paper_title_te})`}
          </p>
          <p className="er-print-date">
            <strong>Date:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </header>

      {/* Score summary — server-returned, not client-calculated */}
      <div className="er-score-card">
        <span className="er-trophy" aria-hidden="true">🏆</span>
        <h2 className="er-title">Exam Complete!</h2>
        <p className="er-subtitle script-telugu">{result.paper_title_te || result.paper_title_en}</p>

        <div className="er-score-display">
          <span className="er-score-num">{result.marks_awarded}</span>
          <span className="er-score-sep">/</span>
          <span className="er-score-total">{result.total_marks}</span>
        </div>
        <p className="er-percent">{percentage}%</p>

        <div className="er-score-bar-track">
          <div className="er-score-bar-fill" style={{ width: `${percentage}%` }} />
        </div>

        <p className="er-grade-msg">
          {percentage >= 80
            ? '🌟 Excellent work!'
            : percentage >= 60
            ? '👍 Good effort!'
            : '📖 Keep practising!'}
        </p>
      </div>

      {/* Per-question review (only when policy allows) */}
      {showReview && result.questions.length > 0 && (
        <section className="er-review" aria-label="Answer review">
          <h3 className="er-review-title">Answer Review</h3>
          <div className="er-review-list">
            {result.questions.map((q: ResultQuestion, idx: number) => (
              <ReviewItem key={q.question_id} question={q} index={idx} />
            ))}
          </div>
        </section>
      )}

      <div className="er-actions">
        <button
          type="button"
          className="home-btn secondary"
          onClick={() => window.print()}
        >
          🖨️ Print Result Sheet
        </button>
        <button
          type="button"
          className="home-btn"
          onClick={onReturnToList}
        >
          Back to Exams
        </button>
      </div>
    </div>
  )
}

function ReviewItem({ question, index }: { question: ResultQuestion; index: number }) {
  const selectedOption = question.prepared_options.find(
    (o) => o.id === question.selected_option_id,
  )

  return (
    <div
      className={`er-review-item${question.is_correct ? ' er-review-correct' : ' er-review-incorrect'}`}
    >
      <div className="er-review-header">
        <span className="er-review-num">Q{index + 1}</span>
        <span className={`er-review-badge${question.is_correct ? ' er-badge-correct' : ' er-badge-incorrect'}`}>
          {question.is_correct ? '✓ Correct' : '✗ Incorrect'}
        </span>
        <span className="er-review-marks">
          {question.marks_awarded} mark{question.marks_awarded !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="er-review-q-en">{question.question_text_en}</p>
      {question.question_text_te && (
        <p className="er-review-q-te script-telugu">{question.question_text_te}</p>
      )}

      <p className="er-review-answer">
        <span className="er-review-answer-label">Your answer: </span>
        <span className={`er-review-answer-text script-telugu${question.is_correct ? ' er-text-correct' : ' er-text-incorrect'}`}>
          {selectedOption ? selectedOption.text : '—'}
        </span>
      </p>

      {/* Only shown when backend sends correct_answer */}
      {question.correct_answer && !question.is_correct && (
        <p className="er-review-correct-answer">
          <span className="er-review-answer-label">Correct answer: </span>
          <span className="er-review-answer-text script-telugu er-text-correct">
            {question.correct_answer}
          </span>
        </p>
      )}

      {question.explanation && (
        <p className="er-review-explanation">{question.explanation}</p>
      )}
    </div>
  )
}
