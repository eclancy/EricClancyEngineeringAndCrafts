import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Heart } from './Doodles'

interface FloatingHeart {
  id: number
  x: number
  y: number
  dx: number
  size: number
  color: string
}

const HEART_COLORS = ['var(--dp-pink)', '#ff9db8', 'var(--dp-orange)', '#ff6f91']
const HAPPY_WORDS = ['Purrr...', 'More please!', 'Hee hee!', 'That spot!', 'Mmm, yes!']

// The DrawPets mascot, waiting in its meadow to be petted - the way pets are in the game: rub
// it (move the mouse over it, or stroke it sideways with a finger) and hearts float up and it
// wiggles; tap or click it, or press Enter, for a boop.
export function PetMe() {
  const [hearts, setHearts] = useState<FloatingHeart[]>([])
  const [mood, setMood] = useState<'idle' | 'happy' | 'boop'>('idle')
  const [pets, setPets] = useState(0)
  const nextId = useRef(0)
  const button = useRef<HTMLButtonElement>(null)
  const rub = useRef<{ distance: number; last: { x: number; y: number } | null }>({
    distance: 0,
    last: null,
  })
  const moodTimer = useRef<number | undefined>(undefined)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => {
      window.clearTimeout(moodTimer.current)
      pending.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  const spawn = (x: number, y: number, count = 1) => {
    const fresh: FloatingHeart[] = []
    for (let i = 0; i < count; i++) {
      fresh.push({
        id: nextId.current++,
        x: x + (count > 1 ? (Math.random() - 0.5) * 70 : 0),
        y: y + (count > 1 ? (Math.random() - 0.5) * 30 : 0),
        dx: (Math.random() - 0.5) * 60,
        size: 22 + Math.random() * 16,
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      })
    }
    setHearts((h) => [...h.slice(-18), ...fresh])
    const ids = new Set(fresh.map((f) => f.id))
    timers.current.push(
      window.setTimeout(() => setHearts((h) => h.filter((f) => !ids.has(f.id))), 1400),
    )
  }

  const feel = (next: 'happy' | 'boop') => {
    setMood(next)
    window.clearTimeout(moodTimer.current)
    moodTimer.current = window.setTimeout(
      () => setMood('idle'),
      next === 'boop' ? 700 : 1100,
    )
  }

  const where = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // Every so much rubbing earns a heart. A mouse rubs by hovering; a finger or pen by
  // stroking while it touches (sideways - up and down still scrolls the page).
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' && e.buttons === 0) return
    const p = where(e)
    const last = rub.current.last
    rub.current.last = p
    if (!last) return
    rub.current.distance += Math.hypot(p.x - last.x, p.y - last.y)
    if (rub.current.distance > 110) {
      rub.current.distance = 0
      spawn(p.x, p.y)
      setPets((n) => n + 1)
      feel('happy')
    }
  }

  const boop = () => {
    const el = button.current
    const w = el?.clientWidth ?? 240
    const h = el?.clientHeight ?? 240
    spawn(w / 2, h * 0.35, 5)
    setPets((n) => n + 1)
    feel('boop')
  }

  const said = mood === 'boop' ? 'Boop!' : HAPPY_WORDS[pets % HAPPY_WORDS.length]

  return (
    <div className="dp-petme">
      {mood !== 'idle' && (
        <p className="dp-petme-bubble" aria-hidden="true" key={said}>
          {said}
        </p>
      )}
      <button
        ref={button}
        type="button"
        className={`dp-petme-button is-${mood}`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => (rub.current.last = null)}
        onPointerUp={() => (rub.current.last = null)}
        onClick={boop}
        aria-label="Pet the DrawPets kitten"
      >
        <img
          src="/games/drawpets/art/mascot.webp"
          alt=""
          width={480}
          height={480}
          className="dp-petme-img"
          draggable={false}
        />
        {hearts.map((h) => (
          <span
            key={h.id}
            className="dp-float-heart"
            style={
              {
                left: h.x,
                top: h.y,
                width: h.size,
                height: h.size,
                '--dx': `${h.dx}px`,
              } as CSSProperties
            }
          >
            <Heart color={h.color} />
          </span>
        ))}
      </button>
      <p className="dp-petme-count" aria-live="polite">
        {pets === 0 ? (
          <>Rub the kitten, or give it a tap</>
        ) : (
          <>
            <Heart className="dp-petme-count-heart" /> {pets}{' '}
            {pets === 1 ? 'pet' : 'pets'} given
          </>
        )}
      </p>
    </div>
  )
}
