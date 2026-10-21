/**
 * Comprehensive Telugu to IAST (International Alphabet of Sanskrit Transliteration) Converter
 * Translates Telugu Unicode text (\u0C00 - \u0C7F) into precise standard IAST representation.
 * Example: 'అరటిపండు' -> 'araṭipaṃḍu' (containing ṭ, ṃ, ḍ, etc.)
 *
 * Also provides splitTeluguAksharas() which splits Telugu text into natural syllable/akshara
 * units for the Telugu-script spelling game.
 * Example: 'అరటిపండు' -> ['అ', 'ర', 'టి', 'పం', 'డు']  (5 akshara tiles)
 *          'పిల్లి'    -> ['పి', 'ల్లి']                   (2 akshara tiles)
 *          'సింహం'     -> ['సిం', 'హం']                   (2 akshara tiles)
 */

const TELUGU_VOWELS: Record<number, string> = {
  0x0c05: 'a',
  0x0c06: 'ā',
  0x0c07: 'i',
  0x0c08: 'ī',
  0x0c09: 'u',
  0x0c0a: 'ū',
  0x0c0b: 'ṛ',
  0x0c60: 'ṝ',
  0x0c0c: 'ḷ',
  0x0c61: 'ḹ',
  0x0c0e: 'e',
  0x0c0f: 'ē',
  0x0c10: 'ai',
  0x0c12: 'o',
  0x0c13: 'ō',
  0x0c14: 'au',
}

const TELUGU_CONSONANTS: Record<number, string> = {
  0x0c15: 'k',
  0x0c16: 'kh',
  0x0c17: 'g',
  0x0c18: 'gh',
  0x0c19: 'ṅ',
  0x0c1a: 'c',
  0x0c1b: 'ch',
  0x0c1c: 'j',
  0x0c1d: 'jh',
  0x0c1e: 'ñ',
  0x0c1f: 'ṭ',
  0x0c20: 'ṭh',
  0x0c21: 'ḍ',
  0x0c22: 'ḍh',
  0x0c23: 'ṇ',
  0x0c24: 't',
  0x0c25: 'th',
  0x0c26: 'd',
  0x0c27: 'dh',
  0x0c28: 'n',
  0x0c2a: 'p',
  0x0c2b: 'ph',
  0x0c2c: 'b',
  0x0c2d: 'bh',
  0x0c2e: 'm',
  0x0c2f: 'y',
  0x0c30: 'r',
  0x0c31: 'ṟ',
  0x0c32: 'l',
  0x0c33: 'ḷ',
  0x0c35: 'v',
  0x0c36: 'ś',
  0x0c37: 'ṣ',
  0x0c38: 's',
  0x0c39: 'h',
}

const TELUGU_MATRAS: Record<number, string> = {
  0x0c3e: 'ā',
  0x0c3f: 'i',
  0x0c40: 'ī',
  0x0c41: 'u',
  0x0c42: 'ū',
  0x0c43: 'ṛ',
  0x0c44: 'ṝ',
  0x0c46: 'e',
  0x0c47: 'ē',
  0x0c48: 'ai',
  0x0c4a: 'o',
  0x0c4b: 'ō',
  0x0c4c: 'au',
}

const VIRAMA = 0x0c4d
const ANUSVARA = 0x0c02
const VISARGA = 0x0c03

/**
 * Converts a Telugu script string to standard IAST romanization.
 * Examples:
 *   'అరటిపండు'   -> 'araṭipaṃḍu'
 *   'పిల్లి'      -> 'pilli'
 *   'బడి'        -> 'baḍi'
 *   'గుర్రం'      -> 'gurraṃ'
 *   'సింహం'      -> 'siṃhaṃ'
 *   'మామిడిపండు' -> 'māmiḍipaṃḍu'
 */
