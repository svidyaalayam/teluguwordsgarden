import { useState, useEffect, useCallback, useMemo } from 'react'
import type { VocabularyCategory, VocabularyWord } from '../api/vocabulary'
import { getWordVisual, formatBilingualCategory } from '../utils/wordVisuals'
import { playChime, playBuzzer, playPop, playFanfare, speakWord } from '../utils/audioFx'
import {
  teluguToIast,
  splitTeluguAksharas,
  classifyTeluguWord,
  COMPLEXITY_LABELS,
  COMPLEXITY_ORDER,
  type ComplexityLevel,
} from '../utils/teluguTransliteration'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListenSpellActivityProps {
  words: VocabularyWord[]
  categories: VocabularyCategory[]
  onBackToCards?: () => void
}

/** A single tile in the spelling game. Works for both IAST and Telugu-akshara modes. */
interface LetterTile {
  id: string
  letter: string // Either an IAST grapheme ('ṭ', 'ṃ') or a Telugu akshara ('టి', 'పం')
  isUsed: boolean
}

type SpellingMode = 'telugu' | 'iast'

// ─── IAST grapheme splitter ───────────────────────────────────────────────────

/**
 * Splits an IAST string into grapheme tiles.
 * Digraphs (kh, gh, ṭh, ḍh, th, dh, ph, bh …) are kept as one tile.
 */
