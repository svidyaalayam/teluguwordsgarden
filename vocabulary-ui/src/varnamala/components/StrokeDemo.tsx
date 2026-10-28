import { useEffect, useRef, useState } from 'react'
import type { Stroke } from '../types/character'
import { getHorizontalFit } from '../utils/fitStrokes'

type StrokeDemoProps = {
  strokes: Stroke[]
  playing: boolean
  onPlayingChange: (playing: boolean) => void
}

const strokeColors = [
  { name: 'Leaf green', value: '#1f7a5c' },
  { name: 'Sky blue', value: '#3d82c4' },
  { name: 'Berry pink', value: '#d05a82' },
  { name: 'Sunny orange', value: '#e58a2f' },
  { name: 'Plum purple', value: '#7564d8' },
]

export function StrokeDemo({ strokes, playing, onPlayingChange }: StrokeDemoProps) {
  const horizontalFit = getHorizontalFit(strokes)
  const [visibleCount, setVisibleCount] = useState(playing ? 0 : strokes.length)
  const [durationSeconds, setDurationSeconds] = useState(7)
  const [strokeColor, setStrokeColor] = useState(strokeColors[0].value)
  const activeStroke = playing ? strokes[visibleCount - 1] : undefined
  const activePathRef = useRef<SVGPathElement>(null)
  const [penPosition, setPenPosition] = useState({ x: 0, y: 0 })
  const replay = () => {
    setVisibleCount(0)
    onPlayingChange(true)
  }
  const changeDuration = (value: number) => {
    setDurationSeconds(value)
    setVisibleCount(0)
    onPlayingChange(true)
  }

  useEffect(() => {
    if (!playing) {
      setVisibleCount(strokes.length)
      return
    }

    setVisibleCount(1)
    const strokeDuration = (durationSeconds * 1000) / strokes.length
    const timers: number[] = []
    strokes.forEach((_, index) => {
      if (index === 0) return
      timers.push(window.setTimeout(() => {
        setVisibleCount(index + 1)
        if (index === strokes.length - 1) {
          timers.push(window.setTimeout(() => onPlayingChange(false), strokeDuration + 500))
        }
      }, strokeDuration * index))
    })
    if (strokes.length === 1) {
      timers.push(window.setTimeout(() => onPlayingChange(false), strokeDuration + 500))
    }

    return () => timers.forEach(window.clearTimeout)
  }, [durationSeconds, onPlayingChange, playing, strokes])

  useEffect(() => {
    if (!playing || !activeStroke || !activePathRef.current) return

    const path = activePathRef.current
    const length = path.getTotalLength()
    const duration = (durationSeconds * 1000) / strokes.length
    const startedAt = performance.now()
    let frame = 0

    const movePen = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const point = path.getPointAtLength(length * progress)
      setPenPosition({ x: point.x, y: point.y })
      if (progress < 1) frame = requestAnimationFrame(movePen)
    }

    frame = requestAnimationFrame(movePen)
    return () => cancelAnimationFrame(frame)
  }, [activeStroke, durationSeconds, playing, strokes.length])

  return (
    <div className="demo-card">
      <div className="section-heading">
        <div>
          <h2>Learn</h2>
        </div>
      </div>
      <div className="demo-controls">
        <label className="speed-control">
          <span>Time: <strong>{durationSeconds}s</strong></span>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={durationSeconds}
            onChange={(event) => changeDuration(Number(event.target.value))}
            aria-label="Animation duration in seconds"
          />
          <span className="speed-labels"><span>Fast</span><span>Slow</span></span>
        </label>
        <button className="secondary-button" type="button" onClick={replay}>
          {playing ? 'Showing…' : '▶ Show'}
        </button>
      </div>
      <div className="color-picker" aria-label="Choose animation colour">
        <span>Colour</span>
        {strokeColors.map((color) => (
          <button
            className={strokeColor === color.value ? 'color-swatch selected' : 'color-swatch'}
            key={color.value}
            type="button"
            onClick={() => setStrokeColor(color.value)}
            style={{ backgroundColor: color.value }}
            aria-label={color.name}
            aria-pressed={strokeColor === color.value}
          />
        ))}
      </div>
      <div className="stroke-demo" aria-label="Animated stroke order demonstration">
        <svg viewBox="0 0 500 420" role="img">
          <title>Stroke order demonstration</title>
          <g transform={`translate(${horizontalFit.offsetX} ${horizontalFit.offsetY}) scale(${horizontalFit.scale})`}>
            <path className="demo-guide" d={strokes.map((item) => item.path).join(' ')} />
            {strokes.slice(0, visibleCount).map((item) => (
              <g key={item.id}>
                <path
                  key={`${item.id}-${playing ? 'playing' : 'shown'}`}
                  className={playing ? 'demo-stroke is-playing' : 'demo-stroke'}
                  d={item.path}
                  pathLength="1"
                  ref={item.id === activeStroke?.id ? activePathRef : undefined}
                  style={playing ? { stroke: strokeColor, animationDuration: `${(durationSeconds * 1000) / strokes.length}ms` } : { stroke: strokeColor }}
                />
              </g>
            ))}
            {activeStroke && (
              <g className="writing-pen" transform={`translate(${penPosition.x} ${penPosition.y})`} aria-label="Moving writing pen">
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
      </div>
    </div>
  )
}
