/**
 * QuestionMedia.tsx
 * Displays optional image and/or audio for a question.
 *
 * Supports:
 *  - Image only
 *  - Audio only (file URL or browser SpeechSynthesis TTS fallback)
 *  - Image + audio
 *  - Neither (renders nothing)
 *
 * Audio does NOT autoplay. The student must press the Play button.
 * If audioUrl is not available, uses browser speech synthesis to pronounce
 * `wordToPronounce` (Telugu voice).
 */

import { useEffect, useRef, useState } from 'react'
import { speakTelugu } from '../../utils/audioFx'

interface QuestionMediaProps {
  imageUrl?: string | null
  audioUrl?: string | null
  /** Word to pronounce via SpeechSynthesis if audioUrl is not provided */
  wordToPronounce?: string | null
  /** Alt text for the image (defaults to a generic description) */
  imageAlt?: string
}

export default function QuestionMedia({
  imageUrl,
  audioUrl,
  wordToPronounce,
  imageAlt = 'Question image',
}: QuestionMediaProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [imageError, setImageError] = useState(false)

  const hasImage = !!imageUrl
  const hasAudioSource = !!audioUrl
  const hasTTS = !audioUrl && !!wordToPronounce
  const hasAudio = hasAudioSource || hasTTS

  // Reset audio/speech state on question change
  useEffect(() => {
    setPlaying(false)
    setAudioError(false)
    setImageError(false)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [audioUrl, wordToPronounce, imageUrl])

  if (!hasImage && !hasAudio) return null

  function handlePlayPause() {
    if (playing) {
      if (audioRef.current) audioRef.current.pause()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setPlaying(false)
      return
    }

    if (hasAudioSource) {
      const audio = audioRef.current
      if (audio) {
        audio.play().catch(() => {
          // If recorded audio fails to play, fallback to TTS if word is available
          if (wordToPronounce) {
            speakViaTTS()
          } else {
            setAudioError(true)
          }
        })
      }
    } else if (wordToPronounce) {
      speakViaTTS()
    }
  }

  function speakViaTTS() {
    if (!wordToPronounce) return
    speakTelugu(wordToPronounce, {
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
    })
  }

  return (
    <div className="qm-root" aria-label="Question media">
      {hasImage && !imageError && (
        <div className="qm-image-wrap">
          <img
            src={imageUrl!}
            alt={imageAlt}
            className="qm-image"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {hasImage && imageError && (
        <div className="qm-media-error" role="alert">
          <span aria-hidden="true">🖼️</span>
          <span>Image could not be loaded.</span>
        </div>
      )}

      {hasAudio && (
        <div className="qm-audio-wrap">
          {/* Native audio element — only if an audio file URL is supplied */}
          {hasAudioSource && (
            <audio
              ref={audioRef}
              src={audioUrl!}
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() => {
                if (wordToPronounce) {
                  // Transparent fallback to TTS, don't show error banner
                  setAudioError(false)
                } else {
                  setAudioError(true)
                }
              }}
            />
          )}

          {!audioError ? (
            <button
              type="button"
              className={`qm-play-btn${playing ? ' playing' : ''}`}
              onClick={handlePlayPause}
              aria-label={playing ? 'Pause audio' : 'Listen to word pronunciation'}
            >
              <span className="qm-play-icon" aria-hidden="true">
                {playing ? (
                  <span className="audio-waves">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  '▶'
                )}
              </span>
              <span className="qm-play-label">
                {playing ? 'Playing…' : 'Listen'}
              </span>
            </button>
          ) : (
            <p className="qm-media-error" role="alert">
              <span aria-hidden="true">🔇</span> Audio could not be loaded.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
