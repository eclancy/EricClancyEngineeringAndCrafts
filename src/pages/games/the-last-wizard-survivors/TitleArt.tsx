import { useEffect, useRef, useState } from 'react'

// The game's own title screen, "Vigil", rebuilt from its animation layers exactly the way
// TitleScreen.cs stacks and runs them: flames and the figure step together every 0.13 s, the ward
// pulses 0,1,2,1 every 0.95 s, and every pair of eyes in the dark blinks on its own clock. Every
// frame is a generated PNG; nothing is tinted or faded. Phones get the tall composition, wider
// screens the wide one.
//
// The layers are the game's own, copied unchanged from assets/bonelight/ui/title (tall) and
// title-wide (wide) as of 1c217ba3, where the title became THE LAST / WIZARD / SURVIVORS. The eyes
// are not a layer: eyes.png holds an 11x4 cell per blink frame (open, half, slit) for each of two
// tones, and eyes.json says where every pair sits (tools/art/title_eyes.py in the game's repo).

const FLAME_SECONDS = 0.13
const WARD_SECONDS = 0.95
const WARD_WALK = [0, 1, 2, 1]

// The blink, as TitleScreen.cs runs it: each pair waits 5-16 s, its lid comes down through two
// frames, stays shut, and goes back up a little slower; now and then it blinks twice. At most two
// pairs are mid-blink at once and no two start within 0.15 s, so the wood never blinks together.
const BLINK_MIN_GAP = 5
const BLINK_MAX_GAP = 16
const BLINK_CLOSE = 0.04 // each of the two frames down
const BLINK_HOLD = 0.09
const BLINK_OPEN = 0.06 // each of the two frames up
const DOUBLE_BLINK_CHANCE = 0.2
const MAX_BLINKING = 2
const BLINK_STAGGER = 0.15
// Columns of eyes.png for each step of a blink: half, slit, shut (no cell), slit, half.
const BLINK_STEPS = [1, 2, -1, 2, 1]

type Layout = 'wide' | 'tall'
const size: Record<Layout, [number, number]> = { wide: [960, 360], tall: [360, 840] }
const narrowQuery = '(max-width: 639px)'

interface EyeSpec {
  cell: [number, number]
  pitch: [number, number]
  rows: string[]
  pairs: { x: number; y: number; depth: string }[]
}

interface Pair {
  x: number
  y: number
  row: number
  step: number // -1: open, waiting to blink; else an index into BLINK_STEPS
  clock: number // seconds left of the wait or of the current step
  again: boolean // the second blink of a double
}