export function teluguToIast(text: string): string {
  if (!text) return ''
  const res: string[] = []
  let i = 0
  const n = text.length

  while (i < n) {
    const cp = text.charCodeAt(i)

    if (TELUGU_VOWELS[cp]) {
      res.push(TELUGU_VOWELS[cp])
      i++
    } else if (TELUGU_CONSONANTS[cp]) {
      const cons = TELUGU_CONSONANTS[cp]
      i++
      if (i < n) {
        const ncp = text.charCodeAt(i)
        if (ncp === VIRAMA) {
          // Virama suppresses the inherent 'a'
          res.push(cons)
          i++
        } else if (TELUGU_MATRAS[ncp]) {
          // Dependent vowel sign replaces the inherent 'a'
          res.push(cons + TELUGU_MATRAS[ncp])
          i++
        } else {
          // Consonant followed by another consonant or symbol retains inherent 'a'
          res.push(cons + 'a')
        }
      } else {
        // Consonant at end of string retains inherent 'a'
        res.push(cons + 'a')
      }
    } else if (cp === ANUSVARA) {
      res.push('ṃ')
      i++
    } else if (cp === VISARGA) {
      res.push('ḥ')
      i++
    } else if (cp === VIRAMA) {
      i++
    } else {
      res.push(text[i])
      i++
    }
  }

  return res.join('').normalize('NFC')
}

/**
 * Retrieves the preferred IAST pronunciation for a word.
 * If the term contains Telugu script, generates authentic IAST.
 */
export function getIastPronunciation(term: string, fallbackPronunciation?: string): string {
  if (/[\u0C00-\u0C7F]/.test(term)) {
    return teluguToIast(term)
  }
  return fallbackPronunciation || term
}

/**
 * Maps standard UK QWERTY keyboard letters to their matching IAST diacritical equivalents.
 * Allows young learners using physical English keyboards to type easily while learning IAST.
 */
export function isIastMatch(typedKey: string, targetChar: string): boolean {
  const typed = typedKey.toLowerCase()
  const target = targetChar.toLowerCase()

  if (typed === target) return true

  // Standard keyboard mappings for diacritics
  switch (typed) {
    case 't':
      return target === 'ṭ' || target === 't'
    case 'd':
      return target === 'ḍ' || target === 'd'
    case 'm':
      return target === 'ṃ' || target === 'm'
    case 'n':
      return target === 'ṇ' || target === 'ñ' || target === 'ṅ' || target === 'n'
    case 's':
      return target === 'ś' || target === 'ṣ' || target === 's'
    case 'l':
      return target === 'ḷ' || target === 'l'
    case 'r':
      return target === 'ṛ' || target === 'ṝ' || target === 'ṟ' || target === 'r'
    case 'a':
      return target === 'ā' || target === 'a'
    case 'i':
      return target === 'ī' || target === 'i'
    case 'u':
      return target === 'ū' || target === 'u'
    case 'e':
      return target === 'ē' || target === 'e'
    case 'o':
      return target === 'ō' || target === 'o'
    case 'h':
      return target === 'ḥ' || target === 'h'
    default:
      return false
  }
}

/**
 * Removes diacritical marks to obtain simple base ASCII letter
 */
export function baseIastLetter(char: string): string {
  return char
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ṭ]/g, 't')
    .replace(/[ḍ]/g, 'd')
    .replace(/[ṃ]/g, 'm')
    .replace(/[ṇñṅ]/g, 'n')
    .replace(/[śṣ]/g, 's')
    .replace(/[ḷ]/g, 'l')
    .replace(/[ṛṝṟ]/g, 'r')
    .replace(/[ḥ]/g, 'h')
}


// ─── Telugu Word Complexity Classifier ───────────────────────────────────────

/**
 * Complexity levels for the Telugu spelling game, ordered from simplest to hardest.
 *
 *  '2-simple'    — 2 aksharas, no vowel signs (mātrās), no conjuncts
 *  '2-gunintalu' — 2 aksharas, with vowel signs (ా ి ు etc.), no conjuncts
 *  '2-ottulu'    — 2 aksharas, with conjunct consonants (ల్ల ర్ర మ్మ etc.)
 *  '3-simple'    — 3 aksharas, no conjuncts
 *  '3-ottulu'    — 3 aksharas, with conjuncts
 *  '4-any'       — exactly 4 aksharas
 *  '5plus'       — 5 or more aksharas
 */
