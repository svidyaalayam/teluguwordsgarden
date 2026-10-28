import type { Stroke } from '../types/character'

type Coordinate = [number, number]

function strokeFromPoints(id: string, points: Coordinate[], label: string): Stroke {
  const [firstPoint, ...remainingPoints] = points
  return {
    id,
    path: [
      `M ${firstPoint[0]} ${firstPoint[1]}`,
      ...remainingPoints.map(([x, y]) => `L ${x} ${y}`),
    ].join(' '),
    label,
    start: { x: firstPoint[0], y: firstPoint[1] },
    end: { x: points[points.length - 1][0], y: points[points.length - 1][1] },
    points: points.map(([x, y]) => ({ x, y })),
  }
}

export function strokesFromCoordinateArrays(
  idPrefix: string,
  xArray: number[],
  yArray: number[],
  labelPrefix: string,
): Stroke[] {
  const strokes: Stroke[] = []
  let points: Coordinate[] = []

  const finishStroke = () => {
    if (points.length > 1) {
      strokes.push(strokeFromPoints(`${idPrefix}-${strokes.length + 1}`, points, `${labelPrefix} ${strokes.length + 1}`))
    }
    points = []
  }

  xArray.forEach((x, index) => {
    const y = yArray[index]
    if (x === 0 && y === 0) {
      finishStroke()
      return
    }
    if (typeof y === 'number') points.push([x, y])
  })
  finishStroke()
  return strokes
}
