/**
 * ExamProgress.tsx
 * Displays a progress bar and summary counts for the current exam.
 */

interface ExamProgressProps {
  current: number          // 1-based
  total: number
  answeredCount: number
}

export default function ExamProgress({
  current,
  total,
  answeredCount,
}: ExamProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const unanswered = total - answeredCount

  return (
    <div className="ep-root" role="status" aria-label="Exam progress">
      <div className="ep-counts">
        <span className="ep-label">
          Question <strong>{current}</strong> of <strong>{total}</strong>
        </span>
        <span className="ep-answered">
          <span className="ep-dot ep-dot-done" aria-hidden="true" />
          {answeredCount} answered
        </span>
        {unanswered > 0 && (
          <span className="ep-unanswered">
            <span className="ep-dot ep-dot-todo" aria-hidden="true" />
            {unanswered} remaining
          </span>
        )}
      </div>

      <div
        className="ep-track"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
      >
        <div className="ep-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
