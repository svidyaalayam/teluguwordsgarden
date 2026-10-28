import type { CharacterLesson } from '../types/character'

type CharacterCardProps = {
  lesson: CharacterLesson
  selected: boolean
  onSelect: () => void
}

export function CharacterCard({ lesson, selected, onSelect }: CharacterCardProps) {
  return (
    <button className={`character-card ${selected ? 'selected' : ''}`} type="button" onClick={onSelect} aria-pressed={selected}>
      <span className="character-glyph">{lesson.glyph}</span>
      <span className="character-name">{lesson.transliteration}</span>
    </button>
  )
}
