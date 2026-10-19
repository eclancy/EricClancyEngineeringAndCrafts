import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Puppet } from './Puppet'
import { rigs } from './rigs'
import { mix, sample, type ClipName, type Pose } from './poses'

// "Smack the doodle": the game's own fighters, rigs and knockback formula on a page of the
// notebook. Every hit adds damage, and the more damage a fighter has taken, the further the next
// hit sends them, until one sends them off the page. That is the whole of Smash's rules, and
// pressing a button three times teaches it better than a paragraph does.

const W = 600
const H = 350
const GROUND = 296
const HOME = 230
const FIGURE = 150
const GRAVITY = 0.5
const LAUNCH = 0.088
const STOCKS = 3

// The game's weights (WeightClass.BodyWeight).
const WEIGHTS: Record<string, number> = { circy: 100, triguy: 82, doombot: 128 }

interface Attack {
  id: 'poke' | 'smash' | 'glitter'
  label: string
  key: string
  damage: number
  base: number
  growth: number
  angle: number
  /** Frames from pressing to the hit landing. */
  windup: number
  /** Frames the attacker animation lasts in all. */
  length: number
}

const ATTACKS: Attack[] = [
  {
    id: 'poke',
    label: 'Poke',
    key: 'J',
    damage: 3,
    base: 4,
    growth: 0.35,
    angle: 25,
    windup: 5,
    length: 12,
  },
  {
    id: 'smash',
    label: 'Pencil smash',
    key: 'K',
    damage: 16,
    base: 26,
    growth: 1,
    angle: 38,
    windup: 16,
    length: 30,
  },
  {
    id: 'glitter',
    label: 'Glitter bomb',
    key: 'L',
    damage: 12,
    base: 30,
    growth: 1.3,
    angle: 72,
    windup: 28,
    length: 30,
  },
]

// Knockback.Compute from the game, line for line.
function knockback(percent: number, attack: Attack, weight: number) {
  const weightFactor = 200 / (weight + 100)
  const percentTerm = percent / 10 + (percent * attack.damage) / 20
  return (percentTerm * weightFactor * 1.4 + 18) * attack.growth + attack.base
}

type Mode =
  'idle' | 'hitlag' | 'flying' | 'landing' | 'returning' | 'ko' | 'respawn' | 'over'

interface Sim {
  mode: Mode
  timer: number
  t: number
  percent: number
  stocks: number
  x: number
  y: number
  vx: number
  vy: number
  spin: number
  spinV: number
  facing: 1 | -1
  attack: { a: Attack; frame: number } | null
  pendingHit: Attack | null
  trail: [number, number][]
  ghost: { x: number; y: number; ko: boolean } | null
  pops: { text: string; x: number; y: number; age: number; big: boolean }[]
  burst: { x: number; y: number; age: number } | null
  glitter: { x: number; y: number; age: number } | null
  impact: { x: number; y: number; age: number } | null
  launchFrom: number
  lastFlight: number | null
  best: number
  shown: Pose
}

const fresh = (): Sim => ({
  mode: 'idle',
  timer: 0,
  t: 0,
  percent: 0,
  stocks: STOCKS,
  x: HOME,
  y: GROUND,
  vx: 0,
  vy: 0,
  spin: 0,
  spinV: 0,
  facing: -1,
  attack: null,
  pendingHit: null,
  trail: [],
  ghost: null,
  pops: [],
  burst: null,
  glitter: null,
  impact: null,
  launchFrom: HOME,
  lastFlight: null,
  best: 0,
  shown: sample('idle', 0),
})

const offPage = (x: number, y: number) => x > W + 50 || y < -40

const percentColour = (p: number) => {
  // Ink at 0%, through orange, to the game's deep red past 120%.
  const k = Math.min(1, p / 150)
  const hue = 28 - 26 * k
  const light =
    20 + 30 * Math.sin(Math.min(1, k * 1.6) * Math.PI * 0.5) - 14 * Math.max(0, k - 0.7)
  return k < 0.04 ? '#1d2433' : `hsl(${hue} ${70 + 15 * k}% ${light}%)`
}

