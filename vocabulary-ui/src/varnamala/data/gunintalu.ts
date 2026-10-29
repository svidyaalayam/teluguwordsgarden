export type Gunintam = {
  vowel: string
  sign: string
  transliteration: string
}

export const gunintalu: Gunintam[] = [
  { vowel: 'అ', sign: '', transliteration: 'a' },
  { vowel: 'ఆ', sign: 'ా', transliteration: 'ā' },
  { vowel: 'ఇ', sign: 'ి', transliteration: 'i' },
  { vowel: 'ఈ', sign: 'ీ', transliteration: 'ī' },
  { vowel: 'ఉ', sign: 'ు', transliteration: 'u' },
  { vowel: 'ఊ', sign: 'ూ', transliteration: 'ū' },
  { vowel: 'ఋ', sign: 'ృ', transliteration: 'ṛ' },
  { vowel: 'ౠ', sign: 'ౄ', transliteration: 'ṝ' },
  { vowel: 'ఎ', sign: 'ె', transliteration: 'e' },
  { vowel: 'ఏ', sign: 'ే', transliteration: 'ē' },
  { vowel: 'ఐ', sign: 'ై', transliteration: 'ai' },
  { vowel: 'ఒ', sign: 'ొ', transliteration: 'o' },
  { vowel: 'ఓ', sign: 'ో', transliteration: 'ō' },
  { vowel: 'ఔ', sign: 'ౌ', transliteration: 'au' },
  { vowel: 'అం', sign: 'ం', transliteration: 'aṃ' },
  { vowel: 'అః', sign: 'ః', transliteration: 'aḥ' },
]

export function makeGunintam(consonant: string, sign: string) {
  return `${consonant}${sign}`
}

export function deadConsonant(consonant: string) {
  return `${consonant}్‌`
}

export function consonantStem(transliteration: string) {
  return transliteration.endsWith('a') ? transliteration.slice(0, -1) : transliteration
}
