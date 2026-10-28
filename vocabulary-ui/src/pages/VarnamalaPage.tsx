import { useCallback, useState } from 'react'
import '../styles/Varnamala.css'
import Header from '../components/Header'
import { useAuth } from '../auth/AuthContext'
import { CharacterCard } from '../varnamala/components/CharacterCard'
import { StrokeDemo } from '../varnamala/components/StrokeDemo'
import { TracingBoard } from '../varnamala/components/TracingBoard'
import { PrintableWorksheet } from '../varnamala/components/PrintableWorksheet'
import { WorksheetCertificate } from '../varnamala/components/WorksheetCertificate'
import { teluguCharacters } from '../varnamala/data/teluguCharacters'
import { WordExamples } from '../varnamala/components/WordExamples'
import { LanguageSelector, type LanguageId } from '../varnamala/components/LanguageSelector'
import { PdfPreview } from '../varnamala/components/PdfPreview'
import { PronunciationButton } from '../varnamala/components/PronunciationButton'
import { aWordExamples } from '../varnamala/data/teluguWordExamples'
import { hindiCharacters } from '../varnamala/data/hindiCharacters'
import type { TraceAttempt } from '../varnamala/types/trace'

export default function VarnamalaPage() {
  const { user } = useAuth()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [language, setLanguage] = useState<LanguageId>('telugu')
  const [mode, setMode] = useState<'learn' | 'trace'>('learn')
  const [playing, setPlaying] = useState(false)
  const [audioRequest, setAudioRequest] = useState(0)
  const [completed, setCompleted] = useState<string[]>([])
  const [targetCount, setTargetCount] = useState(5)
  const [traceAttempts, setTraceAttempts] = useState<TraceAttempt[]>([])
  const [showPrintableWorksheet, setShowPrintableWorksheet] = useState(false)
  const [worksheetColumns, setWorksheetColumns] = useState(3)
  const [worksheetRows, setWorksheetRows] = useState(4)
  const [manualName, setManualName] = useState(() => sessionStorage.getItem('varna_manual_name') || '')
  const characters = language === 'hindi' ? hindiCharacters : teluguCharacters
  const activeLesson = characters[selectedIndex] ?? characters[0]
  const userName = user ? (user.first_name || user.username) : manualName.trim()
  const vowelIds = new Set(['a', 'aa', 'i', 'ii', 'u', 'uu', 'ru', 'ruu', 'lu', 'luu', 'e', 'ee', 'ai', 'o', 'oo', 'au', 'am', 'aha'])
  const vowels = characters.filter((item) => vowelIds.has(item.id))
  const consonants = characters.filter((item) => !vowelIds.has(item.id))
  const categoryLabels = {
    telugu: { vowels: 'అచ్చులు', consonants: 'హల్లులు' },
    hindi: { vowels: 'स्वर', consonants: 'व्यंजन' },
    kannada: { vowels: 'ಸ್ವರಗಳು', consonants: 'ವ್ಯಂಜನಗಳು' },
    tamil: { vowels: 'உயிரெழுத்துக்கள்', consonants: 'மெய்யெழுத்துக்கள்' },
  }[language]

  const selectLanguage = (nextLanguage: LanguageId) => {
    setLanguage(nextLanguage)
    setSelectedIndex(0)
    setMode('learn')
    setPlaying(false)
    setTraceAttempts([])
    setAudioRequest((request) => request + 1)
  }

  const recordTrace = useCallback((attempt: TraceAttempt) => {
    setTraceAttempts((items) => {
      const nextItems = [...items, attempt]
      if (nextItems.length >= targetCount) {
        const completionId = `${language}:${activeLesson.id}`
        setCompleted((completedItems) => completedItems.includes(completionId) ? completedItems : [...completedItems, completionId])
      }
      return nextItems
    })
  }, [activeLesson.id, language, targetCount])

  const chooseCharacter = (index: number) => {
    setSelectedIndex(index)
    setMode('learn')
    setPlaying(false)
    setTraceAttempts([])
    setAudioRequest((request) => request + 1)
  }

  const nextCharacter = () => {
    setSelectedIndex((index) => Math.min(index + 1, characters.length - 1))
    setMode('learn')
    setPlaying(false)
    setTraceAttempts([])
    setAudioRequest((request) => request + 1)
  }

  const previousCharacter = () => {
    setSelectedIndex((index) => Math.max(index - 1, 0))
    setMode('learn')
    setPlaying(false)
    setTraceAttempts([])
    setAudioRequest((request) => request + 1)
  }

  if (showPrintableWorksheet) {
    return <div className="varnamala-page"><Header /><PrintableWorksheet lesson={activeLesson} userName={userName} columns={worksheetColumns} rows={worksheetRows} onClose={() => setShowPrintableWorksheet(false)} /></div>
  }

  return (
    <div className="varnamala-page">
      <Header />
      <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">అ</span>
          <div><strong>బాలముకుందము</strong><span>వర్ణమాల</span></div>
        </div>
        <div className="topbar-actions">
          <LanguageSelector value={language} onChange={selectLanguage} />
          <div className="progress-pill"><span>★</span> {completed.length} learned</div>
        </div>
      </header>

      <section className="welcome">
        <div className="welcome-copy">
          <h1>
            {userName ? (
              <>
                <span className="welcome-greeting">Welcome back,</span>
                <span className="welcome-name">{userName}!</span>
              </>
            ) : 'Let’s learn to write!'}
          </h1>
          <p className="intro">Look, listen with your eyes, then trace each letter with your finger.</p>
          {!user && (
            <label className="manual-name-field">
              <span>Your name <em>(optional)</em></span>
              <input
                value={manualName}
                onChange={(event) => {
                  const name = event.target.value
                  setManualName(name)
                  sessionStorage.setItem('varna_manual_name', name)
                }}
                placeholder="Type your name"
                maxLength={80}
              />
            </label>
          )}
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="welcome-art-letter">అ</span>
          <span className="welcome-art-spark spark-one">✦</span>
          <span className="welcome-art-spark spark-two">✦</span>
        </div>
      </section>

      <section className="lesson-picker" aria-labelledby="choose-letter">
        <div className="section-heading compact">
          <div><p className="eyebrow">Choose a letter</p><h2 id="choose-letter">Pick one to practise</h2></div>
          <span className="set-label">{language === 'hindi' ? 'Hindi · हिन्दी' : 'Telugu · తెలుగు'}</span>
        </div>
        <div className="letter-sessions">
          <details className="letter-session" open>
            <summary>
              <span><strong>{categoryLabels.vowels}</strong><small>Vowels</small></span>
              <span className="session-chevron">⌄</span>
            </summary>
            <div className="character-grid">
              {vowels.map((item) => {
                const index = characters.findIndex((character) => character.id === item.id)
                return <CharacterCard key={item.id} lesson={item} selected={index === selectedIndex} onSelect={() => chooseCharacter(index)} />
              })}
            </div>
          </details>
          <details className="letter-session">
            <summary>
              <span><strong>{categoryLabels.consonants}</strong><small>Consonants</small></span>
              <span className="session-chevron">⌄</span>
            </summary>
            <div className="character-grid">
              {consonants.map((item) => {
                const index = characters.findIndex((character) => character.id === item.id)
                return <CharacterCard key={item.id} lesson={item} selected={index === selectedIndex} onSelect={() => chooseCharacter(index)} />
              })}
            </div>
          </details>
        </div>
      </section>

      <section className="lesson-area">
        <div className="worksheet-controls">
          <div className="worksheet-size">
            <label>
              <span>Columns</span>
              <input
                type="number"
                min="1"
                max="8"
                value={worksheetColumns}
                onChange={(event) => setWorksheetColumns(Math.min(8, Math.max(1, Number(event.target.value) || 1)))}
              />
            </label>
            <span className="worksheet-size-x">×</span>
            <label>
              <span>Rows</span>
              <input
                type="number"
                min="1"
                max="12"
                value={worksheetRows}
                onChange={(event) => setWorksheetRows(Math.min(12, Math.max(1, Number(event.target.value) || 1)))}
              />
            </label>
          </div>
          <button className="worksheet-link" type="button" onClick={() => setShowPrintableWorksheet(true)}>
            Print {worksheetColumns} × {worksheetRows} worksheet for {activeLesson.glyph} <span>↗</span>
          </button>
        </div>
        <div className="letter-navigation" aria-label="Letter navigation">
          <button className="secondary-button" type="button" onClick={previousCharacter} disabled={selectedIndex === 0}>
            ← Previous letter
          </button>
          <span>{selectedIndex + 1} of {characters.length}</span>
          <button className="secondary-button" type="button" onClick={nextCharacter} disabled={selectedIndex === characters.length - 1}>
            Next letter →
          </button>
        </div>

        {mode === 'learn' ? (
          <div className="learn-grid">
            <div className="fact-card">
              <p className="eyebrow">A word to remember</p>
              <p className="example-word">{activeLesson.exampleWord}</p>
              <PronunciationButton lesson={activeLesson} requestKey={audioRequest} />
              <p className="tip">💡 {activeLesson.tip}</p>
              <button className="primary-button" type="button" onClick={() => setMode('trace')}>Practice <span>→</span></button>
            </div>
            <StrokeDemo strokes={activeLesson.strokes} playing={playing} onPlayingChange={setPlaying} />
          </div>
        ) : (
          traceAttempts.length >= targetCount ? (
            <WorksheetCertificate lesson={activeLesson} attempts={traceAttempts} targetCount={targetCount} userName={userName} onBack={() => setTraceAttempts([])} />
          ) : (
            <div className="trace-layout">
              <TracingBoard key={`${language}-${activeLesson.id}-${traceAttempts.length}`} lesson={activeLesson} onComplete={recordTrace} />
              <aside className="trace-side">
                <p className="eyebrow">Today's homework</p>
                <h3>Trace it {targetCount} times</h3>
                <label className="homework-input">
                  <span>How many times?</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={targetCount}
                    onChange={(event) => {
                      const count = Number.parseInt(event.target.value, 10)
                      if (Number.isFinite(count) && count > 0) {
                        setTargetCount(count)
                        setTraceAttempts([])
                      }
                    }}
                    aria-label="Number of times to trace"
                  />
                </label>
                <div className="homework-count"><strong>{traceAttempts.length}</strong> / {targetCount} completed</div>
                <p>Start at the glowing dot and follow every part of the grey path.</p>
                <button className="secondary-button full-width" type="button" onClick={() => setMode('learn')}>← Look and Learn</button>
              </aside>
            </div>
          )
        )}
        {activeLesson.pdfUrl && <PdfPreview url={activeLesson.pdfUrl} title={activeLesson.glyph} />}
      </section>

      {language === 'telugu' && activeLesson.id === 'a' && <WordExamples words={aWordExamples} />}

      <footer>Made for curious little writers <span>•</span> తెలుగు నేర్చుకుందాం</footer>
      </main>
    </div>
  )
}
