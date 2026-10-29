import { consonantStem, deadConsonant } from '../data/gunintalu'
import type { CharacterLesson } from '../types/character'

type OttuluWorksheetProps = {
  joinedConsonant: CharacterLesson
  consonants: CharacterLesson[]
  userName: string
  onClose: () => void
}

export function OttuluWorksheet({ joinedConsonant, consonants, userName, onClose }: OttuluWorksheetProps) {
  const joinedStem = consonantStem(joinedConsonant.transliteration)

  return (
    <main className="printable-page gunintalu-printable ottulu-writing-sheet">
      <div className="printable-actions">
        <button className="secondary-button" type="button" onClick={onClose}>← Back to ఒత్తులు</button>
        <button className="primary-button" type="button" onClick={() => window.print()}>Print worksheet</button>
      </div>
      <article className="printable-sheet">
        <header className="printable-header">
          <div className="printable-header-main">
            <img src="/bmk-logo.png" alt="Balamukundam" className="worksheet-logo" width={56} height={56} />
            <div>
              <p className="worksheet-kicker">బాలముకుందము · ఒత్తులు</p>
              <h1>Practise {joinedConsonant.glyph} ఒత్తులు</h1>
              <p>Read the joined letters, copy the model, then keep practising across the row.</p>
            </div>
          </div>
          <div className="printable-glyph">{joinedConsonant.glyph}</div>
        </header>
        <div className="printable-student-line">Name: {userName || '____________________________________________'}</div>
        <div className="gunintalu-writing-grid" style={{ gridTemplateColumns: '1.9fr repeat(11, minmax(0, 1fr))' }}>
          {consonants.flatMap((consonant) => {
            const sourceStem = consonantStem(consonant.transliteration)
            const joined = `${consonant.glyph}్${joinedConsonant.glyph}`
            const transliteration = `${sourceStem}${joinedConsonant.transliteration}`
            return [
              <div className="gunintalu-equation-cell" key={`${consonant.id}-equation`}><span lang="te">{deadConsonant(consonant.glyph)} + {joinedConsonant.glyph}</span><small>{sourceStem} + {joinedConsonant.transliteration}</small></div>,
              <div className="gunintalu-writing-header" key={`${consonant.id}-model`}><span lang="te">{joined}</span><small>{transliteration}</small></div>,
              ...Array.from({ length: 10 }, (_, index) => <div className="gunintalu-writing-cell" key={`${consonant.id}-practice-${index}`} />),
            ]
          })}
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