interface Ctx {
  name: string
  weight: number
  reduced: boolean
  pose: ClipName
  say: (text: string) => void
}

const hitlagFrames = (a: Attack) => Math.round(4 + a.damage * 0.45)

// Where a launch ends up, run ahead of time: drawn as the pencil-dashed arc, and for people who
// prefer less motion, all they see of the flight.
function plot(x: number, y: number, vx: number, vy: number) {
  const trail: [number, number][] = [[x, y]]
  for (let i = 0; i < 600; i++) {
    vx *= 0.995
    vy += GRAVITY
    x += vx
    y += vy
    if (i % 2 === 0) trail.push([x, y])
    if (offPage(x, y)) return { trail, x, y, ko: true }
    if (y >= GROUND && vy > 0) return { trail, x, y: GROUND, ko: false }
  }
  return { trail, x, y, ko: false }
}

function hit(s: Sim, a: Attack) {
  if (s.mode !== 'idle' && s.mode !== 'returning' && s.mode !== 'landing') return
  s.percent = Math.min(999, s.percent + a.damage)
  s.pendingHit = a
  s.mode = 'hitlag'
  s.timer = 0
  s.facing = -1
  const chest = s.y - FIGURE * 0.55
  s.pops.push({
    text: `+${a.damage}%`,
    x: s.x + 14,
    y: chest - 50,
    age: 0,
    big: a.damage > 10,
  })
  if (a.id === 'glitter') s.glitter = { x: s.x, y: chest, age: 0 }
  else s.impact = { x: s.x - 24, y: chest, age: 0 }
}

function launch(s: Sim, c: Ctx) {
  const a = s.pendingHit!
  const kb = knockback(s.percent, a, c.weight)
  const v = kb * LAUNCH
  const rad = (a.angle * Math.PI) / 180
  s.vx = Math.cos(rad) * v
  s.vy = -Math.sin(rad) * v
  s.launchFrom = s.x
  s.spinV = kb > 90 ? Math.min(22, (kb - 80) * 0.12) : 0
  const flight = plot(s.x, s.y, s.vx, s.vy)
  s.trail = flight.trail
  s.mode = 'flying'
  s.timer = 0
  if (!c.reduced) return
  // Skip the flight: the dashed arc shows where it went.
  s.ghost = { x: flight.x, y: flight.y, ko: flight.ko }
  if (flight.ko) {
    s.x = flight.x
    s.y = flight.y
    ko(s, c)
  } else {
    s.x = HOME
    s.y = GROUND
    s.mode = 'idle'
    landed(s, c, Math.abs(flight.x - s.launchFrom))
  }
}

function landed(s: Sim, c: Ctx, distance: number) {
  s.lastFlight = distance
  s.best = Math.max(s.best, distance)
  c.say(`${c.name} is on ${s.percent}%, and got knocked ${metres(distance)}.`)
}

function ko(s: Sim, c: Ctx) {
  s.stocks--
  s.mode = 'ko'
  s.timer = 0
  s.lastFlight = null
  s.burst = {
    x: Math.min(Math.max(s.x, 40), W - 40),
    y: Math.min(Math.max(s.y - FIGURE / 2, 50), GROUND - 40),
    age: 0,
  }
  c.say(
    s.stocks > 0
      ? `KO! ${c.name} flew off the page at ${s.percent}%. ${s.stocks} ${s.stocks === 1 ? 'life' : 'lives'} left.`
      : `KO! That was ${c.name}'s last life. Game!`,
  )
}

