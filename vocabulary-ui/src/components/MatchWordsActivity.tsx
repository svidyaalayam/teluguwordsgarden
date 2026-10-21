import { useState, useEffect, useCallback, useMemo } from 'react'
import type { VocabularyCategory, VocabularyWord } from '../api/vocabulary'
import { getWordVisual, formatBilingualCategory } from '../utils/wordVisuals'
import { playChime, playBuzzer, playFanfare, playPop, speakWord } from '../utils/audioFx'
import { teluguToIast } from '../utils/teluguTransliteration'

interface MatchWordsActivityProps {
  words: VocabularyWord[]
  categories: VocabularyCategory[]
  onBackToCards?: () => void
}

interface MatchPair {
  word: VocabularyWord
  isMatched: boolean
}

export default function MatchWordsActivity({
  words,
  categories,
  onBackToCards,
}: MatchWordsActivityProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [pairsPerRound, setPairsPerRound] = useState<number>(5)
  const [boardIndex, setBoardIndex] = useState<number>(0)

  // Matching board state
  const [leftItems, setLeftItems] = useState<VocabularyWord[]>([])
  const [rightItems, setRightItems] = useState<VocabularyWord[]>([])
  const [matches, setMatches] = useState<Record<number, number>>({}) // englishWordId -> teluguWordId
  const [selectedLeftId, setSelectedLeftId] = useState<number | null>(null)
  const [selectedRightId, setSelectedRightId] = useState<number | null>(null)
  const [wrongMatch, setWrongMatch] = useState<{ leftId: number; rightId: number } | null>(null)

  // Scores
  const [score, setScore] = useState<number>(0)
  const [streak, setStreak] = useState<number>(0)
  const [boardCompleted, setBoardCompleted] = useState<boolean>(false)

  // Pool of eligible words
  const eligibleWords = useMemo(() => {
    let pool = words
    if (selectedCategory) {
      const catId = Number(selectedCategory)
      pool = pool.filter((w) => w.categories.includes(catId))
    }
    return pool
  }, [words, selectedCategory])

  // Setup a new board of pairs
  const setupBoard = useCallback(() => {
    if (eligibleWords.length < 2) return

    // Shuffle and pick pairs for this board
    const shuffled = [...eligibleWords].sort(() => 0.5 - Math.random())
    const boardSize = Math.min(pairsPerRound, shuffled.length)
    const selected = shuffled.slice(0, boardSize)

    // Left is English meaning, Right is Telugu words (shuffled independently)
    const left = [...selected]
    const right = [...selected].sort(() => 0.5 - Math.random())

    setLeftItems(left)
    setRightItems(right)
    setMatches({})
    setSelectedLeftId(null)
    setSelectedRightId(null)
    setWrongMatch(null)
    setBoardCompleted(false)
  }, [eligibleWords, pairsPerRound])

  useEffect(() => {
    setupBoard()
  }, [selectedCategory, pairsPerRound, boardIndex, setupBoard])

  // Check match logic
  const handleTryMatch = useCallback(
    (leftWordId: number, rightWordId: number) => {
      if (leftWordId === rightWordId) {
        // Correct Match!
        playChime()
        const matchedWord = leftItems.find((w) => w.id === leftWordId)
        if (matchedWord) {
          speakWord(matchedWord.term, { lang: 'te-IN' })
        }

        const newMatches = { ...matches, [leftWordId]: rightWordId }
        setMatches(newMatches)
        setSelectedLeftId(null)
        setSelectedRightId(null)
        setWrongMatch(null)
        setScore((s) => s + 10)
        setStreak((s) => s + 1)

        // Check if all matched
        if (Object.keys(newMatches).length === leftItems.length) {
          setTimeout(() => {
            playFanfare()
            setBoardCompleted(true)
          }, 400)
        }
      } else {
        // Wrong match
        playBuzzer()
        setWrongMatch({ leftId: leftWordId, rightId: rightWordId })
        setStreak(0)
        setTimeout(() => {
          setSelectedLeftId(null)
          setSelectedRightId(null)
          setWrongMatch(null)
        }, 800)
      }
    },
    [leftItems, matches],
  )

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, wordId: number) => {
    e.dataTransfer.setData('text/plain', String(wordId))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetWordId: number) => {
    e.preventDefault()
    const droppedWordId = Number(e.dataTransfer.getData('text/plain'))
    if (!droppedWordId) return
    handleTryMatch(targetWordId, droppedWordId)
  }

  // Click-to-match handlers
  const handleLeftClick = (wordId: number) => {
    if (matches[wordId]) return
    playPop()
    if (selectedRightId !== null) {
      handleTryMatch(wordId, selectedRightId)
    } else {
      setSelectedLeftId(selectedLeftId === wordId ? null : wordId)
    }
  }

  const handleRightClick = (wordId: number) => {
    // Check if right item is already matched
    if (Object.values(matches).includes(wordId)) return
    playPop()

    const word = rightItems.find((w) => w.id === wordId)
    if (word) {
      speakWord(word.term, { lang: 'te-IN' })
    }

    if (selectedLeftId !== null) {
      handleTryMatch(selectedLeftId, wordId)
    } else {
      setSelectedRightId(selectedRightId === wordId ? null : wordId)
    }
  }

  const handleNextBoard = () => {
    playPop()
    setBoardIndex((i) => i + 1)
  }

  const handleRestart = () => {
    playPop()
    setScore(0)
    setStreak(0)
    setBoardIndex(0)
    setupBoard()
  }

  if (eligibleWords.length < 2) {
    return (
      <div className="activity-container">
        <div className="activity-empty">
          <span className="activity-icon-large">🔗</span>
          <h3>Not enough words for matching in this category</h3>
          <p>Please select another category or show all categories.</p>
          <button className="home-btn" onClick={() => setSelectedCategory('')}>
            Show all categories
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-container">
      {/* Header */}
      <div className="activity-header">
        <div className="activity-title-wrap">
          <span className="activity-badge-pill">🔗 Match &amp; Learn • జతపరచండి</span>
          <h2>Match Telugu Words with English Meanings</h2>
          <p>
            Drag the <strong>Telugu words</strong> on the right to their matching <strong>English meanings</strong> on the left, or tap both to pair them!
          </p>
        </div>

        <div className="activity-filters">
          <label className="vocabulary-filter">
            Category • విభాగం
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setBoardIndex(0)
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
            Words • పదాలు
            <select
              value={pairsPerRound}
              onChange={(e) => {
                setPairsPerRound(Number(e.target.value))
                setBoardIndex(0)
                setScore(0)
                setStreak(0)
              }}
            >
              <option value={5}>5 Pairs</option>
              <option value={10}>10 Pairs</option>
              <option value={25}>25 Pairs</option>
            </select>
          </label>

          {onBackToCards && (
            <button type="button" className="activity-secondary-btn" onClick={onBackToCards}>
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
          <div className="activity-step-label">
            Matched {Object.keys(matches).length} of {leftItems.length}
          </div>
        </div>

        {/* Board Completed Celebration */}
        {boardCompleted ? (
          <div className="match-completed-card">
            <span className="completion-icon">🏆</span>
            <h3>అద్భుతం! Outstanding Matching!</h3>
            <p>You matched all {leftItems.length} Telugu words with their English meanings!</p>
            <div className="match-completed-stats">
              <span className="stat-pill">⭐ Final Score: {score}</span>
              <span className="stat-pill">🔥 Best Streak: {streak}</span>
            </div>
            <div className="match-completed-actions">
              <button type="button" className="home-btn" onClick={handleNextBoard}>
                Play Next Set ➔
              </button>
              <button type="button" className="activity-secondary-btn" onClick={handleRestart}>
                ↺ Restart Activity
              </button>
            </div>
          </div>
        ) : (
          /* Match Board: 2 Columns */
          <div className="match-board-grid">
            {/* Left Column: English Meanings */}
            <div className="match-column">
              <h4 className="match-col-header">
                <span>🇬🇧 English Meaning</span>
                <small>(Drop or Click)</small>
              </h4>
              <div className="match-cards-list">
                {leftItems.map((leftWord) => {
                  const isMatched = Boolean(matches[leftWord.id])
                  const visual = getWordVisual(leftWord.term, leftWord.image_url)
                  const isSelected = selectedLeftId === leftWord.id
                  const isWrong = wrongMatch?.leftId === leftWord.id
                  const mainMeaning = leftWord.definition.split('•')[0].trim()

                  return (
                    <div
                      key={leftWord.id}
                      className={`match-target-card ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong-shake' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, leftWord.id)}
                      onClick={() => handleLeftClick(leftWord.id)}
                    >
                      <div className="match-target-meta">
                        <span className="match-target-emoji">{visual.emoji}</span>
                        <div className="match-target-text">
                          <strong className="match-meaning-title">{mainMeaning}</strong>
                          <span className="match-meaning-sub">
                            {leftWord.definition.split('•')[1]?.trim() || ''}
                          </span>
                        </div>
                      </div>

                      {/* Drop Slot */}
                      <div className={`match-drop-slot ${isMatched ? 'filled' : 'waiting'}`}>
                        {isMatched ? (
                          <div className="matched-result-chip">
                            <span className="telugu-script">{leftWord.term}</span>
                            <button
                              type="button"
                              className="match-audio-mini-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                speakWord(leftWord.term, { lang: 'te-IN' })
                              }}
                              title="Play Telugu sound"
                            >
                              🔊
                            </button>
                          </div>
                        ) : (
                          <span className="slot-placeholder">Drop Telugu word here</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Telugu Word Tiles */}
            <div className="match-column">
              <h4 className="match-col-header">
                <span>తె Telugu Words</span>
                <small>(Drag or Click)</small>
              </h4>
              <div className="match-tiles-list">
                {rightItems.map((rightWord) => {
                  const isUsed = Object.values(matches).includes(rightWord.id)
                  const isSelected = selectedRightId === rightWord.id
                  const isWrong = wrongMatch?.rightId === rightWord.id
                  const iast = teluguToIast(rightWord.term)

                  return (
                    <div
                      key={rightWord.id}
                      draggable={!isUsed}
                      onDragStart={(e) => handleDragStart(e, rightWord.id)}
                      onClick={() => handleRightClick(rightWord.id)}
                      className={`match-draggable-tile ${isUsed ? 'used' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong-shake' : ''}`}
                    >
                      <span className="drag-handle">⠿</span>
                      <span className="telugu-script match-tile-term">{rightWord.term}</span>
                      <span className="match-tile-iast">{iast}</span>
                      <button
                        type="button"
                        className="match-audio-mini-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          speakWord(rightWord.term, { lang: 'te-IN' })
                        }}
                        title="Listen to Telugu pronunciation"
                      >
                        🔊
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
