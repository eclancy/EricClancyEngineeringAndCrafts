import { useCallback, useEffect, useRef, useState } from 'react'
import { elementColour, iconSrc, spellById } from './spells'

// A thirty-second taste of the game, drawn with its own sprites: you only move, the spells cast
// themselves, the dead drop XP, and every level-up stops the clock to offer three spells.

const W = 480
const H = 320
const RUN_SECONDS = 30
const MAX_LEVEL = 3
const POOL = [
  'chain_lightning',
  'fireball',
  'meteor_swarm',
  'glacial_spike',
  'scorching_ray',
]
const XP_STEPS = [3, 6, 10, 15, 21, 28]
const ART = '/games/wizard-survivors/sprites/'

type Phase = 'ready' | 'playing' | 'levelup' | 'paused' | 'won' | 'lost'
type Kind = 'runner' | 'wolf' | 'wisp' | 'hexer'

interface Foe {
  kind: Kind
  x: number
  y: number
  hp: number
  speed: number
  slow: number
  anim: number
  flip: boolean
  dying: number // < 0 while alive, else seconds into the death animation
}

interface Gem {
  x: number
  y: number
  t: number
}

interface Fx {
  kind: 'bolt' | 'ray' | 'spike' | 'meteor' | 'boom' | 'number'
  x: number
  y: number
  t: number
  life: number
  points?: [number, number][]
  text?: string
  hit?: boolean
}

interface Shot {
  x: number
  y: number
  vx: number
  vy: number
  t: number
}

interface Hud {
  time: number
  hp: number
  kills: number
  level: number
  xp: number
  need: number
  owned: [string, number][]
}

const foeStats: Record<Kind, { hp: number; speed: number }> = {
  runner: { hp: 5, speed: 32 },
  wolf: { hp: 4, speed: 46 },
  wisp: { hp: 4, speed: 28 },
  hexer: { hp: 8, speed: 21 },
}

interface Sheets {
  walk: HTMLImageElement
  idle: HTMLImageElement
  foes: Record<Kind, { move: HTMLImageElement; death: HTMLImageElement }>
  bolt: HTMLImageElement
  spike: HTMLImageElement
  fireball: HTMLImageElement
  impact: HTMLImageElement
  gem: HTMLImageElement
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function loadSheets(): Promise<Sheets> {
  const kinds: Kind[] = ['runner', 'wolf', 'wisp', 'hexer']
  const [walk, idle, bolt, spike, fireball, impact, gem, ...foeImgs] = await Promise.all([
    loadImage(`${ART}stormcaller-moving.png`),
    loadImage(`${ART}stormcaller-idle.png`),
    loadImage(`${ART}chain-lightning.png`),
    loadImage(`${ART}glacial-spike.png`),
    loadImage(`${ART}fireball.png`),
    loadImage(`${ART}meteor-impact.png`),
    loadImage(`${ART}xp-small.png`),
    ...kinds.flatMap((k) => [
      loadImage(`${ART}${k}-moving.png`),
      loadImage(`${ART}${k}-death.png`),
    ]),
  ])
  const foes = {} as Sheets['foes']
  kinds.forEach((k, i) => (foes[k] = { move: foeImgs[i * 2], death: foeImgs[i * 2 + 1] }))
  return { walk, idle, foes, bolt, spike, fireball, impact, gem }
}

// The ground: deep lichen stone, dithered, with moss tufts and the dim gold ring the wizard
// starts in. Drawn once.
function paintGround(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  g.fillStyle = '#1E3640'
  g.fillRect(0, 0, W, H)
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const specks = ['#24404A', '#1E3640', '#0B0F18', '#2A4E58']
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = specks[Math.floor(rnd() * specks.length)]
    g.fillRect(Math.floor(rnd() * W), Math.floor(rnd() * H), 1, 1)
  }
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rnd() * W)
    const y = Math.floor(rnd() * H)
    for (let b = 0; b < 5; b++) {
      const bx = x + b * 2 - 4
      const h = 2 + Math.floor(rnd() * 4)
      g.fillStyle = b % 2 ? '#3A6470' : '#5A8A94'
      g.fillRect(bx, y - h, 1, h)
    }
    g.fillStyle = '#05070C'
    g.fillRect(x - 5, y, 10, 1)
  }
  // The ring, pixel by pixel.
  const cx = W / 2
  const cy = H / 2 + 6
  for (const [r, colour] of [
    [46, '#543F10'],
    [44, '#8A6A1E'],
    [34, '#543F10'],
  ] as [number, string][]) {
    g.fillStyle = colour
    for (let a = 0; a < Math.PI * 2; a += 0.012) {
      g.fillRect(
        Math.round(cx + Math.cos(a) * r),
        Math.round(cy + Math.sin(a) * r * 0.5),
        1,
        1,
      )
    }
  }
  g.fillStyle = '#D8B04A'
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3
    g.fillRect(
      Math.round(cx + Math.cos(a) * 39),
      Math.round(cy + Math.sin(a) * 19.5),
      2,
      1,
    )
  }
  // Moonlit falloff toward the edges.
  const v = g.createRadialGradient(cx, cy, 80, cx, cy, 300)
  v.addColorStop(0, 'rgba(5,7,12,0)')
  v.addColorStop(1, 'rgba(5,7,12,0.45)')
  g.fillStyle = v
  g.fillRect(0, 0, W, H)
  return c
}

