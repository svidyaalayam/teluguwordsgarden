/**
 * ExamWorksheet.tsx
 * Printable question worksheet for an exam paper with Balamukundam branding.
 */

import type { ExamAttempt } from '../types/exam'

interface ExamWorksheetProps {
  attempt: ExamAttempt
  onClose: () => void
}

export default function ExamWorksheet({ attempt, onClose }: ExamWorksheetProps) {
  const totalMarks = attempt.questions.reduce((sum, q) => sum + (q.marks || 1), 0)

  return (
    <div className="ews-root">
      {/* Top action bar — hidden on print */}
      <div className="ews-actions">
        <button
          type="button"
          className="home-btn secondary"
          onClick={onClose}
        >
          ← Back to Exam
        </button>
        <button
          type="button"
          className="home-btn"
          onClick={() => window.print()}
        >
          🖨️ Print Worksheet
        </button>
      </div>

      {/* Printable Sheet Container */}
      <article className="ews-sheet">
        {/* Header with Balamukundam logo */}
        <header className="ews-header">
          <div className="ews-brand">
            <img
              src="/bmk-logo.png"
              alt="Balamukundam"
              className="ews-logo"
              width={64}
              height={64}
            />
            <div className="ews-brand-info">
              <h1 className="ews-org">Balamukundam · బాలముకుందము</h1>
              <p className="ews-tagline">Telugu Learning Examination Worksheet</p>
            </div>
          </div>
          <div className="ews-paper-title-block">
            <h2 className="ews-paper-title">{attempt.paper_title_en}</h2>
            {attempt.paper_title_te && (
              <p className="ews-paper-title-te script-telugu">{attempt.paper_title_te}</p>
            )}
          </div>
        </header>

        {/* Student identification line */}
        <div className="ews-student-bar">
          <div className="ews-field">
            <span className="ews-label">Student Name:</span>
            <span className="ews-line">____________________________________</span>
          </div>
          <div className="ews-field">
            <span className="ews-label">Roll No:</span>
            <span className="ews-line">______________</span>
          </div>
          <div className="ews-field">
            <span className="ews-label">Date:</span>
            <span className="ews-line">______________</span>
          </div>
        </div>

        {/* Exam metadata */}
        <div className="ews-meta-bar">
          <span><strong>Total Questions:</strong> {attempt.questions.length}</span>
          <span><strong>Max Marks:</strong> {totalMarks}</span>
          {attempt.paper_time_limit_minutes && (
            <span><strong>Time Limit:</strong> {attempt.paper_time_limit_minutes} minutes</span>
          )}
        </div>

        {/* Instructions */}
        {attempt.paper_instructions_en && (
          <div className="ews-instructions">
            <strong>Instructions:</strong> {attempt.paper_instructions_en}
            {attempt.paper_instructions_te && (
              <span className="script-telugu"> ({attempt.paper_instructions_te})</span>
            )}
          </div>
        )}

        {/* Questions list */}
        <ol className="ews-questions-list">
          {attempt.questions.map((q, idx) => (
            <li key={q.question_id || idx} className="ews-question-item">
              <div className="ews-q-header">
                <span className="ews-q-num">Q{idx + 1}.</span>
                <span className="ews-q-text-en">{q.question_text_en}</span>
                {q.question_text_te && (
                  <span className="ews-q-text-te script-telugu"> {q.question_text_te}</span>
                )}
                <span className="ews-q-marks">[{q.marks || 1} mark{(q.marks || 1) !== 1 ? 's' : ''}]</span>
              </div>

              {q.word_to_pronounce && (
                <div className="ews-q-clue">
                  <span className="ews-clue-label">Clue word:</span>{' '}
                  <strong className="script-telugu">{q.word_to_pronounce}</strong>
                </div>
              )}

              {q.image_url && (
                <div className="ews-q-image">
                  <img src={q.image_url} alt={`Q${idx + 1} clue`} />
                </div>
              )}

              {/* Multiple choice bubbles */}
              <div className="ews-options-grid">
                {q.prepared_options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx)
                  return (
                    <div key={opt.id || optIdx} className="ews-option-bubble">
                      <span className="ews-bubble-circle" />
                      <span className="ews-bubble-letter">({letter})</span>
                      <span className="ews-bubble-text script-telugu">{opt.text}</span>
                    </div>
                  )
                })}
              </div>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <footer className="ews-footer">
          <div>
            <span>Teacher's Signature: ______________________</span>
          </div>
          <div>
            <span>Marks Awarded: ________ / {totalMarks}</span>
          </div>
          <div>
            <span>Grade / Remarks: ______________________</span>
          </div>
        </footer>
      </article>
    </div>
  )
}
