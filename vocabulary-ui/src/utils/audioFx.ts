// Web Audio API synthesizer for child-friendly educational sound effects
// 100% client-side, zero external audio asset dependencies, instantaneous response.

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

let soundFxEnabled = true

export function setSoundFxEnabled(enabled: boolean) {
  soundFxEnabled = enabled
}

export function isSoundFxEnabled(): boolean {
  return soundFxEnabled
}

/**
 * Play a cheerful, bright ascending chime (celebrating correct answer)
 */
export function playChime() {
  if (!soundFxEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  // Notes: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + idx * 0.08)

    gain.gain.setValueAtTime(0, now + idx * 0.08)
    gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + idx * 0.08)
    osc.stop(now + idx * 0.08 + 0.36)
  })
}

/**
 * Play a soft, non-punishing friendly boop (for incorrect try)
 */
export function playBuzzer() {
  if (!soundFxEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(260, now)
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.18)

  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.22)
}

/**
 * Play a triumphant fanfare chord for round completion
 */
export function playFanfare() {
  if (!soundFxEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5]
  chord.forEach((freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.82)
  })
}

/**
 * Tactile pop sound for UI clicks
 */
export function playPop() {
  if (!soundFxEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(420, now)
  osc.frequency.exponentialRampToValueAtTime(840, now + 0.04)

  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.06)
}

/**
 * Extract Telugu script characters from text (ignoring brackets and English)
 */
export function extractTeluguText(text: string): string {
  const teluguMatch = text.match(/[\u0C00-\u0C7F\s]+/g)
  if (teluguMatch) {
    const cleaned = teluguMatch.join(' ').trim()
    if (cleaned.length > 0) return cleaned
  }
  return text.trim()
}

/**
 * Check if text contains Telugu Unicode characters
 */
export function hasTeluguScript(text: string): boolean {
  return /[\u0C00-\u0C7F]/.test(text)
}

/**
 * Speak a word or phrase clearly using browser SpeechSynthesis or recorded audio
 * Optimised for UK children learning Telugu words.
 */
export function speakWord(
  term: string,
  options?: {
    rate?: number
    pitch?: number
    audioUrl?: string
    lang?: string
    transliteration?: string
    onStart?: () => void
    onEnd?: () => void
  },
) {
  if (typeof window === 'undefined') return

  // If word has a recorded custom audio URL, prefer playing it
  if (options?.audioUrl) {
    const audio = new Audio(options.audioUrl)
    if (options.onStart) options.onStart()
    if (options.onEnd) {
      audio.onended = () => options.onEnd?.()
      audio.onerror = () => options.onEnd?.()
    }
    audio.play().catch(() => {
      // Fallback to speech synthesis if audio playback failed
      speakWithSynthesis(term, options)
    })
    return
  }

  speakWithSynthesis(term, options)
}

/**
 * Dedicated function to speak Telugu word clearly with Telugu voice (te-IN)
 */
export function speakTelugu(
  term: string,
  options?: {
    rate?: number
    pitch?: number
    audioUrl?: string
    transliteration?: string
    onStart?: () => void
    onEnd?: () => void
  },
) {
  speakWord(term, { ...options, lang: 'te-IN' })
}

/**
 * Dedicated function to speak English definition/meaning with natural English voice
 */
export function speakEnglish(
  text: string,
  options?: {
    rate?: number
    pitch?: number
    onStart?: () => void
    onEnd?: () => void
  },
) {
  speakWithSynthesis(text, { ...options, lang: 'en-GB' })
}

function speakWithSynthesis(
  text: string,
  options?: {
    rate?: number
    pitch?: number
    lang?: string
    transliteration?: string
    onStart?: () => void
    onEnd?: () => void
  },
) {
  if (!('speechSynthesis' in window)) {
    if (options?.onEnd) options.onEnd()
    return
  }

  window.speechSynthesis.cancel()

  const isTeluguTarget = options?.lang?.startsWith('te') || hasTeluguScript(text)
  const spokenText = isTeluguTarget ? extractTeluguText(text) : text

  const utterance = new SpeechSynthesisUtterance(spokenText)
  // Kid-friendly cadence: 0.85 for Telugu is clear and not rushed
  utterance.rate = options?.rate ?? (isTeluguTarget ? 0.85 : 0.92)
  utterance.pitch = options?.pitch ?? 1.05

  const voices = window.speechSynthesis.getVoices()

  if (isTeluguTarget) {
    utterance.lang = 'te-IN'

    // Find Telugu voice
    const teluguVoice = voices.find(
      (v) =>
        v.lang === 'te-IN' ||
        v.lang === 'te' ||
        v.lang.startsWith('te-') ||
        v.name.toLowerCase().includes('telugu'),
    )

    if (teluguVoice) {
      utterance.voice = teluguVoice
    }
  } else {
    utterance.lang = options?.lang || 'en-GB'

    // Find natural British / English voice suitable for UK children
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en-GB') || v.lang.startsWith('en')) &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Daniel') ||
          v.name.includes('Serena') ||
          v.name.includes('Oliver') ||
          v.name.includes('George') ||
          v.name.includes('Jenny')),
    ) || voices.find((v) => v.lang.startsWith('en'))

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
  }

  if (options?.onStart) {
    utterance.onstart = () => options.onStart?.()
  }

  // Graceful fallback: If Telugu synthesis fails in a browser that doesn't support te-IN TTS,
  // speak the romanized transliteration clearly so the UK student still hears the word!
  utterance.onerror = () => {
    if (isTeluguTarget && options?.transliteration) {
      const fallbackUtterance = new SpeechSynthesisUtterance(options.transliteration)
      fallbackUtterance.rate = 0.85
      fallbackUtterance.lang = 'en-GB'
      fallbackUtterance.onend = () => options?.onEnd?.()
      fallbackUtterance.onerror = () => options?.onEnd?.()
      window.speechSynthesis.speak(fallbackUtterance)
    } else {
      options?.onEnd?.()
    }
  }

  utterance.onend = () => options?.onEnd?.()

  window.speechSynthesis.speak(utterance)
}
