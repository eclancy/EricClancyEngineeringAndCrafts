import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { Heart, Sparkle } from './Doodles'

// A tiny DrawPets in the page: draw a tail, legs or wings on their own sheet, starting from the
// red dot where they join, and they go onto a little creature. "Bring it to life!" and each
// part moves the way its kind does in the game - tails wag, legs walk, wings flap - turning
// about the red dot. The drawing is never smoothed or changed; it only rotates.

type PartKind = 'tail' | 'legs' | 'wings'

interface Stroke {
  color: string
  width: number
  /** Flat x, y pairs in sheet units (0..SHEET). */
  points: number[]
}

/** Every sheet is SHEET x SHEET units, drawn at twice that for sharp lines. */
const SHEET = 300
const SCALE = 2

const PARTS: Record<
  PartKind,
  {
    label: string
    moves: string
    hint: string
    /** The red dot on the sheet: where the part joins the body. */
    dot: [number, number]
    /** Where it joins on the creature, in stage units (STAGE_W x STAGE_H). */
    joints: [number, number][]
  }
> = {
  tail: {
    label: 'Tail',
    moves: 'wags',
    hint: 'Draw a tail going LEFT from the red dot.',
    dot: [262, 150],
    joints: [[136, 214]],
  },
  legs: {
    label: 'Legs',
    moves: 'walk',
    hint: 'Draw one leg hanging DOWN from the red dot. You get two!',
    dot: [150, 34],
    joints: [
      [190, 262],
      [256, 262],
    ],
  },
  wings: {
    label: 'Wings',
    moves: 'flap',
    hint: 'Draw a wing growing UP from the red dot.',
    dot: [150, 266],
    joints: [[212, 172]],
  },
}
const KINDS: PartKind[] = ['tail', 'legs', 'wings']

const STAGE_W = 420
const STAGE_H = 400
/** A part's sheet is shown at this many stage units on the creature. */
const PART_SIZE = 150

const COLORS = [
  { name: 'Black', value: '#2d2a3e' },
  { name: 'Red', value: '#e8434f' },
  { name: 'Orange', value: '#ff8a3d' },
  { name: 'Yellow', value: '#ffcf33' },
  { name: 'Green', value: '#4fbf5f' },
  { name: 'Blue', value: '#3d9df0' },
  { name: 'Purple', value: '#9a5cf0' },
  { name: 'Pink', value: '#ff7eb6' },
  { name: 'Brown', value: '#8a5a3c' },
]
const BRUSHES = [
  { name: 'Thin', width: 8 },
  { name: 'Fat', width: 20 },
]

// The "Draw one for me" parts, drawn the way a kid might: a fat colour, then a dark outline.
function sample(kind: PartKind, color: string): Stroke[] {
  const ink = '#2d2a3e'
  const line = (points: [number, number][], c: string, width: number): Stroke => ({
    color: c,
    width,
    points: points.flat(),
  })
  if (kind === 'tail') {
    const wave: [number, number][] = []
    for (let i = 0; i <= 24; i++) {
      const t = i / 24
      wave.push([262 - t * 225, 150 - t * 40 - Math.sin(t * Math.PI * 2) * 34])
    }
    return [line(wave, ink, 30), line(wave, color, 16)]
  }
  if (kind === 'legs') {
    const leg: [number, number][] = [
      [150, 34],
      [148, 120],
      [151, 210],
      [150, 236],
      [196, 240],
    ]
    return [line(leg, ink, 34), line(leg, color, 20)]
  }
  // A wing: coloured in with fat scribbles from the dot to each feather tip, then outlined.
  const outline: [number, number][] = [
    [150, 266],
    [84, 214],
    [52, 120],
    [98, 140],
    [104, 62],
    [150, 120],
    [184, 52],
    [204, 140],
    [246, 112],
    [226, 214],
    [150, 266],
  ]
  const tips = outline.slice(1, -1)
  const fill = tips.map(([x, y]) =>
    line(
      [
        [150, 250],
        [(150 + x) / 2, (250 + y) / 2],
        [x * 0.85 + 150 * 0.15, y * 0.85 + 250 * 0.15],
      ],
      color,
      46,
    ),
  )
  return [...fill, line([[150, 190]], color, 110), line(outline, ink, 9)]
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.strokeStyle = s.color
  ctx.fillStyle = s.color
  ctx.lineWidth = s.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const p = s.points
  if (p.length === 2) {
    ctx.beginPath()
    ctx.arc(p[0], p[1], s.width / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.beginPath()
  ctx.moveTo(p[0], p[1])
  for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1])
  ctx.stroke()
}

