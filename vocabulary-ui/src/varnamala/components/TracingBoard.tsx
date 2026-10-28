import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { CharacterLesson } from '../types/character'
import type { TraceAttempt, TracePoint } from '../types/trace'
import { getHorizontalFit } from '../utils/fitStrokes'

export type Point = TracePoint

type TracingBoardProps = {
  lesson: CharacterLesson
  onComplete: (attempt: TraceAttempt) => void
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
const closestDistance = (point: Point, points: Point[]) =>
  Math.min(...points.map((candidate) => distance(point, candidate)))

export function TracingBoard({ lesson, onComplete }: TracingBoardProps) {
  const horizontalFit = getHorizontalFit(lesson.strokes)
  const [drawnStrokes, setDrawnStrokes] = useState<Point[][]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [cursorPoint, setCursorPoint] = useState<Point | null>(null)
  const [active, setActive] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [message, setMessage] = useState('Start at the glowing dot')
  const boardRef = useRef<SVGSVGElement>(null)
  const expectedStroke = lesson.strokes[drawnStrokes.length]

  const getPoint = (event: PointerEvent<SVGSVGElement>): Point => {
    const svg = boardRef.current
    if (!svg) return { x: 0, y: 0 }
    const transform = svg.getScreenCTM()
    if (!transform) return { x: 0, y: 0 }

    const screenPoint = new DOMPoint(event.clientX, event.clientY)
    const svgPoint = screenPoint.matrixTransform(transform.inverse())
    return {
      x: (svgPoint.x - horizontalFit.offsetX) / horizontalFit.scale,
      y: (svgPoint.y - horizontalFit.offsetY) / horizontalFit.scale,
    }
  }

  const startDrawing = (event: PointerEvent<SVGSVGElement>) => {
    if (!expectedStroke) return
    const point = getPoint(event)
    if (distance(point, expectedStroke.start) > 70) {
      setMessage('Look for the glowing dot!')
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setActive(true)
    setCursorPoint(point)
    setCurrentStroke([point])
    setMessage(`Now follow the ${expectedStroke.label.toLowerCase()}`)
  }

  const draw = (event: PointerEvent<SVGSVGElement>) => {
    if (!active) return
    const point = getPoint(event)
    setCursorPoint(point)
    setCurrentStroke((points) => [...points, point])
  }

  const finishDrawing = (event: PointerEvent<SVGSVGElement>) => {
    if (!active || !expectedStroke) return
    const point = getPoint(event)
    const points = [...currentStroke, point]
    setActive(false)
    setCursorPoint(null)
    setCurrentStroke([])
    const guidePoints = expectedStroke.points
    const followsEveryGuidePoint = guidePoints
      ? guidePoints.every((guidePoint) => closestDistance(guidePoint, points) <= 32)
      : true
    const staysNearGuide = guidePoints
      ? points.every((drawnPoint) => closestDistance(drawnPoint, guidePoints) <= 48)
      : true

    if (
      points.length < 5 ||
      distance(points[0], expectedStroke.start) > 70 ||
      distance(point, expectedStroke.end) > 78 ||
      !followsEveryGuidePoint ||
      !staysNearGuide
    ) {
      setMessage(guidePoints ? 'Try again — keep your line close to every dot.' : 'Almost! Start at the dot and finish near the arrow.')
      return
    }

    const nextStrokes = [...drawnStrokes, points]
    setDrawnStrokes(nextStrokes)
    if (nextStrokes.length === lesson.strokes.length) {
      setMessage('Wonderful! You wrote it!')
      setCelebrating(true)
      window.setTimeout(() => onComplete(nextStrokes), 1500)
    } else {
      setMessage('Great stroke! Find the next glowing dot.')
    }
  }

  const clear = () => {
    setDrawnStrokes([])
    setCurrentStroke([])
    setCursorPoint(null)
    setActive(false)
    setMessage('Start at the glowing dot')
  }

  const undo = () => {
    setDrawnStrokes((strokes) => strokes.slice(0, -1))
    setCursorPoint(null)
    setMessage('Try that stroke again.')
  }

  return (
    <div className="trace-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your turn</p>
          <h2>Trace {lesson.glyph}</h2>
        </div>
        <div className="trace-actions">
          <button className="text-button" type="button" onClick={undo} disabled={!drawnStrokes.length}>↶ Undo</button>
          <button className="text-button" type="button" onClick={clear}>Clear</button>
        </div>
      </div>
      <p className="trace-message" aria-live="polite">{message}</p>
      <div className="tracing-surface">
        <svg
          ref={boardRef}
          viewBox="0 0 500 420"
          role="application"
          aria-label={`Tracing board for ${lesson.glyph}`}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
        >
          <g transform={`translate(${horizontalFit.offsetX} ${horizontalFit.offsetY}) scale(${horizontalFit.scale})`}>
            <path className="trace-guide" d={lesson.strokes.map((item) => item.path).join(' ')} />
            {lesson.strokes.map((item, index) => (
              <g key={item.id} className={index < drawnStrokes.length ? 'completed-stroke' : ''}>
                <path className="trace-path" d={item.path} />
                {index === drawnStrokes.length && (
                  <>
                    <circle className="start-dot" cx={item.start.x} cy={item.start.y} r="13" />
                    <path className="arrow" d={`M ${item.end.x - 10} ${item.end.y - 8} L ${item.end.x} ${item.end.y} L ${item.end.x - 10} ${item.end.y + 8}`} />
                  </>
                )}
              </g>
            ))}
            {drawnStrokes.map((points, index) => (
              <polyline className="child-stroke" key={`drawn-${index}`} points={points.map((point) => `${point.x},${point.y}`).join(' ')} />
            ))}
            {currentStroke.length > 1 && (
              <polyline className="child-stroke current-stroke" points={currentStroke.map((point) => `${point.x},${point.y}`).join(' ')} />
            )}
            {active && cursorPoint && (
              <g
                className="writing-pen trace-pencil"
                transform={`translate(${cursorPoint.x} ${cursorPoint.y})`}
                aria-label="Tracing pencil"
              >
                <g className="pencil" transform="rotate(35)">
                  <path className="pencil-tip" d="M -7 -7 L 0 0 L 7 -7 Z" />
                  <path className="pencil-lead" d="M -2 -4 L 0 0 L 2 -4 Z" />
                  <rect className="pencil-body" x="-7" y="-37" width="14" height="30" rx="3" />
                  <path className="pencil-highlight" d="M -3 -34 L -3 -10" />
                  <rect className="pencil-band" x="-7" y="-44" width="14" height="7" rx="2" />
                </g>
              </g>
            )}
          </g>
        </svg>
        {celebrating && (
          <div className="celebration" role="status" aria-live="polite">
            <span className="celebration-stars">✦ ✧ ✦</span>
            <strong>Well done!</strong>
            <span>That was fantastic writing!</span>
          </div>
        )}
      </div>
      <div className="progress-dots" aria-label={`${drawnStrokes.length} of ${lesson.strokes.length} strokes complete`}>
        {lesson.strokes.map((stroke) => (
          <span className={drawnStrokes.some((_, index) => lesson.strokes[index].id === stroke.id) ? 'done' : ''} key={stroke.id} />
        ))}
      </div>
    </div>
  )
}