export type ComplexityLevel =
  | '2-simple'
  | '2-gunintalu'
  | '2-ottulu'
  | '3-simple'
  | '3-ottulu'
  | '4-any'
  | '5plus'

export interface TeluguWordComplexity {
  aksharaCount: number
  hasGunintalu: boolean // has dependent vowel signs (ా ి ీ ు ూ etc.) or anusvara (ం)
  hasOttulu: boolean    // has conjunct consonants (virama + consonant cluster)
  level: ComplexityLevel
}

// Dependent vowel signs (mātrās U+0C3E–U+0C4C) and anusvara (U+0C02) / visarga (U+0C03)
const _GUNINTALU_RE = /[\u0C3E-\u0C4C\u0C02\u0C03]/
// Conjunct: virama (్ U+0C4D) followed immediately by a consonant (U+0C15–U+0C39)
const _OTTULU_RE = /\u0C4D[\u0C15-\u0C39]/

/**
 * Classifies a Telugu word by its spelling complexity.
 *
 * Examples:
 *   'కర'          → { aksharaCount: 2, hasGunintalu: false, hasOttulu: false, level: '2-simple' }
 *   'రాత'         → { aksharaCount: 2, hasGunintalu: true,  hasOttulu: false, level: '2-gunintalu' }
 *   'పిల్లి'       → { aksharaCount: 2, hasGunintalu: true,  hasOttulu: true,  level: '2-ottulu' }
 *   'అరటిపండు'   → { aksharaCount: 5, hasGunintalu: true,  hasOttulu: false, level: '5plus' }
 *   'గుర్రం'       → { aksharaCount: 2, hasGunintalu: true,  hasOttulu: true,  level: '2-ottulu' }
 */
export function classifyTeluguWord(term: string): TeluguWordComplexity {
  const aksharas = splitTeluguAksharas(term).filter((u) => u.trim() !== '')
  const aksharaCount = aksharas.length
  const hasGunintalu = _GUNINTALU_RE.test(term)
  const hasOttulu = _OTTULU_RE.test(term)

  let level: ComplexityLevel
  if (aksharaCount <= 2) {
    if (hasOttulu) level = '2-ottulu'
    else if (hasGunintalu) level = '2-gunintalu'
    else level = '2-simple'
  } else if (aksharaCount === 3) {
    level = hasOttulu ? '3-ottulu' : '3-simple'
  } else if (aksharaCount === 4) {
    level = '4-any'
  } else {
    level = '5plus'
  }

  return { aksharaCount, hasGunintalu, hasOttulu, level }
}

/** Human-readable label (English + Telugu) for each complexity level */
export const COMPLEXITY_LABELS: Record<
  ComplexityLevel,
  { short: string; label: string; labelTe: string; color: string; emoji: string }
> = {
  '2-simple': {
    short: '2 · Basic',
    label: '2-letter · Basic',
    labelTe: '2 అక్షరాలు · సాధారణం',
    color: '#16a34a',
    emoji: '🟢',
  },
  '2-gunintalu': {
    short: '2 · గుణింతాలు',
    label: '2-letter · Vowel signs',
    labelTe: '2 అక్షరాలు · గుణింతాలు',
    color: '#2563eb',
    emoji: '🔵',
  },
  '2-ottulu': {
    short: '2 · ఒత్తులు',
    label: '2-letter · Conjuncts',
    labelTe: '2 అక్షరాలు · ఒత్తులు',
    color: '#d97706',
    emoji: '🟡',
  },
  '3-simple': {
    short: '3 · Simple',
    label: '3-letter · Simple',
    labelTe: '3 అక్షరాలు · సాధారణం',
    color: '#ca8a04',
    emoji: '🟡',
  },
  '3-ottulu': {
    short: '3 · ఒత్తులు',
    label: '3-letter · Conjuncts',
    labelTe: '3 అక్షరాలు · ఒత్తులు',
    color: '#ea580c',
    emoji: '🟠',
  },
  '4-any': {
    short: '4 అక్షరాలు',
    label: '4-letter words',
    labelTe: '4 అక్షరాలు',
    color: '#dc2626',
    emoji: '🔴',
  },
  '5plus': {
    short: '5+ అక్షరాలు',
    label: '5+ letter words',
    labelTe: '5+ అక్షరాలు',
    color: '#9333ea',
    emoji: '🟣',
  },
}