function splitIastGraphemes(iast: string): string[] {
  const digraphs = [
    'kh', 'gh', 'ch', 'jh', 'ṭh', 'ḍh', 'th', 'dh', 'ph', 'bh',
    'ṅ', 'ñ', 'ṇ', 'ś', 'ṣ', 'ṟ', 'ḷ', 'ṛ', 'ṝ', 'ḹ',
  ]
  const result: string[] = []
  let i = 0
  while (i < iast.length) {
    let matched = false
    for (const dg of digraphs) {
      if (iast.slice(i, i + dg.length) === dg) {
        result.push(dg)
        i += dg.length
        matched = true
        break
      }
    }
    if (!matched) {
      result.push(iast[i])
      i++
    }
  }
  return result
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListenSpellActivity({
  words,
  categories,
  onBackToCards,
}: ListenSpellActivityProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedComplexity, setSelectedComplexity] = useState<string>('')
  const [wordsPerRound, setWordsPerRound] = useState<number>(10)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [slowAudio, setSlowAudio] = useState(false)
  const [mode, setMode] = useState<SpellingMode>('telugu') // default to Telugu script

  // Round words (shuffled randomly)
  const [roundWords, setRoundWords] = useState<VocabularyWord[]>([])
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false)

  // Tile state
  const [tiles, setTiles] = useState<LetterTile[]>([])
  const [placedLetters, setPlacedLetters] = useState<{ id: string; letter: string }[]>([])
  const [isWordComplete, setIsWordComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  // ── Eligible words ──────────────────────────────────────────────────────────
  const eligibleWords = useMemo(() => {
    return words.filter((w) => {
      const units =
        mode === 'telugu'
          ? splitTeluguAksharas(w.term).filter((u) => u.trim() !== '')
          : splitIastGraphemes(teluguToIast(w.term))
      if (units.length < 2 || units.length > 12) return false

      if (selectedCategory) {
        const catId = Number(selectedCategory)
        if (!w.categories.includes(catId)) return false
      }

      if (selectedComplexity) {
        const { level } = classifyTeluguWord(w.term)
        if (level !== selectedComplexity) return false
      }

      return true
    })
  }, [words, selectedCategory, selectedComplexity, mode])

  // ── Start / Shuffle new round ───────────────────────────────────────────────
  const startNewRound = useCallback(() => {
    if (eligibleWords.length === 0) {
      setRoundWords([])
      return
    }
    const shuffled = [...eligibleWords].sort(() => 0.5 - Math.random())
    const count = wordsPerRound > 0 ? Math.min(wordsPerRound, shuffled.length) : shuffled.length
    setRoundWords(shuffled.slice(0, count))
    setCurrentIndex(0)
    setRoundCompleted(false)
    setIsWordComplete(false)
    setPlacedLetters([])
  }, [eligibleWords, wordsPerRound])

  useEffect(() => {
    startNewRound()
  }, [startNewRound])

  const currentWord = roundWords[currentIndex]

  // ── Computed target units (aksharas or IAST graphemes) ──────────────────────
  const iastString = useMemo(
    () => (currentWord ? teluguToIast(currentWord.term) : ''),
    [currentWord],
  )

  const targetUnits = useMemo(() => {
    if (!currentWord) return []
    if (mode === 'telugu') {
      return splitTeluguAksharas(currentWord.term).filter((u) => u.trim() !== '')
    }
    return splitIastGraphemes(iastString)
  }, [currentWord, mode, iastString])

  // ── Set up / scramble tiles whenever target changes ─────────────────────────
  const setupTiles = useCallback(() => {
    if (!targetUnits.length) return
    const tileList: LetterTile[] = targetUnits.map((letter, idx) => ({
      id: `${letter}-${idx}-${Math.random().toString(36).slice(2)}`,
      letter,
      isUsed: false,
    }))
    // Ensure scrambled
    do {
      tileList.sort(() => 0.5 - Math.random())
    } while (
      tileList.length > 1 &&
      tileList.every((t, i) => t.letter === targetUnits[i])
    )
    setTiles(tileList)
    setPlacedLetters([])
    setIsWordComplete(false)
  }, [targetUnits])

  useEffect(() => {
    setupTiles()
  }, [setupTiles])

  // ── Audio ───────────────────────────────────────────────────────────────────
  const handlePlayAudio = useCallback(
    (rate = 0.85) => {
      if (!currentWord) return
      setIsPlayingAudio(true)
      setSlowAudio(rate < 0.75)
      speakWord(currentWord.term, {
        rate,
        audioUrl: currentWord.audio_url,
        lang: 'te-IN',
        transliteration: iastString,
        onEnd: () => {
          setIsPlayingAudio(false)
          setSlowAudio(false)
        },
      })
    },
    [currentWord, iastString],
  )

  useEffect(() => {
    if (!currentWord || roundCompleted) return
    const timer = setTimeout(() => handlePlayAudio(0.85), 300)
    return () => clearTimeout(timer)
  }, [currentIndex, currentWord, roundCompleted, handlePlayAudio])

  // ── Tile interaction ────────────────────────────────────────────────────────
  const handleTileClick = (tile: LetterTile) => {
    if (tile.isUsed || isWordComplete || !targetUnits.length) return
    playPop()
    const newPlaced = [...placedLetters, { id: tile.id, letter: tile.letter }]
    setPlacedLetters(newPlaced)
    setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, isUsed: true } : t)))

    if (newPlaced.length === targetUnits.length) {
      const correct = newPlaced.every((p, i) => p.letter === targetUnits[i])
      if (correct) {
        playChime()
        setIsWordComplete(true)
        setScore((s) => s + 15)
        setStreak((s) => s + 1)
      } else {
        playBuzzer()
      }
    }
  }

  const handleRemoveLetter = (index: number) => {
    if (isWordComplete) return
    playPop()
    const removed = placedLetters[index]
    setPlacedLetters((prev) => prev.filter((_, i) => i !== index))
    setTiles((prev) => prev.map((t) => (t.id === removed.id ? { ...t, isUsed: false } : t)))
  }

  const handleResetLetters = () => {
    playPop()
    setPlacedLetters([])
    setTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })))
  }

  const handleNextWord = () => {
    playPop()
    if (currentIndex + 1 < roundWords.length) {
      setCurrentIndex((prev) => prev + 1)
      setIsWordComplete(false)
      setPlacedLetters([])
    } else {
      playFanfare()
      setRoundCompleted(true)
    }
  }

  const handleModeChange = (newMode: SpellingMode) => {
    setMode(newMode)
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!currentWord && !roundCompleted) {
    return (
      <div className="activity-container">
        <div className="activity-empty">
          <span className="activity-icon-large">🧩</span>
          <h3>No spelling words in this selection</h3>
          <p>Please select another category or complexity level.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            <button
              className="home-btn"
              onClick={() => {
                setSelectedCategory('')
                setSelectedComplexity('')
              }}
            >
              Show all words
            </button>
          </div>
        </div>
      </div>
    )
  }

  const visual = currentWord ? getWordVisual(currentWord.term, currentWord.image_url) : null
  const mainMeaning = currentWord ? currentWord.definition.split('•')[0].trim() : ''
  const isTeluguMode = mode === 'telugu'
  const wordComplexity = currentWord ? classifyTeluguWord(currentWord.term) : null
  const complexityBadge = wordComplexity ? COMPLEXITY_LABELS[wordComplexity.level] : null

  return (
    <div className="activity-container">
      <div className="activity-header">
        <div className="activity-title-wrap">
          <span className="activity-badge-pill">🧩 Telugu Phonics &amp; Spelling</span>
          <h2>Listen &amp; Spell • విని పదం రాయండి</h2>

          {/* ── Mode toggle ─────────────────────────────────────────────── */}
          <div className="spell-mode-toggle">
            <button
              type="button"
              className={`spell-mode-btn ${isTeluguMode ? 'active' : ''}`}
              onClick={() => handleModeChange('telugu')}
              title="Spell using Telugu aksharas (syllable tiles)"
            >
              <span className="telugu-script">తె</span> Telugu Script
            </button>
            <button
              type="button"
              className={`spell-mode-btn ${!isTeluguMode ? 'active' : ''}`}
              onClick={() => handleModeChange('iast')}
              title="Spell using IAST phonetic letters"
            >
              🔤 IAST Phonetic
            </button>
          </div>

          <p className="iast-tip">
            {isTeluguMode ? (
              <>
                Listen to the sound and read the IAST word, then tap the Telugu <strong>అక్షరాలు (aksharas)</strong> in order to spell it!
              </>
            ) : (
              <>
                Read the Telugu word and listen to the sound, then arrange the <strong>IAST</strong> letters in order to spell it!
              </>
            )}
          </p>
        </div>

        <div className="activity-filters">
          <label className="vocabulary-filter">
            Category • విభాగం
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setScore(0)
                setStreak(0)
              }}
            >
              <option value="">All Categories • అన్ని విభాగాలు ({words.length} words)</option>
              {categories.map((cat) => {
                const bilingual = formatBilingualCategory(cat.name)
                return (
                  <option key={cat.id} value={cat.id}>
                    {bilingual.combined}
                  </option>
                )
              })}
            </select>
          </label>

          <label className="vocabulary-filter">
            Complexity • స్థాయి
            <select
              value={selectedComplexity}
              onChange={(e) => {
                setSelectedComplexity(e.target.value)
                setScore(0)
                setStreak(0)
              }}
            >
              <option value="">All Levels • అన్ని స్థాయిలు</option>
              {COMPLEXITY_ORDER.map((lvl) => {
                const info = COMPLEXITY_LABELS[lvl]
                return (
                  <option key={lvl} value={lvl}>
                    {info.emoji} {info.labelTe} ({info.label})
                  </option>
                )
              })}
            </select>
          </label>

          <label className="vocabulary-filter">
            Words • పదాలు
            <select
              value={wordsPerRound}
              onChange={(e) => {
                setWordsPerRound(Number(e.target.value))
                setScore(0)
                setStreak(0)
              }}
            >
              <option value={5}>5 Words (Random)</option>
              <option value={10}>10 Words (Random)</option>
              <option value={25}>25 Words (Random)</option>
              <option value={0}>All Available Words</option>
            </select>
          </label>

          <button
            type="button"
            className="activity-secondary-btn"
            onClick={startNewRound}
            title="Shuffle a new set of random words"
          >
            🔀 New Round
          </button>

          {onBackToCards && (
            <button
              type="button"
              className="activity-secondary-btn"
              onClick={onBackToCards}
            >
              📖 Back to Word Cards
            </button>
          )}
        </div>
      </div>

      <div className="activity-gameplay">
        {/* Stats bar */}
        <div className="activity-stats-bar">
          <div className="activity-score-badges">
            <div className="stat-badge score">
              <span>⭐ Score:</span> <strong>{score}</strong>
            </div>
            {streak > 1 && (
              <div className="stat-badge streak">
                <span>🔥 Streak:</span> <strong>{streak}</strong>
              </div>
            )}
          </div>
          <span className="activity-step-label">
            Word #{currentIndex + 1} of {roundWords.length}
          </span>
        </div>

        {/* Round Completed Screen */}
        {roundCompleted ? (
          <div className="match-completed-card">
            <span className="completion-icon">🎉</span>
            <h3>రౌండ్ పూర్తయింది! Round Completed!</h3>
            <p>
              Awesome job! You completed all <strong>{roundWords.length} words</strong> in this spelling set.
            </p>
            <div className="match-completed-stats">
              <span className="stat-pill">⭐ Total Score: {score}</span>
              <span className="stat-pill">🔥 Best Streak: {streak}</span>
            </div>
            <div className="match-completed-actions">
              <button type="button" className="home-btn" onClick={startNewRound}>
                🔀 Play Next Random Round ➔
              </button>
              {onBackToCards && (
                <button type="button" className="activity-secondary-btn" onClick={onBackToCards}>
                  📖 Back to Word Cards
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Audio controls & word preview */}
            <div className="sound-mystery-station">
              <div className="sound-mystery-controls">
                <button
                  type="button"
                  className={`sound-mystery-main-btn ${isPlayingAudio ? 'active-pulse' : ''}`}
                  onClick={() => handlePlayAudio(0.85)}
                >
                  <span className="speaker-icon">{isPlayingAudio ? '🔊' : '🔈'}</span>
                  <span className="speaker-text">
                    {isPlayingAudio ? 'వింటున్నారు…' : '🔊 వినండి • Play Telugu Sound'}
                  </span>
                </button>

                <button
                  type="button"
                  className={`sound-mystery-aux-btn ${slowAudio ? 'active' : ''}`}
                  onClick={() => handlePlayAudio(0.65)}
                >
                  🐢 నెమ్మదిగా • Slower
                </button>
              </div>

              {currentWord && visual && (
                <div className="spell-word-visual-preview">
                  <span className="spell-emoji-preview">{visual.emoji}</span>
                  <div className="spell-preview-meta">
                    {isTeluguMode ? (
                      <>
                        {/* In Telugu spelling mode: show IAST transliteration, hide Telugu script until solved */}
                        <span className="spell-prompt-word iast-prompt">{iastString}</span>
                        <div className="spell-meta-subrow">
                          {complexityBadge && (
                            <span className="spell-complexity-tag" style={{ color: complexityBadge.color }}>
                              {complexityBadge.emoji} {complexityBadge.labelTe}
                            </span>
                          )}
                          <span className="iast-grapheme-count">
                            ({targetUnits.length} అక్షరాలు • aksharas)
                          </span>
                        </div>
                        {isWordComplete && (
                          <span className="spell-revealed-word telugu-script">
                            ✨ {currentWord.term}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {/* In IAST spelling mode: show Telugu script, hide IAST transliteration until solved */}
                        <span className="spell-telugu-term telugu-script">{currentWord.term}</span>
                        <div className="spell-meta-subrow">
                          {complexityBadge && (
                            <span className="spell-complexity-tag" style={{ color: complexityBadge.color }}>
                              {complexityBadge.emoji} {complexityBadge.labelTe}
                            </span>
                          )}
                          <span className="iast-grapheme-count">
                            ({targetUnits.length} IAST letters)
                          </span>
                        </div>
                        {isWordComplete && (
                          <span className="spell-revealed-word iast-answer">
                            ✨ {iastString}
                          </span>
                        )}
                      </>
                    )}
                    <span className="spell-def-hint">{mainMeaning}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Target slots */}
            <div
              className={`spell-slots-container ${isTeluguMode ? 'telugu-akshara-slots' : 'iast-slots'}`}
            >
              {targetUnits.map((_, idx) => {
                const placed = placedLetters[idx]
                return (
                  <button
                    type="button"
                    key={idx}
                    className={`spell-slot ${isTeluguMode ? 'telugu-akshara-slot' : 'iast-slot'} ${placed ? 'filled' : 'empty'} ${isWordComplete ? 'correct-glow' : ''}`}
                    onClick={() => placed && handleRemoveLetter(idx)}
                    title={placed ? `Click to remove "${placed.letter}"` : `Slot ${idx + 1}`}
                    aria-label={
                      placed ? `Placed akshara ${placed.letter}, click to remove` : `Empty slot ${idx + 1}`
                    }
                  >
                    {placed ? placed.letter : ''}
                  </button>
                )
              })}
            </div>

            {/* Scrambled tile bank */}
            <div
              className={`spell-tiles-container ${isTeluguMode ? 'telugu-akshara-tiles' : 'iast-tiles'}`}
            >
              {tiles.map((tile) => (
                <button
                  type="button"
                  key={tile.id}
                  className={`spell-tile ${isTeluguMode ? 'telugu-akshara-tile' : 'iast-tile'} ${tile.isUsed ? 'used' : ''}`}
                  disabled={tile.isUsed || isWordComplete}
                  onClick={() => handleTileClick(tile)}
                  title={`Place "${tile.letter}"`}
                >
                  {tile.letter}
                </button>
              ))}
            </div>

            {/* Telugu mode — akshara reference legend */}
            {isTeluguMode && (
              <details className="iast-legend telugu-legend">
                <summary>తె అక్షరాల గురించి • About Telugu Aksharas</summary>
                <div className="telugu-legend-body">
                  <div className="telugu-legend-row">
                    <div className="telugu-legend-item">
                      <span className="telugu-script">ట</span> + <span className="telugu-script">ి</span>
                      {' = '}
                      <span className="telugu-script">టి</span>
                      <span className="telugu-legend-desc">&ldquo;ṭi&rdquo; — ట కి గుడి</span>
                    </div>
                    <div className="telugu-legend-item">
                      <span className="telugu-script">ప</span> + <span className="telugu-script">ం</span>
                      {' = '}
                      <span className="telugu-script">పం</span>
                      <span className="telugu-legend-desc">&ldquo;paṃ&rdquo; — ప పక్కన సున్న</span>
                    </div>
                    <div className="telugu-legend-item">
                      <span className="telugu-script">డ</span> + <span className="telugu-script">ు</span>
                      {' = '}
                      <span className="telugu-script">డు</span>
                      <span className="telugu-legend-desc">&ldquo;ḍu&rdquo; — డ కి కొమ్ము</span>
                    </div>
                    <div className="telugu-legend-item">
                      <span className="telugu-script">ల</span>
                      <span className="telugu-script">్ల</span>
                      {' = '}
                      <span className="telugu-script">ల్ల</span>
                      <span className="telugu-legend-desc">conjunct — గుణింతం</span>
                    </div>
                  </div>
                  <p className="telugu-legend-note">
                    Each tile = one <strong>అక్షరం</strong> (aksharam). Tap the tiles in order to spell the word!
                  </p>
                </div>
              </details>
            )}

            {/* IAST mode — phonetic legend */}
            {!isTeluguMode && (
              <details className="iast-legend">
                <summary>🔤 What do these special letters mean?</summary>
                <div className="iast-legend-grid">
                  <div className="iast-legend-item"><strong>ṭ</strong> = hard T (tongue curled back)</div>
                  <div className="iast-legend-item"><strong>ḍ</strong> = hard D (tongue curled back)</div>
                  <div className="iast-legend-item"><strong>ṇ</strong> = retroflex N</div>
                  <div className="iast-legend-item"><strong>ṃ</strong> = nasal hum (like -ng)</div>
                  <div className="iast-legend-item"><strong>ā</strong> = long A ("father")</div>
                  <div className="iast-legend-item"><strong>ī</strong> = long I ("ee")</div>
                  <div className="iast-legend-item"><strong>ū</strong> = long U ("oo")</div>
                  <div className="iast-legend-item"><strong>ē</strong> = long E ("ay")</div>
                  <div className="iast-legend-item"><strong>ō</strong> = long O ("oh")</div>
                  <div className="iast-legend-item"><strong>ś</strong> = soft SH</div>
                  <div className="iast-legend-item"><strong>ṣ</strong> = retroflex SH</div>
                  <div className="iast-legend-item"><strong>ḷ</strong> = retroflex L</div>
                </div>
              </details>
            )}

            {/* Action controls */}
            <div className="spell-actions">
              {!isWordComplete ? (
                <button
                  type="button"
                  className="activity-secondary-btn"
                  onClick={handleResetLetters}
                  disabled={placedLetters.length === 0}
                >
                  ↺ Reset Letters
                </button>
              ) : (
                <div className="spell-success-box">
                  <span className="feedback-icon">🌟</span>
                  <div>
                    <strong>చక్కగా చెప్పారు! (Excellent!)</strong>
                    <p>
                      <span className="telugu-script">{currentWord?.term}</span>
                      {' = '}
                      {isTeluguMode ? (
                        <span className="telugu-akshara-answer">
                          {targetUnits.join(' · ')}
                        </span>
                      ) : (
                        <strong className="iast-answer">{iastString}</strong>
                      )}
                      {' • '}
                      {mainMeaning}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="activity-next-btn"
                    onClick={handleNextWord}
                  >
                    {currentIndex + 1 < roundWords.length ? 'Next Word ➔' : 'Finish Round 🏆'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