const dist2 = (ax: number, ay: number, bx: number, by: number) =>
  (ax - bx) ** 2 + (ay - by) ** 2

function newGame() {
  return {
    t: 0,
    x: W / 2,
    y: H / 2,
    hp: 5,
    hurt: 0,
    walk: 0,
    flip: false,
    moving: false,
    kills: 0,
    level: 1,
    xp: 0,
    spawn: 0.4,
    foes: [] as Foe[],
    gems: [] as Gem[],
    fx: [] as Fx[],
    shots: [] as Shot[],
    owned: new Map<string, number>([['chain_lightning', 1]]),
    cooldown: new Map<string, number>([['chain_lightning', 0.6]]),
  }
}
type Game = ReturnType<typeof newGame>

function pickOffers(game: Game): string[] {
  const open = POOL.filter((id) => (game.owned.get(id) ?? 0) < MAX_LEVEL)
  for (let i = open.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[open[i], open[j]] = [open[j], open[i]]
  }
  return open.slice(0, 3)
}

const blurb: Record<string, string> = {
  chain_lightning: 'A heavy bolt that leaps from foe to foe.',
  fireball: 'A slow, heavy ball of fire that bursts on impact.',
  meteor_swarm: 'Marks the ground, then drops meteors on the marks.',
  glacial_spike: 'Ice erupts beneath the nearest foe and slows it.',
  scorching_ray: 'Fires a ray at each of the nearest foes at once.',
}

function readBest() {
  try {
    return Number(localStorage.getItem('ws-demo-best') ?? 0) || 0
  } catch {
    return 0
  }
}