/** Ordered list of complexity levels from simplest to hardest */
export const COMPLEXITY_ORDER: ComplexityLevel[] = [
  '2-simple',
  '2-gunintalu',
  '2-ottulu',
  '3-simple',
  '3-ottulu',
  '4-any',
  '5plus',
]

// ─── Telugu Akshara Splitter ─────────────────────────────────────────────────
// Unicode ranges for Telugu script (U+0C00–U+0C7F)
const _VIRAMA = 0x0c4d // ్  (halant / vowel suppressor)
const _ANUSVARA = 0x0c02 // ం  (sunna)
const _VISARGA = 0x0c03 // ః  (visargamu)

function _isTeluguVowel(cp: number): boolean {
  return (cp >= 0x0c05 && cp <= 0x0c14) || cp === 0x0c60 || cp === 0x0c61
}
function _isTeluguConsonant(cp: number): boolean {
  return (cp >= 0x0c15 && cp <= 0x0c39) || cp === 0x0c5d // ఽ special
}
function _isTeluguMatra(cp: number): boolean {
  return cp >= 0x0c3e && cp <= 0x0c4c
}

/**
 * Splits a Telugu word into its natural akshara (syllable) units, each of which
 * becomes one tile in the Telugu-script spelling game.
 *
 * Rules:
 *   • Independent vowel (optionally + anusvara/visarga)  → one tile
 *   • Consonant cluster (C + ్ + C …) + optional mātrā + optional anusvara → one tile
 *   • Consonant + virama at end (pure half-consonant)   → one tile
 *
 * Examples:
 *   'అరటిపండు'   → ['అ', 'ర', 'టి', 'పం', 'డు']      — banana
 *   'పిల్లి'      → ['పి', 'ల్లి']                      — cat
 *   'సింహం'      → ['సిం', 'హం']                       — lion
 *   'మామిడిపండు' → ['మా', 'మి', 'డి', 'పం', 'డు']    — mango
 *   'గుర్రం'      → ['గు', 'ర్రం']                      — horse
 */
export function splitTeluguAksharas(text: string): string[] {
  if (!text) return []
  const result: string[] = []
  let i = 0
  const n = text.length

  while (i < n) {
    const cp = text.charCodeAt(i)

    if (_isTeluguVowel(cp)) {
      // Independent vowel — may be followed by anusvara / visarga
      let ak = text[i++]
      if (i < n && (text.charCodeAt(i) === _ANUSVARA || text.charCodeAt(i) === _VISARGA)) {
        ak += text[i++]
      }
      result.push(ak)
    } else if (_isTeluguConsonant(cp)) {
      // Start of an akshara — collect conjunct consonants (C + ్ + C …)
      let ak = text[i++]
      while (
        i < n &&
        text.charCodeAt(i) === _VIRAMA &&
        i + 1 < n &&
        _isTeluguConsonant(text.charCodeAt(i + 1))
      ) {
        ak += text[i] + text[i + 1] // append ్ + next consonant
        i += 2
      }
      // Add final virama (half-consonant with no vowel) or mātrā
      if (i < n && text.charCodeAt(i) === _VIRAMA) {
        ak += text[i++] // pure half-letter / virama ending
      } else if (i < n && _isTeluguMatra(text.charCodeAt(i))) {
        ak += text[i++] // dependent vowel sign (gudi, kommu, etc.)
      }
      // Anusvara / visarga appended to akshara (పం, హం, …)
      if (i < n && (text.charCodeAt(i) === _ANUSVARA || text.charCodeAt(i) === _VISARGA)) {
        ak += text[i++]
      }
      result.push(ak)
    } else if (cp === _ANUSVARA || cp === _VISARGA) {
      // Orphaned anusvara — attach to previous akshara if possible
      if (result.length > 0) {
        result[result.length - 1] += text[i++]
      } else {
        result.push(text[i++])
      }
    } else {
      // Any other character (space, punctuation, numbers) — pass through
      result.push(text[i++])
    }
  }

  return result
}
