export type Stroke = {
  id: string
  path: string
  label: string
  start: { x: number; y: number }
  end: { x: number; y: number }
  points?: Array<{ x: number; y: number }>
}

export type CharacterLesson = {
  id: string
  glyph: string
  transliteration: string
  pronunciation: string
  exampleWord: string
  tip: string
  strokes: Stroke[]
  writingBounds?: { minY: number; maxY: number }
  pdfUrl?: string
  audioUrl?: string
}
