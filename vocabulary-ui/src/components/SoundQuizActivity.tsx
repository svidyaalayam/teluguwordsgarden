import { useState, useEffect, useCallback, useMemo } from 'react'
import type { VocabularyCategory, VocabularyWord } from '../api/vocabulary'
import { getWordVisual, formatBilingualCategory } from '../utils/wordVisuals'
import { playChime, playBuzzer, playFanfare, playPop, speakWord } from '../utils/audioFx'

interface SoundQuizActivityProps {
  words: VocabularyWord[]
  categories: VocabularyCategory[]
  onBackToCards?: () => void
}

interface Question {
  targetWord: VocabularyWord
  options: VocabularyWord[]
}

export default function SoundQuizActivity({
  words,
  categories,
  onBackToCards,
}: SoundQuizActivityProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [questionsPerRound, setQuestionsPerRound] = useState<number>(5)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [slowAudio, setSlowAudio] = useState(false)

  // Current question state
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [wrongWordIds, setWrongWordIds] = useState<number[]>([])
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false)

  // Game stats
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [roundCompleted, setRoundCompleted] = useState(false)
  const [practicedWords, setPracticedWords] = useState<VocabularyWord[]>([])

  // Filter word pool according to category selection
  const eligibleWords = useMemo(() => {
    if (!selectedCategory) return words
    const catId = Number(selectedCategory)
    return words.filter((w) => w.categories.includes(catId))
  }, [words, selectedCategory])

  // Generate round questions
  const [questions, setQuestions] = useState<Question[]>([])

  const generateQuestions = useCallback(() => {
    if (eligibleWords.length < 4) return []

    // Shuffle eligible words
    const shuffled = [...eligibleWords].sort(() => 0.5 - Math.random())
    const count = Math.min(questionsPerRound, shuffled.length)
    const roundQuestions: Question[] = []

    for (let i = 0; i < count; i++) {
      const target = shuffled[i]
      // Pick 3 distractors from the remaining pool
      const otherWords = eligibleWords.filter((w) => w.id !== target.id)
      const distractors = [...otherWords]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)

      const options = [target, ...distractors].sort(() => 0.5 - Math.random())
      roundQuestions.push({ targetWord: target, options })
    }

    return roundQuestions
  }, [eligibleWords, questionsPerRound])

  // Start / restart round
  const startNewRound = useCallback(() => {
    const q = generateQuestions()
    setQuestions(q)
    setCurrentIndex(0)
    setSelectedWordId(null)
    setIsCorrect(null)
    setWrongWordIds([])
    setHasAnsweredCorrectly(false)
    setScore(0)
    setStreak(0)
    setRoundCompleted(false)
    setPracticedWords([])
  }, [generateQuestions])

  useEffect(() => {
    startNewRound()
  }, [selectedCategory, questionsPerRound, startNewRound])

  const currentQuestion = questions[currentIndex]

  // Play target word Telugu sound
  const handlePlaySound = useCallback(
    (rate = 0.85) => {
      if (!currentQuestion) return
      setIsPlayingAudio(true)
      setSlowAudio(rate < 0.75)

      speakWord(currentQuestion.targetWord.term, {
        rate,
        audioUrl: currentQuestion.targetWord.audio_url,
        lang: 'te-IN',
        transliteration: currentQuestion.targetWord.pronunciation,
        onEnd: () => {
          setIsPlayingAudio(false)
          setSlowAudio(false)
        },
      })
    },
    [currentQuestion],
  )

  // Automatically play Telugu sound when question changes
  useEffect(() => {
    if (!currentQuestion || roundCompleted) return
    const timer = setTimeout(() => {
      handlePlaySound(0.85)
    }, 350)
    return () => clearTimeout(timer)
  }, [currentIndex, currentQuestion, roundCompleted, handlePlaySound])

  // Handle student selecting an option
  const handleSelectOption = (option: VocabularyWord) => {
    if (!currentQuestion || hasAnsweredCorrectly) return

    setSelectedWordId(option.id)

    if (option.id === currentQuestion.targetWord.id) {
      // Correct!
      playChime()
      setIsCorrect(true)
      setHasAnsweredCorrectly(true)
      const newScore = score + 10
      const newStreak = streak + 1
      setScore(newScore)
      setStreak(newStreak)
      if (newStreak > bestStreak) setBestStreak(newStreak)

      setPracticedWords((prev) =>
        prev.some((w) => w.id === option.id) ? prev : [...prev, option],
      )
    } else {
      // Incorrect try
      playBuzzer()
      setIsCorrect(false)
      setStreak(0)
      setWrongWordIds((prev) => [...prev, option.id])
    }
  }

  // Advance to next question or complete round
  const handleNextQuestion = () => {
    playPop()
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedWordId(null)
      setIsCorrect(null)
      setWrongWordIds([])
      setHasAnsweredCorrectly(false)
    } else {
      playFanfare()
      setRoundCompleted(true)
    }
  }

  if (eligibleWords.length < 4) {
    return (
      <div className="activity-container">
        <div className="activity-empty">
          <span className="activity-icon-large">🎧</span>
          <h3>Not enough words to play in this category</h3>
          <p>Please pick another category or &quot;All Categories&quot;.</p>
          <button className="home-btn" onClick={() => setSelectedCategory('')}>
            Show all categories
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-container">
      {/* Activity Top Bar */}
      <div className="activity-header">
        <div className="activity-title-wrap">
          <span className="activity-badge-pill">🎧 Telugu Listening Game</span>
          <h2>Listen &amp; Identify • విని గుర్తించండి</h2>
          <p>Listen closely to the Telugu sound, then tap the matching word card!</p>
        </div>

        <div className="activity-filters">
          <label className="vocabulary-filter">
            Category
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
            Questions
            <select
              value={questionsPerRound}
              onChange={(e) => setQuestionsPerRound(Number(e.target.value))}
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={25}>25 Questions</option>
            </select>
          </label>

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

      {!roundCompleted && currentQuestion && (
        <div className="activity-gameplay">
          {/* Progress and Score Bar */}
          <div className="activity-stats-bar">
            <div className="activity-progress">
              <span className="activity-step-label">
                Word {currentIndex + 1} of {questions.length}
              </span>
              <div className="activity-progress-track">
                <div
                  className="activity-progress-fill"
                  style={{
                    width: `${((currentIndex + (hasAnsweredCorrectly ? 1 : 0)) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

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
          </div>

          {/* Sound Mystery Station */}
          <div className="sound-mystery-station">
            <p className="sound-mystery-prompt">
              🎧 What Telugu word is being spoken? Listen closely!
            </p>

            <div className="sound-mystery-controls">
              <button
                type="button"
                className={`sound-mystery-main-btn ${isPlayingAudio ? 'active-pulse' : ''}`}
                onClick={() => handlePlaySound(0.85)}
                title="Play the Telugu sound"
              >
                <span className="speaker-icon">{isPlayingAudio ? '🔊' : '🔈'}</span>
                <span className="speaker-text">
                  {isPlayingAudio ? 'వింటున్నారు… (Listening…)' : '🔊 వినండి • Play Telugu Sound'}
                </span>
                {isPlayingAudio && (
                  <span className="audio-equalizer" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                )}
              </button>

              <button
                type="button"
                className={`sound-mystery-aux-btn ${slowAudio ? 'active' : ''}`}
                onClick={() => handlePlaySound(0.65)}
                title="Play slower to hear syllables clearly"
              >
                🐢 నెమ్మదిగా • Slower
              </button>

              <button
                type="button"
                className="sound-mystery-aux-btn"
                onClick={() => handlePlaySound(0.85)}
                title="Repeat sound"
              >
                🔁 Repeat
              </button>
            </div>
          </div>

          {/* Answer Feedback Banner */}
          {hasAnsweredCorrectly && (
            <div className="activity-feedback-banner correct">
              <div className="feedback-content">
                <span className="feedback-icon">🎉</span>
                <div>
                  <strong>
                    అద్భుతం! (Brilliant!) You found &ldquo;{currentQuestion.targetWord.term}&rdquo;
                    {currentQuestion.targetWord.pronunciation && ` [${currentQuestion.targetWord.pronunciation}]`}!
                  </strong>
                  <p className="feedback-detail">
                    {currentQuestion.targetWord.definition}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="activity-next-btn"
                onClick={handleNextQuestion}
              >
                Next Word ➔
              </button>
            </div>
          )}

          {isCorrect === false && !hasAnsweredCorrectly && (
            <div className="activity-feedback-banner incorrect">
              <span className="feedback-icon">🎧</span>
              <span>మళ్ళీ వినండి! Tap <strong>&ldquo;Play Telugu Sound&rdquo;</strong> to listen again and pick the right card!</span>
            </div>
          )}

          {/* 4 Interactive Choice Cards */}
          <div className="activity-options-grid">
            {currentQuestion.options.map((option) => {
              const visual = getWordVisual(option.term, option.image_url)
              const isSelected = selectedWordId === option.id
              const isWrong = wrongWordIds.includes(option.id)
              const isTarget = option.id === currentQuestion.targetWord.id
              const showAsCorrect = hasAnsweredCorrectly && isTarget

              let cardClass = 'activity-option-card'
              if (showAsCorrect) cardClass += ' correct-glow'
              else if (isWrong) cardClass += ' wrong-shake disabled'
              else if (isSelected) cardClass += ' selected'

              const mainMeaning = option.definition.split('•')[0].trim()

              return (
                <button
                  type="button"
                  key={option.id}
                  className={cardClass}
                  onClick={() => handleSelectOption(option)}
                  disabled={isWrong || hasAnsweredCorrectly}
                >
                  <div
                    className="activity-card-image"
                    style={{ background: visual.bgGradient }}
                  >
                    {visual.fallbackImageUrl ? (
                      <img
                        src={visual.fallbackImageUrl}
                        alt={`${option.term} (${option.pronunciation})`}
                        className="activity-img"
                        loading="lazy"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="activity-card-emoji">{visual.emoji}</span>
                    )}
                    {showAsCorrect && <span className="correct-check">✅</span>}
                  </div>

                  <div className="activity-card-info">
                    <span className="activity-card-term telugu-script">{option.term}</span>
                    {option.pronunciation && (
                      <span className="activity-card-transliteration">{option.pronunciation}</span>
                    )}
                    <span className="activity-card-meaning">{mainMeaning}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Round Completed Screen */}
      {roundCompleted && (
        <div className="activity-completed-panel">
          <div className="completed-header">
            <span className="trophy-icon">🏆</span>
            <h2>Round Complete! • రౌండ్ పూర్తయింది!</h2>
            <p className="completed-subtitle">
              You did a fantastic job listening to Telugu words and identifying them!
            </p>
          </div>

          <div className="completed-stats-row">
            <div className="stat-card">
              <span className="stat-num">{score}</span>
              <span className="stat-label">Points Earned</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">{bestStreak}</span>
              <span className="stat-label">Best Streak 🔥</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">{practicedWords.length}</span>
              <span className="stat-label">Words Mastered</span>
            </div>
          </div>

          {/* Words Practiced Review */}
          <div className="completed-words-review">
            <h3>Telugu Words Practiced in this Round:</h3>
            <div className="completed-words-grid">
              {practicedWords.map((word) => {
                const visual = getWordVisual(word.term, word.image_url)
                const englishMeaning = word.definition.split('•')[0].trim()
                return (
                  <div key={word.id} className="completed-word-chip">
                    <span className="chip-emoji">{visual.emoji}</span>
                    <div className="chip-text">
                      <strong className="chip-term telugu-script">{word.term}</strong>
                      {word.pronunciation && <span className="chip-transliteration">[{word.pronunciation}]</span>}
                      <span className="chip-meaning">{englishMeaning}</span>
                    </div>
                    <button
                      type="button"
                      className="chip-sound-btn"
                      onClick={() =>
                        speakWord(word.term, {
                          audioUrl: word.audio_url,
                          lang: 'te-IN',
                          transliteration: word.pronunciation,
                        })
                      }
                      title="Hear Telugu sound again"
                    >
                      🔊
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="completed-actions">
            <button
              type="button"
              className="home-btn"
              onClick={startNewRound}
            >
              Play Another Round ➔
            </button>
            {onBackToCards && (
              <button
                type="button"
                className="activity-secondary-btn"
                onClick={onBackToCards}
              >
                Back to Word Garden 📖
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
