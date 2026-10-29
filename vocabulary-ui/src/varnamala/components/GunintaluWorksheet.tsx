import { consonantStem, deadConsonant, gunintalu, makeGunintam } from '../data/gunintalu'

type GunintaluWorksheetProps = {
  consonant: string
  consonantTransliteration: string
  userName: string
  onClose: () => void
}

export function GunintaluWorksheet({ consonant, consonantTransliteration, userName, onClose }: GunintaluWorksheetProps) {
  const stem = consonantStem(consonantTransliteration)
  return (
    <main className="printable-page gunintalu-printable gunintalu-writing-sheet">
      <div className="printable-actions">
        <button className="secondary-button" type="button" onClick={onClose}>← Back to గుణింతాలు</button>
        <button className="primary-button" type="button" onClick={() => window.print()}>Print worksheet</button>
      </div>
      <article className="printable-sheet">
        <header className="printable-header">
          <div>
            <p className="worksheet-kicker">బాలముకుందము · గుణింతాలు</p>
            <h1>Practise {consonant} గుణింతాలు</h1>
            <p>Read the equation, copy the model letter, then keep practising across the row.</p>
          </div>
          <div className="printable-glyph">{consonant}</div>
        </header>
        <div className="printable-student-line">Name: {userName || '____________________________________________'}</div>

        <div className="gunintalu-writing-grid" style={{ gridTemplateColumns: '1.7fr repeat(11, minmax(0, 1fr))' }}>
          {gunintalu.flatMap(({ vowel, sign, transliteration }) => {
            const form = makeGunintam(consonant, sign)
            return [
              <div className="gunintalu-equation-cell" key={`${form}-equation`}><span lang="te">{deadConsonant(consonant)} + {vowel}</span><small>{stem} + {transliteration}</small></div>,
              <div className="gunintalu-writing-header" key={`${form}-model`}><span lang="te">{form}</span><small>{stem}{transliteration}</small></div>,
              ...Array.from({ length: 10 }, (_, index) => <div className="gunintalu-writing-cell" key={`${form}-practice-${index}`} />),
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
