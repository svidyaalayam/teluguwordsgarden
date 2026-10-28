export type LanguageId = 'telugu' | 'hindi' | 'kannada' | 'tamil'

type LanguageOption = {
  id: LanguageId
  nativeName: string
  englishName: string
  available: boolean
}

type LanguageSelectorProps = {
  value: LanguageId
  onChange: (language: LanguageId) => void
}

const languages: LanguageOption[] = [
  { id: 'telugu', nativeName: 'తెలుగు', englishName: 'Telugu', available: true },
  { id: 'hindi', nativeName: 'हिन्दी', englishName: 'Hindi', available: true },
  { id: 'kannada', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', available: false },
  { id: 'tamil', nativeName: 'தமிழ்', englishName: 'Tamil', available: false },
]

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="language-selector" aria-label="Choose a language">
      <span className="language-label">Language</span>
      <div className="language-options">
        {languages.map((language) => (
          <button
            className={value === language.id ? 'selected' : ''}
            disabled={!language.available}
            key={language.id}
            type="button"
            onClick={() => onChange(language.id)}
            title={language.available ? language.englishName : `${language.englishName} lessons coming soon`}
          >
            <span>{language.nativeName}</span>
            <small>{language.englishName}{!language.available && ' · soon'}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
