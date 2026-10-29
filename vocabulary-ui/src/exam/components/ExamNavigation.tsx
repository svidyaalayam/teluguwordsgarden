/**
 * ExamNavigation.tsx
 * Previous / Next / Finish navigation for the exam.
 *
 * Features:
 *  - Previous button (disabled on first question)
 *  - Next button (disabled on last question)
 *  - "Finish Exam" button on last question or when all questions are answered
 *  - Warning if unanswered questions remain before allowing submission
 *  - Confirmation dialog to prevent accidental submission
 */

interface ExamNavigationProps {
  currentIndex: number    // 0-based
  total: number
  answeredCount: number
  submitting: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export default function ExamNavigation({
  currentIndex,
  total,
  answeredCount,
  submitting,
  onPrevious,
  onNext,
  onSubmit,
}: ExamNavigationProps) {
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const unanswered = total - answeredCount
  const allAnswered = unanswered === 0

  function handleSubmitClick() {
    if (!allAnswered) {
      const msg =
        unanswered === 1
          ? 'You have 1 unanswered question. Submit anyway?'
          : `You have ${unanswered} unanswered questions. Submit anyway?`
      if (!window.confirm(msg)) return
    } else {
      if (!window.confirm('Submit your exam? You cannot change answers after submitting.')) return
    }
    onSubmit()
  }

  return (
    <nav className="en-root" aria-label="Exam navigation">
      <button
        type="button"
        className="en-btn en-btn-secondary"
        onClick={onPrevious}
        disabled={isFirst || submitting}
        aria-label="Previous question"
      >
        ← Previous
      </button>

      <div className="en-center">
        {!allAnswered && isLast && (
          <p className="en-warning" role="status">
            ⚠ {unanswered} question{unanswered !== 1 ? 's' : ''} unanswered
          </p>
        )}
      </div>

      {isLast ? (
        <button
          type="button"
          className="en-btn en-btn-submit"
          onClick={handleSubmitClick}
          disabled={submitting}
          aria-label={submitting ? 'Submitting…' : 'Finish and submit exam'}
        >
          {submitting ? 'Submitting…' : 'Submit Exam ✓'}
        </button>
      ) : (
        <button
          type="button"
          className="en-btn en-btn-primary"
          onClick={onNext}
          disabled={submitting}
          aria-label="Next question"
        >
          Next →
        </button>
      )}
    </nav>
  )
}