// One 60 Hz frame, like the game's _PhysicsProcess.
function step(s: Sim, c: Ctx) {
  s.t++
  s.timer++
  for (const p of s.pops) p.age++
  s.pops = s.pops.filter((p) => p.age < 60)
  if (s.burst && ++s.burst.age > 50) s.burst = null
  if (s.glitter && ++s.glitter.age > 36) s.glitter = null
  if (s.impact && ++s.impact.age > 12) s.impact = null

  // The attacker's swing; the hit lands on its windup frame.
  if (s.attack) {
    s.attack.frame++
    if (s.attack.frame === s.attack.a.windup) hit(s, s.attack.a)
    if (s.attack.frame >= s.attack.a.length) s.attack = null
  }

  let target: Pose
  switch (s.mode) {
    case 'idle':
      target = sample(c.pose, c.reduced ? 0 : s.t)
      break
    case 'hitlag':
      target = sample('hurt', 0)
      if (s.timer >= hitlagFrames(s.pendingHit!)) launch(s, c)
      break
    case 'flying':
      target = sample('hurt', s.t)
      s.vx *= 0.995
      s.vy += GRAVITY
      s.x += s.vx
      s.y += s.vy
      s.spin += s.spinV
      if (offPage(s.x, s.y)) {
        ko(s, c)
      } else if (s.y >= GROUND && s.vy > 0) {
        s.y = GROUND
        s.spin = 0
        s.mode = 'landing'
        s.timer = 0
        landed(s, c, Math.abs(s.x - s.launchFrom))
      }
      break
    case 'landing':
      target = sample('crouch', 0)
      if (s.timer > 14) {
        s.mode = Math.abs(s.x - HOME) > 4 ? 'returning' : 'idle'
        s.timer = 0
      }
      break
    case 'returning': {
      const dir = Math.sign(HOME - s.x)
      s.facing = dir < 0 ? -1 : 1
      target = sample('run', s.t * 1.4)
      s.x += dir * 4.5
      if (Math.sign(HOME - s.x) !== dir) {
        s.x = HOME
        s.facing = -1
        s.mode = 'idle'
      }
      break
    }
    case 'ko':
      target = sample('hurt', s.t)
      if (s.timer > (c.reduced ? 30 : 55)) {
        s.timer = 0
        if (s.stocks <= 0) {
          s.mode = 'over'
          break
        }
        s.mode = c.reduced ? 'idle' : 'respawn'
        s.x = HOME
        s.y = c.reduced ? GROUND : -FIGURE
        s.vx = 0
        s.vy = 0
        s.spin = 0
        s.facing = -1
        s.percent = 0
        s.trail = []
        s.ghost = null
      }
      break
    case 'respawn':
      target = sample('jump', 0)
      s.vy += GRAVITY * 0.5
      s.y += s.vy
      if (s.y >= GROUND) {
        s.y = GROUND
        s.mode = 'landing'
        s.timer = 0
      }
      break
    default:
      target = sample('cheer', 0)
  }
  s.shown = mix(s.shown, target, s.mode === 'hitlag' ? 1 : 0.3)
}

// What a frame draws: a copy, so React sees a new value and the simulation can carry on
// changing its own.
const snapshot = (s: Sim): Sim => ({
  ...s,
  attack: s.attack && { ...s.attack },
  pops: s.pops.map((p) => ({ ...p })),
  burst: s.burst && { ...s.burst },
  glitter: s.glitter && { ...s.glitter },
  impact: s.impact && { ...s.impact },
})

const isReady = (s: Sim) =>
  s.attack === null &&
  (s.mode === 'idle' || s.mode === 'returning' || s.mode === 'landing')

