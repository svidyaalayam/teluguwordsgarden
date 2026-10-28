import type { CharacterLesson } from '../types/character'
import type { TraceAttempt } from '../types/trace'

type WorksheetCertificateProps = {
  lesson: CharacterLesson
  attempts: TraceAttempt[]
  targetCount: number
  userName: string
  onBack: () => void
}

export function WorksheetCertificate({
  lesson,
  attempts,
  targetCount,
  userName,
  onBack,
}: WorksheetCertificateProps) {
  return (
    <section className="certificate-page" aria-labelledby="worksheet-title">
      <div className="certificate-actions">
        <button className="secondary-button" type="button" onClick={onBack}>← Keep practising</button>
        <button className="primary-button" type="button" onClick={() => window.print()}>Print / Save screenshot</button>
      </div>
      <article className="worksheet">
        <header className="worksheet-header">
          <div>
            <p className="worksheet-kicker">బాలముకుందము · వర్ణమాల</p>
            <h1 id="worksheet-title">My tracing worksheet</h1>
            <p>Wonderful work! I practised this letter {targetCount} times.</p>
          </div>
          <div className="worksheet-badge">✓<span>Done!</span></div>
        </header>
        <div className="worksheet-letter">
          <span className="worksheet-glyph">{lesson.glyph}</span>
          <div><p className="worksheet-kicker">Today I learned</p><h2>{lesson.transliteration}</h2><p>Sounds like “{lesson.pronunciation}”</p></div>
        </div>
        <div className="attempt-grid">
          {attempts.map((attempt, index) => (
            <div className="attempt-cell" key={`attempt-${index}`}>
              <div className="attempt-number">{index + 1}</div>
              <svg viewBox="0 0 500 420" role="img" aria-label={`Tracing ${index + 1}`}>
                <path className="worksheet-guide" d={lesson.strokes.map((stroke) => stroke.path).join(' ')} />
                {attempt.map((stroke, strokeIndex) => (
                  <polyline
                    className="worksheet-trace"
                    key={`attempt-${index}-stroke-${strokeIndex}`}
                    points={stroke.map((point) => `${point.x},${point.y}`).join(' ')}
                  />
                ))}
              </svg>
            </div>
          ))}
        </div>
        <footer className="worksheet-footer">
          <span>Student: {userName || '____________________'}</span>
          <span>Date: ____________________</span>
          <span>Teacher: ____________________</span>
        </footer>
      </article>
    </section>
  )
}
