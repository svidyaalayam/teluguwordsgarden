import type { CharacterLesson } from '../types/character'
import { getHorizontalFit } from '../utils/fitStrokes'

type PrintableWorksheetProps = {
  lesson: CharacterLesson
  userName: string
  columns: number
  rows: number
  onClose: () => void
}

export function PrintableWorksheet({ lesson, userName, columns, rows, onClose }: PrintableWorksheetProps) {
  const guidePath = lesson.strokes.map((stroke) => stroke.path).join(' ')
  const coordinatePoints = lesson.strokes.flatMap((stroke) => stroke.points ?? [stroke.start, stroke.end])
  const fit = getHorizontalFit(lesson.strokes)
  const minimumY = lesson.writingBounds?.minY ?? Math.min(...coordinatePoints.map((point) => point.y))
  const maximumY = lesson.writingBounds?.maxY ?? Math.max(...coordinatePoints.map((point) => point.y))
  const writingLineTop = fit.offsetY + minimumY * fit.scale
  const writingLineBottom = fit.offsetY + maximumY * fit.scale

  return (
    <main className="printable-page">
      <div className="printable-actions">
        <button className="secondary-button" type="button" onClick={onClose}>← Back to lesson</button>
        <button className="primary-button" type="button" onClick={() => window.print()}>Print worksheet</button>
      </div>
      <article className="printable-sheet">
        <header className="printable-header">
          <div>
            <p className="worksheet-kicker">బాలముకుందము · వర్ణమాల</p>
            <h1>Write the letter {lesson.glyph}</h1>
            <p>Trace the dots first, then try writing it by yourself.</p>
          </div>
          <div className="printable-glyph">{lesson.glyph}</div>
        </header>
        <div className="printable-student-line">Name: {userName || '____________________________________________'}</div>
        <div className="practice-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns * rows }, (_, index) => (
            <div className="practice-cell" key={`practice-${index}`}>
              <span className="practice-number">{index + 1}</span>
              <svg viewBox="0 0 500 420" role="img" aria-label={`Dotted ${lesson.glyph} practice letter ${index + 1}`}>
                <line className="practice-line" x1="22" y1={writingLineTop} x2="478" y2={writingLineTop} />
                <line className="practice-line" x1="22" y1={writingLineBottom} x2="478" y2={writingLineBottom} />
                {index < 6 && (
                  <g transform={`translate(${fit.offsetX} ${fit.offsetY}) scale(${fit.scale})`}>
                    <path className="practice-guide" d={guidePath} />
                  </g>
                )}
              </svg>
            </div>
          ))}
        </div>
        <footer className="printable-footer">
          <span>Teacher: ____________________</span>
          <span>Date: ____________________</span>
          <strong>Great writing!</strong>
        </footer>
      </article>
    </main>
  )
}