const between = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function TitleArt() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [layout, setLayout] = useState<Layout>(() =>
    typeof window !== 'undefined' && window.matchMedia(narrowQuery).matches
      ? 'tall'
      : 'wide',
  )

  useEffect(() => {
    const mq = window.matchMedia(narrowQuery)
    const onChange = () => setLayout(mq.matches ? 'tall' : 'wide')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    const base = `/games/the-last-wizard-survivors/title/${layout}/`
    const frames = (name: string, n: number) =>
      Promise.all(Array.from({ length: n }, (_, i) => load(`${base}${name}-${i}.png`)))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let alive = true
    let visible = true

    Promise.all([
      load(`${base}back-a.png`),
      load(`${base}back-b.png`),
      load(`${base}fore.png`),
      load(`${base}eyes.png`),
      fetch(`${base}eyes.json`).then((r) =>
        r.ok ? (r.json() as Promise<EyeSpec>) : Promise.reject(),
      ),
      frames('ward', 3),
      frames('flames-far', 4),
      frames('figure', 4),
      frames('flames-near', 4),
    ])
      .then(
        ([
          backA,
          backB,
          fore,
          eyeSheet,
          eyeSpec,
          ward,
          flamesFar,
          figure,
          flamesNear,
        ]) => {
          if (!alive) return
          const [cellW, cellH] = eyeSpec.cell
          const [pitchW, pitchH] = eyeSpec.pitch
          // Staggered from the start, so the first blinks come at different moments.
          const pairs: Pair[] = eyeSpec.pairs.map((p) => ({
            x: p.x,
            y: p.y,
            row: Math.max(0, eyeSpec.rows.indexOf(p.depth)),
            step: -1,
            clock: between(0.5, BLINK_MAX_GAP),
            again: false,
          }))
          let blinking = 0
          let sinceBlinkStarted = 10
          let flame = 0
          let wardStep = 0
          let flameClock = 0
          let wardClock = 0
          let last = performance.now()

          const draw = () => {
            ctx.clearRect(0, 0, el.width, el.height)
            ctx.drawImage(backA, 0, 0)
            ctx.drawImage(backB, 0, 0)
            for (const pair of pairs) {
              const column = pair.step < 0 ? 0 : BLINK_STEPS[pair.step]
              if (column < 0) continue // shut: no cell at all
              ctx.drawImage(
                eyeSheet,
                column * pitchW,
                pair.row * pitchH,
                cellW,
                cellH,
                pair.x,
                pair.y,
                cellW,
                cellH,
              )
            }
            ctx.drawImage(ward[WARD_WALK[wardStep]], 0, 0)
            ctx.drawImage(flamesFar[flame], 0, 0)
            ctx.drawImage(figure[flame], 0, 0)
            ctx.drawImage(flamesNear[flame], 0, 0)
            ctx.drawImage(fore, 0, 0)
          }
          draw()
          el.dataset.ready = 'true'
          if (reduced) return

          // TitleScreen.TickEyes, step for step. Returns whether any cell changed.
          const tickEyes = (dt: number) => {
            let changed = false
            sinceBlinkStarted += dt
            for (const pair of pairs) {
              pair.clock -= dt
              if (pair.clock > 0) continue
              if (pair.step < 0) {
                if (
                  blinking >= MAX_BLINKING ||
                  (!pair.again && sinceBlinkStarted < BLINK_STAGGER)
                ) {
                  pair.clock = between(0.2, 0.7)
                  continue
                }
                pair.step = 0
                blinking++
                sinceBlinkStarted = 0
              } else if (++pair.step >= BLINK_STEPS.length) {
                pair.step = -1
                blinking--
                changed = true
                // Now and then straight into a second blink; otherwise a long wait.
                pair.again = !pair.again && Math.random() < DOUBLE_BLINK_CHANCE
                pair.clock = pair.again
                  ? between(0.12, 0.2)
                  : between(BLINK_MIN_GAP, BLINK_MAX_GAP)
                continue
              }
              changed = true
              const middle = Math.floor(BLINK_STEPS.length / 2)
              pair.clock =
                pair.step < middle
                  ? BLINK_CLOSE
                  : pair.step === middle
                    ? BLINK_HOLD
                    : BLINK_OPEN
            }
            return changed
          }

          const tick = (now: number) => {
            raf = requestAnimationFrame(tick)
            const dt = Math.min(0.1, (now - last) / 1000)
            last = now
            if (!visible) return
            let changed = false
            flameClock += dt
            if (flameClock >= FLAME_SECONDS) {
              flameClock -= FLAME_SECONDS
              flame = (flame + 1) % 4
              changed = true
            }
            wardClock += dt
            if (wardClock >= WARD_SECONDS) {
              wardClock -= WARD_SECONDS
              wardStep = (wardStep + 1) % WARD_WALK.length
              changed = true
            }
            if (tickEyes(dt)) changed = true
            if (changed) draw()
          }
          raf = requestAnimationFrame(tick)
        },
      )
      .catch(() => {})

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(el)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [layout])

  const [w, h] = size[layout]
  return (
    <div className={`tohm-title tohm-title--${layout}`}>
      <canvas
        key={layout}
        ref={canvas}
        width={w}
        height={h}
        role="img"
        aria-label="The title screen of The Last Wizard: Survivors: an old wizard with a glowing staff stands in a golden summoning circle ringed by candle flames, in a dark forest full of watching eyes."
      />
    </div>
  )
}