export function PracticePage() {
  const [rigIndex, setRigIndex] = useState(0)
  const [poseName, setPoseName] = useState<ClipName>('idle')
  const [showBones, setShowBones] = useState(false)
  const [announce, setAnnounce] = useState('')
  const sim = useRef<Sim>(fresh())
  const [s, setView] = useState<Sim>(fresh)
  const svg = useRef<SVGSVGElement>(null)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const rig = rigs[rigIndex]
  const advance = useRef<() => void>(() => {})

  useEffect(() => {
    const c: Ctx = {
      name: rig.name,
      weight: WEIGHTS[rig.id] ?? 100,
      reduced,
      pose: poseName,
      say: setAnnounce,
    }
    advance.current = () => step(sim.current, c)
  }, [rig, reduced, poseName])

  // A fixed 60 Hz step per frame, like the game, and only while the toy is on screen.
  useEffect(() => {
    const el = svg.current
    if (!el) return
    let raf = 0
    let last = 0
    let acc = 0
    const tick = (now: number) => {
      acc = Math.min(acc + (last ? now - last : 0), 100)
      last = now
      while (acc >= 1000 / 60) {
        advance.current()
        acc -= 1000 / 60
      }
      setView(snapshot(sim.current))
      raf = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf)
      if (entry.isIntersecting) {
        last = 0
        acc = 1000 / 60
        raf = requestAnimationFrame(tick)
      }
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  const ready = isReady(s)

  const attack = (a: Attack) => {
    const live = sim.current
    if (!isReady(live) || live.mode === 'over') return
    live.attack = { a, frame: 0 }
    live.trail = []
    live.ghost = null
  }

  const reset = () => {
    sim.current = fresh()
    setView(snapshot(sim.current))
    setAnnounce(`${rig.name} is back on 0%, with ${STOCKS} lives.`)
  }

  const pick = (i: number) => {
    setRigIndex(i)
    sim.current = fresh()
    setView(snapshot(sim.current))
    setAnnounce(`${rigs[i].name}: the same skeleton and moves, a different drawing.`)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    const a = ATTACKS.find((x) => x.key.toLowerCase() === e.key.toLowerCase())
    if (a) {
      e.preventDefault()
      attack(a)
    }
  }

  const shake =
    s.mode === 'hitlag' && !reduced && s.pendingHit
      ? Math.sin(s.timer * 2.6) * Math.min(6, s.pendingHit.damage * 0.4)
      : 0
  const flip = s.facing
  const centreY = -FIGURE * 0.5

  return (
    // Keys J, K and L attack while focus is anywhere in the toy; every attack is a button too.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="df-toy" onKeyDown={onKey}>
      <div className="df-toy-top">
        <div role="group" aria-label="Pick a fighter" className="df-tabs">
          {rigs.map((r, i) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={i === rigIndex}
              onClick={() => pick(i)}
              className="df-tab"
            >
              {r.name}
              <small>drawn by {r.artist}</small>
            </button>
          ))}
        </div>
        <div className="df-hud" aria-hidden="true">
          <span className="df-hud-name">{rig.name}</span>
          <span className="df-hud-pct" style={{ color: percentColour(s.percent) }}>
            {s.percent}
            <small>%</small>
          </span>
          <span className="df-hud-stocks">
            {Array.from({ length: STOCKS }, (_, i) => (
              <i key={i} className={i < s.stocks ? 'on' : ''} />
            ))}
          </span>
        </div>
      </div>

      <div className="df-stage">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${rig.name}, drawn by ${rig.artist}, on ${s.percent} percent damage with ${s.stocks} lives left.`}
        >
          <path className="df-ground" d={`M6 ${GROUND + 2} L${W - 6} ${GROUND - 1}`} />
          <path
            className="df-ground-hatch"
            d={Array.from(
              { length: 37 },
              (_, i) => `M${16 + i * 16} ${GROUND + 6} l-10 13`,
            ).join(' ')}
          />
          {[1, 2, 3].map((m) => (
            <g
              key={m}
              className="df-tick"
              transform={`translate(${HOME + m * 100} ${GROUND})`}
            >
              <line y1={3} y2={14} />
              <text y={36}>{m} m</text>
            </g>
          ))}
          <text className="df-edge" x={W - 8} y={22} textAnchor="end">
            edge of the page →
          </text>

          {s.trail.length > 1 && (
            <polyline
              className="df-trail"
              points={s.trail
                .map(([x, y]) => `${x.toFixed(1)},${(y + centreY).toFixed(1)}`)
                .join(' ')}
            />
          )}
          {s.ghost && !s.ghost.ko && (
            <path
              className="df-ghost"
              transform={`translate(${s.ghost.x} ${GROUND - 4})`}
              d="M-9 -9 L9 9 M9 -9 L-9 9"
            />
          )}

          {s.mode !== 'ko' && s.mode !== 'over' && (
            <g
              transform={`translate(${s.x + shake} ${s.y}) translate(0 ${centreY}) rotate(${s.spin * -flip}) translate(0 ${-centreY}) scale(${flip} 1)`}
              className={s.mode === 'respawn' ? 'df-blink' : undefined}
            >
              {s.y >= GROUND - 1 && (
                <ellipse className="df-shadow" cx={0} cy={2} rx={FIGURE * 0.26} ry={5} />
              )}
              <Puppet rig={rig} pose={s.shown} height={FIGURE} bones={showBones} />
            </g>
          )}
          {s.mode === 'over' && (
            <g className="df-over">
              <text x={W / 2} y={H / 2 - 24} textAnchor="middle">
                GAME!
              </text>
              <text className="df-over-sub" x={W / 2} y={H / 2 + 18} textAnchor="middle">
                Three times off the page. Start again?
              </text>
            </g>
          )}

          {s.attack && (
            <Attacker attack={s.attack.a} frame={s.attack.frame} x={s.x} y={s.y} />
          )}
          {s.impact && (
            <path
              className="df-impact"
              transform={`translate(${s.impact.x} ${s.impact.y}) scale(${0.7 + s.impact.age * 0.07})`}
              opacity={1 - s.impact.age / 12}
              d="M0 -26 L6 -8 L24 -12 L10 2 L20 20 L2 10 L-8 26 L-8 8 L-26 6 L-10 -4 L-18 -20 L-2 -10 Z"
            />
          )}
          {s.glitter && <Glitter {...s.glitter} />}
          {s.burst && <Burst {...s.burst} />}
          {s.pops.map((p, i) => (
            <text
              key={i}
              className={`df-pop${p.big ? ' big' : ''}`}
              x={p.x}
              y={p.y - p.age * 0.7}
              opacity={1 - p.age / 60}
            >
              {p.text}
            </text>
          ))}
        </svg>
        <p className="df-readout" aria-hidden="true">
          {s.mode === 'ko'
            ? 'KO! Right off the page!'
            : s.mode === 'over'
              ? 'Game!'
              : s.lastFlight !== null
                ? `Flew ${metres(s.lastFlight)} · best ${metres(s.best)}`
                : `Hit ${rig.name} and watch the %`}
        </p>
      </div>

      <div className="df-controls">
        <div role="group" aria-label="Attacks" className="df-attacks">
          {ATTACKS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`df-attack df-attack-${a.id}`}
              onClick={() => attack(a)}
              aria-disabled={!ready || s.mode === 'over'}
              aria-keyshortcuts={a.key}
            >
              <span>{a.label}</span>
              <small>
                +{a.damage}% <kbd>{a.key}</kbd>
              </small>
            </button>
          ))}
        </div>
        <div className="df-extras">
          <div role="group" aria-label="Strike a pose" className="df-poses">
            {(['idle', 'run', 'jump', 'crouch', 'cheer'] as ClipName[]).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={poseName === name}
                onClick={() => setPoseName(name)}
              >
                {name === 'idle' ? 'stand' : name}
              </button>
            ))}
          </div>
          <label className="df-switch">
            <input
              type="checkbox"
              checked={showBones}
              onChange={(e) => setShowBones(e.target.checked)}
            />
            <span>Show the skeleton</span>
          </label>
          {(s.mode === 'over' || s.percent > 0 || s.stocks < STOCKS) && (
            <button type="button" className="df-reset" onClick={reset}>
              Start again
            </button>
          )}
        </div>
      </div>
      <p className="df-sr" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}

const metres = (units: number) => `${(units / 100).toFixed(1)} m`

function Attacker({
  attack,
  frame,
  x,
  y,
}: {
  attack: Attack
  frame: number
  x: number
  y: number
}) {
  const chest = y - FIGURE * 0.55
  if (attack.id === 'glitter') {
    // Lobbed in from the left, landing on the windup frame.
    const k = Math.min(1, frame / attack.windup)
    if (k >= 1) return null
    const bx = 20 + (x - 20) * k
    const by = chest + 60 - Math.sin(k * Math.PI) * 140 - 60 * k
    return (
      <g transform={`translate(${bx} ${by}) rotate(${frame * 18})`}>
        <circle className="df-bomb" r={15} />
        <path className="df-fuse" d="M8 -12 q8 -10 16 -6" />
        <circle className="df-spark" cx={24} cy={-18} r={4 + (frame % 3)} />
      </g>
    )
  }
  if (attack.id === 'poke') {
    const k =
      frame < attack.windup
        ? frame / attack.windup
        : 1 - (frame - attack.windup) / (attack.length - attack.windup)
    return (
      <g transform={`translate(${x - 196 + k * 46} ${chest})`}>
        <Pencil />
      </g>
    )
  }
  // The smash: raised behind, then swung through about the eraser end.
  const w = attack.windup
  let angle: number
  if (frame < w - 4) angle = -40 - (frame / (w - 4)) * 50
  else if (frame < w) angle = -90 + ((frame - (w - 4)) / 4) * 95
  else angle = 5 + Math.min(20, (frame - w) * 3)
  return (
    <g transform={`translate(${x - 190} ${y - 36}) rotate(${angle})`}>
      <Pencil />
      {frame >= w - 3 && frame <= w + 3 && (
        <path className="df-swoosh" d="M 168 -90 A 172 172 0 0 1 172 10" />
      )}
    </g>
  )
}

/** The Giant Pencil item, eraser end at the origin, pointing right. */
function Pencil() {
  return (
    <g className="df-pencil">
      <rect x={0} y={-11} width={22} height={22} rx={5} className="eraser" />
      <rect x={20} y={-12} width={12} height={24} className="ferrule" />
      <rect x={31} y={-12} width={112} height={24} className="body" />
      <path d="M31 -4 H143 M31 4 H143" className="facets" />
      <path d="M143 -12 L176 0 L143 12 Z" className="wood" />
      <path d="M166 -3.6 L176 0 L166 3.6 Z" className="lead" />
    </g>
  )
}

const GLITTER = ['#ff5ea8', '#ffd23f', '#3fc1ff', '#7cf07a', '#b98bff', '#ff8a3d']

function Glitter({ x, y, age }: { x: number; y: number; age: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="df-glitter-ring" r={10 + age * 3.4} opacity={1 - age / 36} />
      {Array.from({ length: 26 }, (_, i) => {
        const a = i * 2.4
        const r = (12 + (i % 5) * 9) * (0.4 + age * 0.09)
        return (
          <path
            key={i}
            d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z"
            fill={GLITTER[i % GLITTER.length]}
            transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r + age * age * 0.03}) rotate(${age * 12 + i * 20}) scale(${1.2 - age / 40})`}
          />
        )
      })}
    </g>
  )
}

// The game's KO burst: red and yellow rays out of a bright ring, where they left the page.
function Burst({ x, y, age }: { x: number; y: number; age: number }) {
  const k = Math.min(1, age / 10)
  const fade = age > 30 ? 1 - (age - 30) / 20 : 1
  return (
    <g transform={`translate(${x} ${y})`} opacity={fade}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + 0.2
        const len = (i % 2 ? 150 : 210) * k
        return (
          <path
            key={i}
            className={i % 2 ? 'df-ray-y' : 'df-ray-r'}
            d={`M${Math.cos(a - 0.05) * 20} ${Math.sin(a - 0.05) * 20} L${Math.cos(a) * len} ${Math.sin(a) * len} L${Math.cos(a + 0.05) * 20} ${Math.sin(a + 0.05) * 20} Z`}
          />
        )
      })}
      <circle className="df-burst-r" r={46 * k} />
      <circle className="df-burst-y" r={30 * k} />
      <circle className="df-burst-w" r={16 * k} />
      <text className="df-ko" y={-62 * k} textAnchor="middle">
        KO!
      </text>
    </g>
  )
}