/** The part as a picture with a clear background, to stick on the creature. */
function partImage(strokes: Stroke[]): string | null {
  if (strokes.length === 0) return null
  const canvas = document.createElement('canvas')
  canvas.width = SHEET * SCALE
  canvas.height = SHEET * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(SCALE, SCALE)
  strokes.forEach((s) => drawStroke(ctx, s))
  return canvas.toDataURL('image/png')
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`

export function PartMaker() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [kind, setKind] = useState<PartKind>('tail')
  const [color, setColor] = useState(COLORS[2].value)
  const [brush, setBrush] = useState(BRUSHES[1].width)
  const [strokes, setStrokes] = useState<Record<PartKind, Stroke[]>>({
    tail: [],
    legs: [],
    wings: [],
  })
  const [alive, setAlive] = useState(false)
  const [cheer, setCheer] = useState(0)
  const live = useRef<Stroke | null>(null)

  const images = useMemo(
    () => ({
      tail: partImage(strokes.tail),
      legs: partImage(strokes.legs),
      wings: partImage(strokes.wings),
    }),
    [strokes],
  )

  const repaint = useCallback(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0)
    ctx.clearRect(0, 0, SHEET, SHEET)
    strokes[kind].forEach((s) => drawStroke(ctx, s))
  }, [strokes, kind])

  useEffect(repaint, [repaint])

  const toSheet = (e: { clientX: number; clientY: number }) => {
    const rect = canvas.current!.getBoundingClientRect()
    return [
      ((e.clientX - rect.left) / rect.width) * SHEET,
      ((e.clientY - rect.top) / rect.height) * SHEET,
    ]
  }

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    live.current = { color, width: brush, points: toSheet(e) }
    const ctx = canvas.current?.getContext('2d')
    if (ctx) drawStroke(ctx, live.current)
  }

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const stroke = live.current
    if (!stroke) return
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
    const ctx = canvas.current?.getContext('2d')
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const [x, y] = toSheet(ev)
      const n = stroke.points.length
      if (ctx) {
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(stroke.points[n - 2], stroke.points[n - 1])
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      stroke.points.push(x, y)
    }
  }

  const onUp = () => {
    const stroke = live.current
    if (!stroke) return
    live.current = null
    const part = kind
    setStrokes((all) => ({ ...all, [part]: [...all[part], stroke] }))
  }

  const change = (next: Stroke[]) => setStrokes((all) => ({ ...all, [kind]: next }))

  const bringToLife = () => {
    if (alive) {
      setAlive(false)
      return
    }
    setAlive(true)
    setCheer((c) => c + 1)
  }

  const part = PARTS[kind]
  const missing = KINDS.filter((k) => !images[k])
  const message = !alive
    ? missing.length === 3
      ? 'Draw a part, then bring it to life!'
      : 'Ready when you are...'
    : missing.length === 0
      ? 'It walks, it wags, it flaps!'
      : missing.length === 3
        ? "It's alive! Now give it a tail, legs or wings."
        : `It's alive! Try giving it ${missing.map((k) => PARTS[k].label.toLowerCase()).join(' and ')} too.`

  return (
    <div className="dp-maker">
      <div className="dp-maker-draw">
        <div className="dp-tabs" role="group" aria-label="Which part to draw">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className="dp-tab"
              aria-pressed={k === kind}
              onClick={() => setKind(k)}
            >
              <span className="dp-tab-label">{PARTS[k].label}</span>
              <span className="dp-tab-moves">{PARTS[k].moves}</span>
              {images[k] && (
                <span className="dp-tab-done" aria-label="(drawn)">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="dp-hint" id="dp-sheet-hint">
          {part.hint}
        </p>
        <div className="dp-sheet">
          <canvas
            ref={canvas}
            width={SHEET * SCALE}
            height={SHEET * SCALE}
            className="dp-canvas"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="img"
            aria-label={`Drawing sheet for the ${part.label.toLowerCase()}. Draw on it with a mouse, finger or pen, or press Draw one for me.`}
            aria-describedby="dp-sheet-hint"
          />
          <span
            className="dp-red-dot"
            aria-hidden="true"
            style={{ left: pct(part.dot[0], SHEET), top: pct(part.dot[1], SHEET) }}
          />
          {strokes[kind].length === 0 && (
            <span
              className={`dp-sheet-tip is-${kind}`}
              aria-hidden="true"
              style={{ left: pct(part.dot[0], SHEET), top: pct(part.dot[1], SHEET) }}
            >
              start here
            </span>
          )}
        </div>

        <div className="dp-tools">
          <div className="dp-swatches" role="group" aria-label="Pencil colour">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className="dp-swatch"
                style={{ '--swatch': c.value } as CSSProperties}
                aria-label={c.name}
                aria-pressed={c.value === color}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>
          <div className="dp-tool-row">
            <div className="dp-brushes" role="group" aria-label="Pencil size">
              {BRUSHES.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  className="dp-chip"
                  aria-pressed={b.width === brush}
                  onClick={() => setBrush(b.width)}
                >
                  <span
                    className="dp-brush-dot"
                    aria-hidden="true"
                    style={{ width: b.width * 0.7 + 2, height: b.width * 0.7 + 2 }}
                  />
                  {b.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="dp-chip"
              onClick={() => change(strokes[kind].slice(0, -1))}
              disabled={strokes[kind].length === 0}
            >
              Undo
            </button>
            <button
              type="button"
              className="dp-chip"
              onClick={() => change([])}
              disabled={strokes[kind].length === 0}
            >
              Clear
            </button>
            <button
              type="button"
              className="dp-chip is-surprise"
              onClick={() =>
                change(sample(kind, color === COLORS[0].value ? COLORS[2].value : color))
              }
            >
              Draw one for me
            </button>
          </div>
        </div>
      </div>

      <div className="dp-maker-stage">
        <div className={`dp-stage ${alive ? 'is-alive' : ''}`}>
          <p className="dp-stage-label" aria-live="polite">
            {message}
          </p>
          <div className="dp-creature">
            <svg
              className="dp-creature-shadow"
              viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
              aria-hidden="true"
            >
              <ellipse cx="224" cy="388" rx="120" ry="10" fill="#3b3566" opacity="0.14" />
            </svg>
            {KINDS.map((k) =>
              PARTS[k].joints.map(([jx, jy], i) => {
                const src = images[k]
                if (!src) return null
                const [dx, dy] = PARTS[k].dot
                const scale = PART_SIZE / SHEET
                return (
                  <img
                    key={`${k}-${i}`}
                    src={src}
                    alt=""
                    className={`dp-part is-${k} is-${i === 0 ? 'first' : 'second'}`}
                    style={{
                      left: pct(jx - dx * scale, STAGE_W),
                      top: pct(jy - dy * scale, STAGE_H),
                      width: pct(PART_SIZE, STAGE_W),
                      transformOrigin: `${pct(dx, SHEET)} ${pct(dy, SHEET)}`,
                    }}
                  />
                )
              }),
            )}
            <CreatureBody />
          </div>
          {alive && (
            <div className="dp-alive-burst" key={cheer} aria-hidden="true">
              <Heart className="is-a" />
              <Sparkle className="is-b" />
              <Heart className="is-c" color="var(--dp-orange)" />
              <Sparkle className="is-d" color="var(--dp-pink)" />
            </div>
          )}
        </div>
        <button type="button" className="dp-btn dp-life-btn" onClick={bringToLife}>
          {alive ? 'Let it rest' : 'Bring it to life!'}
        </button>
      </div>
    </div>
  )
}

// The creature's body and head, drawn like a kid's marker drawing. The head looks right, the
// way every DrawPets creature is drawn.
function CreatureBody() {
  return (
    <svg
      className="dp-creature-body"
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      role="img"
      aria-label="A round orange creature with a yellow head, waiting for its parts"
    >
      <g filter="url(#dp-wobble-soft)">
        <g className="dp-body-breathe">
          <ellipse
            cx="222"
            cy="222"
            rx="94"
            ry="60"
            fill="#ff9a4a"
            stroke="#2d2a3e"
            strokeWidth="7"
          />
          <ellipse cx="222" cy="222" rx="94" ry="60" fill="url(#dp-hatch)" />
          <circle cx="186" cy="208" r="8" fill="#a35a2a" />
          <circle cx="232" cy="242" r="7" fill="#a35a2a" />
          <circle cx="262" cy="200" r="6" fill="#a35a2a" />
        </g>
        <g className="dp-head">
          <circle
            cx="312"
            cy="166"
            r="48"
            fill="#ffd84a"
            stroke="#2d2a3e"
            strokeWidth="7"
          />
          <circle cx="312" cy="166" r="48" fill="url(#dp-hatch)" />
          <g className="dp-eyes">
            <circle
              cx="304"
              cy="152"
              r="13"
              fill="#fff"
              stroke="#2d2a3e"
              strokeWidth="4"
            />
            <circle
              cx="336"
              cy="152"
              r="13"
              fill="#fff"
              stroke="#2d2a3e"
              strokeWidth="4"
            />
            <circle cx="308" cy="154" r="6" fill="#2d2a3e" />
            <circle cx="340" cy="154" r="6" fill="#2d2a3e" />
          </g>
          <path
            d="M312 186c8 9 22 9 30-2"
            fill="none"
            stroke="#2d2a3e"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="292" cy="182" r="7" fill="#ff8fa8" opacity="0.7" />
        </g>
      </g>
    </svg>
  )
}
