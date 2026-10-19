import { useEffect, useRef, useState } from 'react'

// The game's own title screen, "Vigil", rebuilt from its animation layers exactly the way
// TitleScreen.cs stacks them: flames and the figure step together every 0.13 s, the ward pulses
// 0,1,2,1 every 0.95 s, and one pair of eyes in the dark blinks at a time. Every frame is a
// generated PNG; nothing is tinted or faded. Phones get the tall composition, wider screens the
// wide one.

const FLAME_SECONDS = 0.13
const WARD_SECONDS = 0.95
const WARD_WALK = [0, 1, 2, 1]
const BLINK_FRAMES = 6

type Layout = 'wide' | 'tall'
const size: Record<Layout, [number, number]> = { wide: [960, 360], tall: [360, 840] }
const narrowQuery = '(max-width: 639px)'

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
    const base = `/games/wizard-survivors/title/${layout}/`
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
      frames('eyes-far', BLINK_FRAMES),
      frames('eyes-near', BLINK_FRAMES),
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
          eyesFar,
          eyesNear,
          ward,
          flamesFar,
          figure,
          flamesNear,
        ]) => {
          if (!alive) return
          let flame = 0
          let wardStep = 0
          let blink = 0
          let flameClock = 0
          let wardClock = 0
          let blinkClock = 0
          let nextBlink = 0.35 + Math.random() * 1.55
          let last = performance.now()

          const draw = () => {
            ctx.clearRect(0, 0, el.width, el.height)
            ctx.drawImage(backA, 0, 0)
            ctx.drawImage(eyesFar[blink], 0, 0)
            ctx.drawImage(backB, 0, 0)
            ctx.drawImage(eyesNear[blink], 0, 0)
            ctx.drawImage(ward[WARD_WALK[wardStep]], 0, 0)
            ctx.drawImage(flamesFar[flame], 0, 0)
            ctx.drawImage(figure[flame], 0, 0)
            ctx.drawImage(flamesNear[flame], 0, 0)
            ctx.drawImage(fore, 0, 0)
          }
          draw()
          el.dataset.ready = 'true'
          if (reduced) return

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
            blinkClock += dt
            if (blink === 0 && blinkClock >= nextBlink) {
              blink = 1 + Math.floor(Math.random() * (BLINK_FRAMES - 1))
              changed = true
            } else if (blink !== 0 && blinkClock >= nextBlink + 0.11) {
              blink = 0
              blinkClock = 0
              nextBlink = 0.35 + Math.random() * 1.55
              changed = true
            }
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
    <div className={`ws-title ws-title--${layout}`}>
      <canvas
        key={layout}
        ref={canvas}
        width={w}
        height={h}
        role="img"
        aria-label="The Wizard Survivors title screen: an old wizard with a glowing staff stands in a golden summoning circle ringed by candle flames, in a dark forest full of watching eyes."
      />
    </div>
  )
}
