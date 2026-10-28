import type { Stroke } from '../types/character'

export type HorizontalFit = {
  scale: number
  offsetX: number
  offsetY: number
}

const numbersInPath = (path: string) =>
  (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)

export function getHorizontalFit(strokes: Stroke[], viewBoxWidth = 500, viewBoxHeight = 420, padding = 30): HorizontalFit {
  const coordinates = strokes.flatMap((stroke) => {
    const pathNumbers = numbersInPath(stroke.path)
    const pathCoordinates = Array.from({ length: Math.floor(pathNumbers.length / 2) }, (_, index) => ({
      x: pathNumbers[index * 2],
      y: pathNumbers[index * 2 + 1],
    }))
    return [
      ...pathCoordinates,
      stroke.start,
      stroke.end,
      ...(stroke.points ?? []),
    ]
  })
  const minimumX = Math.min(...coordinates.map((point) => point.x))
  const maximumX = Math.max(...coordinates.map((point) => point.x))
  const minimumY = Math.min(...coordinates.map((point) => point.y))
  const maximumY = Math.max(...coordinates.map((point) => point.y))
  const sourceWidth = Math.max(maximumX - minimumX, 1)
  const sourceHeight = Math.max(maximumY - minimumY, 1)
  const availableWidth = Math.max(viewBoxWidth - padding * 2, 1)
  const availableHeight = Math.max(viewBoxHeight - padding * 2, 1)
  const scale = Math.min(availableWidth / sourceWidth, availableHeight / sourceHeight)

  return {
    scale,
    offsetX: (viewBoxWidth - sourceWidth * scale) / 2 - minimumX * scale,
    offsetY: (viewBoxHeight - sourceHeight * scale) / 2 - minimumY * scale,
  }
}