export function SurviveDemo() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const game = useRef<Game>(newGame())
  const phaseRef = useRef<Phase>('ready')
  const keys = useRef(new Set<string>())
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const [phase, setPhaseState] = useState<Phase>('ready')
  const [offers, setOffers] = useState<{ id: string; owned: number }[]>([])
  const [best, setBest] = useState(readBest)
  const [hud, setHud] = useState<Hud>({
    time: 0,
    hp: 5,
    kills: 0,
    level: 1,
    xp: 0,
    need: XP_STEPS[0],
    owned: [['chain_lightning', 1]],
  })
  const firstCard = useRef<HTMLButtonElement>(null)
  const startButton = useRef<HTMLButtonElement>(null)

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }, [])

  const start = useCallback(() => {
    game.current = newGame()
    keys.current.clear()
    pointer.current = null
    setPhase('playing')
    canvas.current?.focus({ preventScroll: true })
  }, [setPhase])

  const choose = useCallback(
    (id: string) => {
      const g = game.current
      g.owned.set(id, (g.owned.get(id) ?? 0) + 1)
      if (!g.cooldown.has(id)) g.cooldown.set(id, 0.3)
      g.hurt = Math.max(g.hurt, 0.6)
      setPhase('playing')
      canvas.current?.focus({ preventScroll: true })
    },
    [setPhase],
  )

  useEffect(() => {
    if (phase === 'levelup') firstCard.current?.focus({ preventScroll: true })
  }, [phase, offers])

  // Keys: only claimed while a run is actually being played.
  useEffect(() => {
    const movement = [
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      'w',
      'a',
      's',
      'd',
    ]
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      const p = phaseRef.current
      if (p === 'playing') {
        if (movement.includes(k)) {
          keys.current.add(k)
          e.preventDefault()
        } else if (k === 'escape' || k === 'p') {
          setPhase('paused')
          e.preventDefault()
        }
      } else if (p === 'paused' && (k === 'escape' || k === 'p')) {
        setPhase('playing')
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase())
    const blur = () => {
      keys.current.clear()
      if (phaseRef.current === 'playing') setPhase('paused')
    }
    const hidden = () => document.hidden && blur()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [setPhase])

  // Pause the moment it scrolls out of view.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && phaseRef.current === 'playing') setPhase('paused')
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [setPhase])

  // The loop.
  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    ctx.imageSmoothingEnabled = false
    const ground = paintGround()
    let sheets: Sheets | null = null
    let raf = 0
    let last = performance.now()
    let hudClock = 0
    let alive = true
    loadSheets()
      .then((s) => {
        if (alive) sheets = s
      })
      .catch(() => {})

    const frame = (
      img: HTMLImageElement,
      size: number,
      index: number,
      x: number,
      y: number,
      flip = false,
      scale = 1,
    ) => {
      const count = Math.max(1, Math.round(img.width / size))
      const i = Math.min(count - 1, Math.max(0, Math.floor(index)))
      const s = size * scale
      ctx.save()
      ctx.translate(Math.round(x), Math.round(y))
      if (flip) ctx.scale(-1, 1)
      ctx.drawImage(img, i * size, 0, size, size, -s / 2, -s / 2, s, s)
      ctx.restore()
    }

    const living = (g: Game) => g.foes.filter((f) => f.dying < 0)
    const nearest = (g: Game, n: number, range: number) =>
      living(g)
        .map((f) => ({ f, d: dist2(f.x, f.y, g.x, g.y) }))
        .filter((o) => o.d < range * range)
        .sort((a, b) => a.d - b.d)
        .slice(0, n)
        .map((o) => o.f)

    const hit = (g: Game, f: Foe, dmg: number) => {
      if (f.dying >= 0) return
      f.hp -= dmg
      g.fx.push({
        kind: 'number',
        x: f.x,
        y: f.y - 14,
        t: 0,
        life: 0.6,
        text: String(dmg),
      })
      if (f.hp <= 0) {
        f.dying = 0
        g.kills++
        g.gems.push({ x: f.x, y: f.y, t: Math.random() })
      }
    }

    const cast = (g: Game, id: string, level: number) => {
      if (id === 'chain_lightning') {
        const first = nearest(g, 1, 190)[0]
        if (!first) return false
        const chain: Foe[] = [first]
        for (let j = 0; j < 1 + level; j++) {
          const from = chain[chain.length - 1]
          const next = living(g)
            .filter(
              (f) => !chain.includes(f) && dist2(f.x, f.y, from.x, from.y) < 90 * 90,
            )
            .sort(
              (a, b) => dist2(a.x, a.y, from.x, from.y) - dist2(b.x, b.y, from.x, from.y),
            )[0]
          if (!next) break
          chain.push(next)
        }
        const points: [number, number][] = [[g.x + 10, g.y - 22]]
        for (const f of chain) {
          points.push([f.x, f.y - 4])
          g.fx.push({ kind: 'bolt', x: f.x, y: f.y - 20, t: 0, life: 0.3 })
          hit(g, f, 3 + level)
        }
        g.fx.push({ kind: 'ray', x: 0, y: 0, t: 0, life: 0.18, points })
        return true
      }
      if (id === 'scorching_ray') {
        const targets = nearest(g, 2 + level, 210)
        if (!targets.length) return false
        for (const f of targets) {
          g.fx.push({
            kind: 'ray',
            x: 1,
            y: 0,
            t: 0,
            life: 0.22,
            points: [
              [g.x, g.y - 14],
              [f.x, f.y - 4],
            ],
          })
          hit(g, f, 3)
        }
        return true
      }
      if (id === 'fireball') {
        const f = nearest(g, 1, 230)[0]
        if (!f) return false
        const a = Math.atan2(f.y - g.y, f.x - g.x)
        g.shots.push({
          x: g.x,
          y: g.y - 12,
          vx: Math.cos(a) * 150,
          vy: Math.sin(a) * 150,
          t: 0,
        })
        return true
      }
      if (id === 'glacial_spike') {
        const targets = nearest(g, level, 220)
        if (!targets.length) return false
        for (const f of targets)
          g.fx.push({ kind: 'spike', x: f.x, y: f.y, t: 0, life: 0.9, hit: false })
        return true
      }
      if (id === 'meteor_swarm') {
        const foes = living(g)
        for (let i = 0; i < 2 + level; i++) {
          const f = foes[Math.floor(Math.random() * foes.length)]
          const x = f
            ? f.x + (Math.random() - 0.5) * 30
            : g.x + (Math.random() - 0.5) * 200
          const y = f
            ? f.y + (Math.random() - 0.5) * 20
            : g.y + (Math.random() - 0.5) * 140
          g.fx.push({ kind: 'meteor', x, y, t: -i * 0.12, life: 1.05, hit: false })
        }
        return true
      }
      return false
    }

    const cooldowns: Record<string, number[]> = {
      chain_lightning: [1.5, 1.2, 0.95],
      scorching_ray: [1.8, 1.45, 1.15],
      fireball: [1.4, 1.05, 0.8],
      glacial_spike: [1.9, 1.5, 1.2],
      meteor_swarm: [2.8, 2.3, 1.9],
    }

    const update = (g: Game, dt: number) => {
      g.t += dt
      // Moving: keys, or toward a held finger or mouse.
      let mx = 0
      let my = 0
      const k = keys.current
      if (k.has('arrowleft') || k.has('a')) mx -= 1
      if (k.has('arrowright') || k.has('d')) mx += 1
      if (k.has('arrowup') || k.has('w')) my -= 1
      if (k.has('arrowdown') || k.has('s')) my += 1
      const p = pointer.current
      if (p && !mx && !my) {
        const dx = p.x - g.x
        const dy = p.y - (g.y - 10)
        if (dx * dx + dy * dy > 36) {
          mx = dx
          my = dy
        }
      }
      const len = Math.hypot(mx, my)
      g.moving = len > 0
      if (len) {
        g.x = Math.min(W - 14, Math.max(14, g.x + (mx / len) * 82 * dt))
        g.y = Math.min(H - 6, Math.max(30, g.y + (my / len) * 82 * dt))
        // The Stormcaller's sheets face left (the game special-cases her in
        // CharacterVisuals.SpriteFacesLeft), so she is mirrored when walking right.
        if (Math.abs(mx) > 0.1) g.flip = mx > 0
        g.walk += dt * 10
      }
      g.hurt = Math.max(0, g.hurt - dt)

      // Spawning, faster as the half-minute runs down.
      const pace = g.t / RUN_SECONDS
      g.spawn -= dt
      if (g.spawn <= 0 && living(g).length < 22) {
        g.spawn = 0.75 - pace * 0.45
        const roll = Math.random()
        const kind: Kind =
          pace > 0.45 && roll < 0.18
            ? 'hexer'
            : roll < 0.45
              ? 'runner'
              : roll < 0.72
                ? 'wolf'
                : 'wisp'
        const side = Math.floor(Math.random() * 4)
        const along = Math.random()
        const x = side === 0 ? -16 : side === 1 ? W + 16 : along * W
        const y = side === 2 ? 4 : side === 3 ? H + 20 : 30 + along * (H - 30)
        const s = foeStats[kind]
        g.foes.push({
          kind,
          x,
          y,
          hp: s.hp + Math.floor(pace * 3),
          speed: s.speed * (1 + pace * 0.45),
          slow: 0,
          anim: Math.random() * 8,
          flip: false,
          dying: -1,
        })
      }

      // Foes walk at the wizard and shove each other apart.
      for (const f of g.foes) {
        if (f.dying >= 0) {
          f.dying += dt
          continue
        }
        const dx = g.x - f.x
        const dy = g.y - 8 - f.y
        const d = Math.hypot(dx, dy) || 1
        const speed = f.speed * (f.slow > 0 ? 0.45 : 1)
        f.slow = Math.max(0, f.slow - dt)
        const wobble = f.kind === 'wisp' ? Math.sin(g.t * 3 + f.anim) * 0.6 : 0
        f.x += (dx / d - (dy / d) * wobble) * speed * dt
        f.y += (dy / d + (dx / d) * wobble) * speed * dt
        f.flip = dx < 0
        f.anim += dt * 9
        for (const o of g.foes) {
          if (o === f || o.dying >= 0) continue
          const ox = f.x - o.x
          const oy = f.y - o.y
          const od = ox * ox + oy * oy
          if (od < 196 && od > 0.01) {
            const push = (14 - Math.sqrt(od)) * 0.5
            const n = Math.sqrt(od)
            f.x += (ox / n) * push
            f.y += (oy / n) * push
          }
        }
        if (d < 14 && g.hurt <= 0) {
          g.hp -= 1
          g.hurt = 1.1
          if (g.hp <= 0) {
            setPhase('lost')
            return
          }
        }
      }
      g.foes = g.foes.filter((f) => f.dying < 0.5)

      // Spells cast themselves.
      for (const [id, level] of g.owned) {
        const cd = (g.cooldown.get(id) ?? 0) - dt
        if (cd <= 0) {
          const cast_ = cast(g, id, level)
          g.cooldown.set(id, cast_ ? cooldowns[id][level - 1] : 0.15)
        } else g.cooldown.set(id, cd)
      }

      // Fireballs in flight.
      for (const s of g.shots) {
        s.t += dt
        s.x += s.vx * dt
        s.y += s.vy * dt
        const target = living(g).find((f) => dist2(f.x, f.y, s.x, s.y) < 13 * 13)
        if (target || s.t > 1.6) {
          s.t = 99
          g.fx.push({ kind: 'boom', x: s.x, y: s.y, t: 0, life: 0.3 })
          const level = g.owned.get('fireball') ?? 1
          for (const f of living(g))
            if (dist2(f.x, f.y, s.x, s.y) < 30 * 30) hit(g, f, 3 + level)
        }
      }
      g.shots = g.shots.filter((s) => s.t < 99)

      // Delayed effects: spikes rise and hit, meteors land.
      for (const e of g.fx) {
        e.t += dt
        if (e.kind === 'spike' && !e.hit && e.t > 0.2) {
          e.hit = true
          const level = g.owned.get('glacial_spike') ?? 1
          for (const f of living(g))
            if (dist2(f.x, f.y, e.x, e.y) < 22 * 22) {
              hit(g, f, 4 + level)
              f.slow = 1.6
            }
        }
        if (e.kind === 'meteor' && !e.hit && e.t > 0.7) {
          e.hit = true
          const level = g.owned.get('meteor_swarm') ?? 1
          for (const f of living(g))
            if (dist2(f.x, f.y, e.x, e.y) < 28 * 28) hit(g, f, 4 + level)
        }
      }
      g.fx = g.fx.filter((e) => e.t < e.life)

      // XP drifts to the wizard once close.
      for (const gem of g.gems) {
        gem.t += dt
        const d = Math.sqrt(dist2(gem.x, gem.y, g.x, g.y - 8))
        if (d < 76) {
          gem.x += ((g.x - gem.x) / d) * 170 * dt
          gem.y += ((g.y - 8 - gem.y) / d) * 170 * dt
        }
        if (d < 10) {
          gem.t = -99
          g.xp++
        }
      }
      g.gems = g.gems.filter((gem) => gem.t >= 0)

      const need = XP_STEPS[Math.min(XP_STEPS.length - 1, g.level - 1)]
      if (g.xp >= need) {
        g.xp -= need
        g.level++
        const next = pickOffers(g)
        if (next.length) {
          keys.current.clear()
          setOffers(next.map((id) => ({ id, owned: g.owned.get(id) ?? 0 })))
          setPhase('levelup')
          return
        }
      }
      if (g.t >= RUN_SECONDS) {
        setBest((b) => {
          const v = Math.max(b, g.kills)
          try {
            localStorage.setItem('ws-demo-best', String(v))
          } catch {
            // Private windows refuse storage; the best score just isn't kept.
          }
          return v
        })
        setPhase('won')
      }
    }

    const fireRamp = ['#B8381A', '#E87A1A', '#FFC848', '#FFF4D0']
    const boltRamp = ['#E0B02A', '#FFF06A', '#FFFFF0']

    const draw = (g: Game) => {
      ctx.drawImage(ground, 0, 0)
      if (!sheets) return
      const s = sheets
      // Telegraphs under everything.
      for (const e of g.fx) {
        if (e.kind === 'meteor' && e.t > 0 && e.t < 0.7) {
          ctx.fillStyle = Math.floor(e.t * 12) % 2 ? '#D8242E' : '#8A1220'
          for (let a = 0; a < Math.PI * 2; a += 0.09)
            ctx.fillRect(
              Math.round(e.x + Math.cos(a) * 24),
              Math.round(e.y + Math.sin(a) * 12),
              2,
              1,
            )
        }
      }
      for (const gem of g.gems) frame(s.gem, 16, (gem.t * 8) % 4, gem.x, gem.y)
      // Contact shadows, then everyone, back to front.
      ctx.fillStyle = 'rgba(5,7,12,0.55)'
      for (const f of g.foes)
        if (f.dying < 0) ctx.fillRect(Math.round(f.x - 7), Math.round(f.y + 5), 14, 3)
      ctx.fillRect(Math.round(g.x - 9), Math.round(g.y + 2), 18, 3)
      const bodies: { y: number; draw: () => void }[] = []
      for (const f of g.foes) {
        const sheet = s.foes[f.kind]
        bodies.push({
          y: f.y,
          draw: () =>
            f.dying >= 0
              ? frame(sheet.death, 32, f.dying * 12, f.x, f.y - 8, f.flip)
              : frame(sheet.move, 32, f.anim % 8, f.x, f.y - 8, f.flip),
        })
      }
      bodies.push({
        y: g.y,
        draw: () => {
          if (g.hurt > 0 && Math.floor(g.hurt * 14) % 2) return
          if (g.moving) frame(s.walk, 48, g.walk % 8, g.x, g.y - 20, g.flip)
          else frame(s.idle, 48, (g.t * 6) % 4, g.x, g.y - 20, g.flip)
        },
      })
      for (const e of g.fx)
        if (e.kind === 'spike') {
          const rise = Math.min(7, (e.t / 0.3) * 7)
          const idx = e.t > 0.6 ? Math.max(0, 7 - ((e.t - 0.6) / 0.3) * 7) : rise
          bodies.push({ y: e.y + 1, draw: () => frame(s.spike, 64, idx, e.x, e.y - 26) })
        }
      bodies.sort((a, b) => a.y - b.y).forEach((b) => b.draw())

      for (const sh of g.shots) {
        ctx.save()
        ctx.translate(Math.round(sh.x), Math.round(sh.y))
        ctx.rotate(Math.atan2(sh.vy, sh.vx))
        ctx.drawImage(
          s.fireball,
          Math.floor((sh.t * 12) % 4) * 64,
          0,
          64,
          64,
          -40,
          -16,
          48,
          32,
        )
        ctx.restore()
      }
      for (const e of g.fx) {
        if (e.kind === 'meteor') {
          if (e.t > 0.25 && e.t < 0.7) {
            const k = (e.t - 0.25) / 0.45
            const mx = e.x - 60 * (1 - k)
            const my = e.y - 140 * (1 - k)
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = fireRamp[3 - i]
              ctx.fillRect(
                Math.round(mx - i * 3),
                Math.round(my - i * 7),
                4 - (i >> 1),
                4 - (i >> 1),
              )
            }
          } else if (e.t >= 0.7) frame(s.impact, 64, 0, e.x, e.y - 6, false, 0.9)
        }
        if (e.kind === 'boom') frame(s.impact, 64, 0, e.x, e.y, false, 0.7)
        if (e.kind === 'bolt') frame(s.bolt, 64, (e.t / e.life) * 6, e.x, e.y)
        if (e.kind === 'ray' && e.points) {
          const ramp = e.x === 1 ? fireRamp.slice(1) : boltRamp
          ramp.forEach((colour, i) => {
            ctx.strokeStyle = colour
            ctx.lineWidth = e.x === 1 ? 4 - i : 3 - i
            ctx.beginPath()
            e.points!.forEach(([px, py], j) => {
              const jx = e.x === 1 || j === 0 ? 0 : (Math.random() - 0.5) * 3
              if (j === 0) ctx.moveTo(px, py)
              else {
                if (e.x !== 1) {
                  const [ax, ay] = e.points![j - 1]
                  ctx.lineTo(
                    (ax + px) / 2 + (Math.random() - 0.5) * 10,
                    (ay + py) / 2 + jx,
                  )
                }
                ctx.lineTo(px, py)
              }
            })
            ctx.stroke()
          })
        }
        if (e.kind === 'number' && e.text) {
          ctx.font = '700 10px "Pixelify Sans", monospace'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#05070C'
          ctx.fillText(e.text, Math.round(e.x) + 1, Math.round(e.y - e.t * 18) + 1)
          ctx.fillStyle = '#FFF0C0'
          ctx.fillText(e.text, Math.round(e.x), Math.round(e.y - e.t * 18))
        }
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const g = game.current
      if (phaseRef.current === 'playing') update(g, dt)
      draw(g)
      hudClock -= dt
      if (hudClock <= 0) {
        hudClock = 0.1
        setHud((h) => {
          const need = XP_STEPS[Math.min(XP_STEPS.length - 1, g.level - 1)]
          const owned = [...g.owned.entries()]
          const same =
            h.time === Math.floor(g.t) &&
            h.hp === g.hp &&
            h.kills === g.kills &&
            h.level === g.level &&
            h.xp === g.xp &&
            h.owned.length === owned.length &&
            h.owned.every(([id, l], i) => owned[i][0] === id && owned[i][1] === l)
          return same
            ? h
            : {
                time: Math.floor(g.t),
                hp: g.hp,
                kills: g.kills,
                level: g.level,
                xp: g.xp,
                need,
                owned,
              }
        })
      }
    }
    raf = requestAnimationFrame(loop)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [setPhase])

  const toWorld = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    }
  }

  const left = RUN_SECONDS - hud.time
  const playingish = phase === 'playing' || phase === 'levelup' || phase === 'paused'

  return (
    <div ref={wrap} className="ws-demo">
      <div className="ws-demo__hud" aria-hidden={!playingish}>
        <div className="ws-demo__hearts" aria-label={`${hud.hp} of 5 health`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < hud.hp ? 'is-full' : ''} />
          ))}
        </div>
        <div className="ws-demo__clock" aria-label={`${left} seconds left`}>
          0:{String(Math.max(0, left)).padStart(2, '0')}
        </div>
        <div className="ws-demo__kills">
          {hud.kills} <span>slain</span>
        </div>
        <div className="ws-demo__xp" aria-label={`Level ${hud.level}`}>
          <span className="ws-demo__lvl">Lv {hud.level}</span>
          <span className="ws-demo__bar">
            <span style={{ width: `${Math.min(100, (hud.xp / hud.need) * 100)}%` }} />
          </span>
        </div>
        <ul className="ws-demo__owned" aria-label="Your spells">
          {hud.owned.map(([id, level]) => (
            <li key={id} title={`${spellById(id).name}, level ${level}`}>
              <img
                src={iconSrc(id)}
                alt={`${spellById(id).name}, level ${level}`}
                width={32}
                height={32}
              />
              <span>{level}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="ws-demo__stage">
        <canvas
          ref={canvas}
          width={W}
          height={H}
          tabIndex={phase === 'playing' ? 0 : -1}
          className={phase === 'playing' ? 'is-live' : ''}
          aria-label="Survive thirty seconds: a small playable version of Wizard Survivors. Move with WASD or the arrow keys, or hold and drag on the field."
          onPointerDown={(e) => {
            if (phaseRef.current !== 'playing') return
            e.currentTarget.setPointerCapture(e.pointerId)
            pointer.current = toWorld(e)
          }}
          onPointerMove={(e) => {
            if (pointer.current) pointer.current = toWorld(e)
          }}
          onPointerUp={() => (pointer.current = null)}
          onPointerCancel={() => (pointer.current = null)}
        />

        {phase === 'ready' && (
          <div className="ws-demo__veil">
            <p className="ws-demo__eyebrow">A thirty-second vigil</p>
            <h3 className="ws-demo__title">Survive the night</h3>
            <p className="ws-demo__how">
              <span className="ws-kbd">WASD</span> or <span className="ws-kbd">←↑↓→</span>{' '}
              to move — on a phone, hold and drag. Your spells cast themselves.
            </p>
            <button
              ref={startButton}
              type="button"
              className="ws-btn ws-btn--gold"
              onClick={start}
            >
              Begin
            </button>
          </div>
        )}

        {phase === 'paused' && (
          <div className="ws-demo__veil">
            <h3 className="ws-demo__title">Paused</h3>
            <button
              type="button"
              className="ws-btn ws-btn--gold"
              onClick={() => setPhase('playing')}
            >
              Resume
            </button>
          </div>
        )}

        {(phase === 'won' || phase === 'lost') && (
          <div className="ws-demo__veil" role="status">
            <p className="ws-demo__eyebrow">
              {phase === 'won' ? 'Dawn breaks' : 'The vigil ends'}
            </p>
            <h3 className="ws-demo__title">
              {phase === 'won'
                ? 'You survived!'
                : RUN_SECONDS - hud.time <= 5
                  ? `So close: ${RUN_SECONDS - hud.time}s to dawn`
                  : `You lasted ${hud.time} seconds`}
            </h3>
            <p className="ws-demo__how">
              {hud.kills} slain · level {hud.level}
              {best > 0 && phase === 'won' ? ` · best ${best}` : ''}
            </p>
            <p className="ws-demo__how ws-demo__how--small">
              The real thing runs fifteen minutes, with thirty spells and a boss at the
              end.
            </p>
            <button type="button" className="ws-btn ws-btn--gold" onClick={start}>
              Again
            </button>
          </div>
        )}

        {phase === 'levelup' && (
          <div
            className="ws-levelup"
            role="dialog"
            aria-modal="false"
            aria-labelledby="ws-levelup-title"
          >
            <h3 id="ws-levelup-title" className="ws-levelup__title">
              Level up! Choose a spell
            </h3>
            <div className="ws-levelup__cards">
              {offers.map(({ id, owned }, i) => {
                const spell = spellById(id)
                return (
                  <button
                    key={id}
                    ref={i === 0 ? firstCard : undefined}
                    type="button"
                    className="ws-card"
                    onClick={() => choose(id)}
                  >
                    <img
                      src={iconSrc(id)}
                      alt=""
                      width={64}
                      height={64}
                      className="ws-card__icon"
                    />
                    <span className="ws-card__name">{spell.name}</span>
                    <span className="ws-card__level">
                      {owned ? `Level ${owned + 1}` : 'New spell'}
                    </span>
                    <span className="ws-card__text">{blurb[id]}</span>
                    <span className="ws-card__tags">
                      {spell.elements.map((el) => (
                        <span key={el} style={{ background: elementColour[el] }}>
                          {el}
                        </span>
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {playingish && (
        <div className="ws-demo__controls">
          {phase === 'playing' ? (
            <button
              type="button"
              className="ws-btn ws-btn--stone ws-btn--small"
              onClick={() => setPhase('paused')}
            >
              Pause <span className="ws-kbd">Esc</span>
            </button>
          ) : (
            <span className="ws-demo__hint">
              {phase === 'levelup' ? 'The clock waits while you choose.' : 'Paused.'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
