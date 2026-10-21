import { useState } from 'react'
import type { VocabularyWord } from '../api/vocabulary'
import { getWordVisual, formatBilingualCategory } from '../utils/wordVisuals'
import { speakWord, speakEnglish } from '../utils/audioFx'

interface WordCardProps {
  word: VocabularyWord
  categoryName?: string
  onSelectWord?: (word: VocabularyWord) => void
}

export default function WordCard({ word, categoryName, onSelectWord }: WordCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [slowPlaying, setSlowPlaying] = useState(false)
  const [isEnglishPlaying, setIsEnglishPlaying] = useState(false)

  const bilingualCat = formatBilingualCategory(categoryName || '')
  const visual = getWordVisual(word.term, word.image_url, bilingualCat.combined)
  const showImage = !imageError && Boolean(visual.fallbackImageUrl)

  // Play Telugu sound
  const handlePlayAudio = (rate = 0.85) => {
    setIsPlaying(rate > 0.75)
    setSlowPlaying(rate <= 0.75)

    speakWord(word.term, {
      rate,
      audioUrl: word.audio_url,
      lang: 'te-IN',
      transliteration: word.pronunciation,
      onEnd: () => {
        setIsPlaying(false)
        setSlowPlaying(false)
      },
    })
  }

  // Play English meaning audio
  const handlePlayEnglish = () => {
    // Extract English keyword (before "•" or "(" if present)
    const englishWord = word.definition.split('•')[0].split('(')[0].trim() || word.definition
    setIsEnglishPlaying(true)
    speakEnglish(englishWord, {
      onEnd: () => setIsEnglishPlaying(false),
    })
  }

  // Split bilingual definition (e.g. "Cat • A playful pet...") into English term & detail
  const renderDefinition = () => {
    if (word.definition.includes('•')) {
      const [mainMeaning, ...rest] = word.definition.split('•')
      return (
        <div className="word-card-definition-box">
          <strong className="word-card-meaning-title">{mainMeaning.trim()}</strong>
          {rest.length > 0 && <span className="word-card-meaning-desc"> • {rest.join('•').trim()}</span>}
        </div>
      )
    }
    return <p className="word-card-definition">{word.definition}</p>
  }

  // Split bilingual example sentence into Telugu and English lines
  const renderSentence = (sentence: string) => {
    if (!sentence) return null
    if (sentence.includes('•')) {
      const [teluguPart, englishPart] = sentence.split('•').map((s) => s.trim())
      return (
        <blockquote className="word-card-example bilingual">
          <div className="example-telugu">“{teluguPart}”</div>
          {englishPart && <div className="example-english">“{englishPart}”</div>}
        </blockquote>
      )
    }
    return <blockquote className="word-card-example">“{sentence}”</blockquote>
  }

  return (
    <article
      className="word-card"
      onClick={() => onSelectWord?.(word)}
      style={{ '--card-accent': visual.accentColor } as React.CSSProperties}
    >
      <div
        className="word-card-visual"
        style={{ background: visual.bgGradient }}
      >
        <span className="word-card-category-tag">
          {bilingualCat.combined || visual.categoryTag}
        </span>

        {showImage ? (
          <div className="word-card-img-container">
            <img
              src={visual.fallbackImageUrl}
              alt={`${word.term} (${word.pronunciation})`}
              className="word-card-img"
              loading="lazy"
              onError={() => setImageError(true)}
            />
            <div className="word-card-img-badge">{visual.emoji}</div>
          </div>
        ) : (
          <div className="word-card-illustration">
            <span className="word-card-emoji-large" role="img" aria-label={word.term}>
              {visual.emoji}
            </span>
          </div>
        )}
      </div>

      <div className="word-card-content">
        <div className="word-card-header">
          <div className="word-card-title-wrap">
            <h4 className="word-card-term telugu-script">{word.term}</h4>
            {word.pronunciation && (
              <span className="word-card-transliteration" title="English pronunciation">
                {word.pronunciation}
              </span>
            )}
          </div>
          {word.part_of_speech && (
            <span className="word-card-pos">{word.part_of_speech}</span>
          )}
        </div>

        {renderDefinition()}

        {word.example_sentence && renderSentence(word.example_sentence)}

        <div className="word-card-actions">
          <button
            type="button"
            className={`word-card-audio-btn ${isPlaying ? 'playing' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handlePlayAudio(0.85)
            }}
            title="Listen to Telugu sound"
          >
            <span className="audio-icon">{isPlaying ? '🔊' : '🔈'}</span>
            <span className="audio-label">{isPlaying ? 'వింటున్నారు…' : 'వినండి • Hear it'}</span>
            {isPlaying && (
              <span className="audio-waves" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </span>
            )}
          </button>

          <button
            type="button"
            className={`word-card-slow-btn ${slowPlaying ? 'playing' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handlePlayAudio(0.65)
            }}
            title="Hear slowly in Telugu (turtle speed)"
          >
            🐢 నెమ్మదిగా
          </button>

          <button
            type="button"
            className={`word-card-meaning-btn ${isEnglishPlaying ? 'playing' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handlePlayEnglish()
            }}
            title="Hear English meaning"
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </article>
  )
}
