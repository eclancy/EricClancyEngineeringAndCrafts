import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { LoopVideo } from '../../../components/LoopVideo'
import { Glyph } from './Glyph'
import { clipPath, slots, wizards, type Effect, type Spell } from './wizards'

interface Cast {
  id: number
  effect: Effect
  wizard: string
  pop: string
  /** Where the pop floats up: the caster, the wall, or the practice dummy. */
  at: 'caster' | 'wall' | 'dummy'
}

// When each spell reaches the dummy, in seconds, so it flinches on the hit.
const HIT_DELAY: Partial<Record<Effect, number>> = {
  bolt: 0.42,
  'flame-ring': 0.3,
  flamethrower: 0.35,
  meteor: 0.62,
  'ice-patch': 0.25,
  'ice-wave': 0.4,
  'deep-freeze': 0.8,
  'mud-patch': 0.25,
  tremor: 0.35,
  rod: 0.3,
  chain: 0.2,
}

// How long each effect stays on the practice floor before it is cleared away.
const EFFECT_MS = 1900
// The gold bar: the basic attack is free and charges a little, the others charge more.
const CHARGE = [20, 34, 34, 34]
// The game's own build-up before an ultimate goes off (UltimateBuildUp.Duration).
const BUILD_UP_MS = 1200

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// "Choose your wizard": ribbon bookmarks pick a wizard, and the open page is their spell list
// beside a practice floor where every spell plays a little animation on three straw dummies.
// Spells fill the gold bar, as in the game; when it is full the ultimate unlocks and plays the
// real thing, recorded from the game.
export function SpellBook() {
  const [index, setIndex] = useState(0)
  const [casts, setCasts] = useState<Cast[]>([])
  const [charge, setCharge] = useState(0)
  const [ultimate, setUltimate] = useState<'idle' | 'buildup' | 'playing'>('idle')
  const [announce, setAnnounce] = useState('')
  const [hit, setHit] = useState({ count: 0, all: false, delay: 0 })
  const nextId = useRef(0)
  const timers = useRef(new Set<number>())
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const wizard = wizards[index]

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t)
      fn()
    }, ms)
    timers.current.add(t)
  }

  const choose = (next: number) => {
    setIndex(next)
    setCasts([])
    setUltimate('idle')
    setAnnounce(`${wizards[next].name} chosen`)
  }

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    }
    let next: number | undefined
    if (e.key in moves) next = (index + moves[e.key] + wizards.length) % wizards.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = wizards.length - 1
    if (next === undefined) return
    e.preventDefault()
    choose(next)
    tabs.current[next]?.focus()
  }

  const cast = (slot: number) => {
    if (ultimate !== 'idle') setUltimate('idle')
    const spell: Spell = wizard.spells[slot]
    const id = nextId.current++
    const at = spell.effect === 'rock-wall' ? 'wall' : spell.self ? 'caster' : 'dummy'
    setCasts((list) => [
      ...list.slice(-5),
      { id, effect: spell.effect, wizard: wizard.id, pop: spell.pop, at },
    ])
    setCharge((c) => Math.min(100, c + CHARGE[slot]))
    if (!spell.self && spell.effect !== 'rock-wall')
      setHit((h) => ({
        count: h.count + 1,
        all: spell.effect === 'chain',
        delay: HIT_DELAY[spell.effect] ?? 0.2,
      }))
    setAnnounce(`${spell.name}! ${spell.pop.replace('−', 'minus ')}`)
    later(() => setCasts((list) => list.filter((c) => c.id !== id)), EFFECT_MS)
  }

  const castUltimate = () => {
    if (charge < 100) {
      setAnnounce(
        `${wizard.ultimate.name} is still charging: cast spells to fill the gold bar.`,
      )
      return
    }
    setCharge(0)
    setCasts([])
    setAnnounce(`${wizard.ultimate.name}!`)
    if (prefersReducedMotion()) {
      setUltimate('playing')
      return
    }
    setUltimate('buildup')
    later(() => setUltimate((u) => (u === 'buildup' ? 'playing' : u)), BUILD_UP_MS)
  }

  // Player one's keys work here too: 1-4 cast, 5 is the ultimate, while focus is in the book.
  const onBookKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    const n = Number(e.key)
    if (n >= 1 && n <= 4) cast(n - 1)
    else if (n === 5) castUltimate()
    else return
    e.preventDefault()
  }

  const full = charge >= 100

  return (
    // The keys are a shortcut for the buttons inside, which stay the real controls.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="ww-chooser" onKeyDown={onBookKey}>
      <div className="ww-ribbons" role="tablist" aria-label="Wizards">
        {wizards.map((w, i) => (
          <button
            key={w.id}
            ref={(el) => {
              tabs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`ww-tab-${w.id}`}
            aria-controls="ww-spell-page"
            aria-selected={i === index}
            tabIndex={i === index ? 0 : -1}
            className="ww-ribbon"
            data-el={w.id}
            onClick={() => choose(i)}
            onKeyDown={onTabKey}
          >
            <Glyph id={w.id} />
            <span>{w.element}</span>
          </button>
        ))}
      </div>

      <div
        id="ww-spell-page"
        role="tabpanel"
        aria-labelledby={`ww-tab-${wizard.id}`}
        className="ww-spread ww-spread--chooser"
        data-el={wizard.id}
      >
        <div className="ww-page ww-page--left">
          <div className="ww-portrait">
            <img
              key={wizard.id}
              src={wizard.art}
              alt={`The ${wizard.name}`}
              width={500}
              height={485}
              className="ww-portrait-art"
            />
          </div>
          <h3 className="ww-wizard-name">{wizard.name}</h3>
          <p className="ww-motto">{wizard.motto}</p>

          <div className="ww-arena-wrap">
            <div
              className="ww-arena"
              data-stage={wizard.id}
              data-ult={ultimate}
              role="img"
              aria-label={`Practice floor: the ${wizard.name} facing three straw dummies`}
            >
              <img
                src={wizard.art}
                alt=""
                className="ww-caster"
                data-speed={casts.some((c) => c.effect === 'speed') || undefined}
              />
              {[0, 1, 2].map((d) => {
                const struck = hit.count > 0 && (d === 0 || hit.all)
                return (
                  <Dummy
                    key={struck ? `${d}-${hit.count}` : d}
                    n={d}
                    hit={struck}
                    delay={hit.all ? hit.delay + d * 0.12 : hit.delay}
                  />
                )
              })}
              {casts.map((c) => (
                <FxView key={c.id} cast={c} />
              ))}
              {ultimate === 'buildup' && (
                <div className="ww-buildup" aria-hidden="true">
                  <span>{wizard.ultimate.name}!</span>
                </div>
              )}
            </div>
            {ultimate === 'playing' && (
              <div className="ww-ult-clip">
                <LoopVideo
                  src={clipPath(`${wizard.ultimate.clip}.mp4`)}
                  poster={clipPath(`${wizard.ultimate.clip}.jpg`)}
                  label={wizard.ultimate.clipLabel}
                  width={960}
                  height={540}
                />
                <button
                  type="button"
                  className="ww-chip-btn"
                  onClick={() => setUltimate('idle')}
                >
                  Back to practice
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="ww-page ww-page--right">
          <p className="ww-page-kicker">Spells of the {wizard.element} Wizard</p>
          <ol className="ww-spells">
            {wizard.spells.map((spell, slot) => (
              <li key={spell.name}>
                <button type="button" className="ww-spell" onClick={() => cast(slot)}>
                  <span className="ww-pad" aria-hidden="true">
                    {slots[slot].pad}
                  </span>
                  <span className="ww-spell-body">
                    <span className="ww-spell-name">
                      {spell.name}
                      <span className="ww-spell-slot">
                        {slots[slot].label} · key {slots[slot].key}
                      </span>
                    </span>
                    <span className="ww-spell-text">{spell.text}</span>
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="ww-spell ww-spell--ult"
                aria-disabled={!full}
                data-ready={full || undefined}
                onClick={castUltimate}
              >
                <span className="ww-pad ww-pad--x" aria-hidden="true">
                  X
                </span>
                <span className="ww-spell-body">
                  <span className="ww-spell-name">
                    {wizard.ultimate.name}
                    <span className="ww-spell-slot">Ultimate · key 5</span>
                  </span>
                  <span className="ww-spell-text">{wizard.ultimate.text}</span>
                </span>
              </button>
            </li>
          </ol>
          <div className="ww-goldbar-wrap">
            <span id="ww-gold-label" className="ww-goldbar-label">
              {full ? 'Ultimate ready! Press X (or 5)' : 'Ultimate charge'}
            </span>
            <div
              className="ww-goldbar"
              role="progressbar"
              aria-labelledby="ww-gold-label"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={charge}
              data-full={full || undefined}
            >
              <span style={{ width: `${charge}%` }} />
            </div>
            <p className="ww-hint">
              Tap a spell to try it. In the game the gold bar fills as you fight; here,
              every spell adds to it.
            </p>
          </div>
        </div>
      </div>
      <p className="ww-sr" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}

function Dummy({ n, hit, delay }: { n: number; hit: boolean; delay: number }) {
  return (
    <svg
      viewBox="0 0 40 60"
      className="ww-dummy"
      data-n={n}
      data-hit={hit || undefined}
      style={{ '--hit-delay': `${delay}s` } as CSSProperties}
      aria-hidden="true"
    >
      <ellipse cx="20" cy="57" rx="12" ry="3" fill="rgb(0 0 0 / 0.25)" />
      <path d="M20 30v27" stroke="#6b4423" strokeWidth="4" strokeLinecap="round" />
      <path d="M6 28h28" stroke="#6b4423" strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M11 22q9-4 18 0l-2 22q-7 3-14 0z"
        fill="#e7c477"
        stroke="#2b1a10"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="13" r="8.5" fill="#e7c477" stroke="#2b1a10" strokeWidth="2" />
      <path
        d="M15.5 10.5l3 3m0-3l-3 3M21.5 10.5l3 3m0-3l-3 3"
        stroke="#2b1a10"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M13 32h14M13 38h14" stroke="#b08d47" strokeWidth="1.2" />
    </svg>
  )
}

// One spell's animation, drawn from plain elements and CSS (see .ww-fx in wizard-wars.css).
function FxView({ cast }: { cast: Cast }) {
  const { effect, wizard, pop, at } = cast
  const many = (count: number, cls: string) =>
    Array.from({ length: count }, (_, i) => (
      <span key={i} className={cls} style={{ '--i': i } as CSSProperties} />
    ))
  return (
    <div className={`ww-fx ww-fx--${effect}`} data-el={wizard} aria-hidden="true">
      {effect === 'bolt' && (
        <>
          <span className="ww-bolt" />
          <span className="ww-impact" />
        </>
      )}
      {effect === 'flame-ring' && <span className="ww-ring">{many(12, 'ww-flame')}</span>}
      {effect === 'flamethrower' && many(12, 'ww-puff')}
      {effect === 'meteor' && (
        <>
          <span className="ww-meteor" />
          <span className="ww-impact ww-impact--big" />
          <span className="ww-ring ww-ring--small">{many(5, 'ww-flame')}</span>
        </>
      )}
      {effect === 'ice-patch' && <span className="ww-patch ww-patch--ice" />}
      {effect === 'ice-wave' && (
        <>
          <span className="ww-wave" />
          <span className="ww-iceblock" />
        </>
      )}
      {effect === 'deep-freeze' && (
        <>
          <span className="ww-gather">{many(8, 'ww-spark')}</span>
          <span className="ww-iceblock ww-iceblock--late" />
        </>
      )}
      {effect === 'mud-patch' && (
        <span className="ww-patch ww-patch--mud">{many(4, 'ww-bubble')}</span>
      )}
      {effect === 'rock-wall' && <span className="ww-wall" />}
      {effect === 'tremor' && (
        <>
          {many(3, 'ww-shock')}
          <svg className="ww-cracks" viewBox="0 0 100 60" preserveAspectRatio="none">
            <path d="M50 30L30 18L18 22M50 30L72 14L86 18M50 30L40 50L26 54M50 30L68 46L82 44" />
          </svg>
        </>
      )}
      {effect === 'rod' && (
        <>
          <span className="ww-rod" />
          {many(3, 'ww-zapring')}
        </>
      )}
      {effect === 'speed' && many(4, 'ww-streak')}
      {effect === 'chain' && (
        <svg className="ww-chain" viewBox="0 0 100 56.25" preserveAspectRatio="none">
          <polyline points="22,30 32,34 40,29 50,35 60,31 70,36 78,33 73,28 70,22 65,20 62,16 69,12 75,17 82,12 88,14" />
        </svg>
      )}
      <span className={`ww-pop ww-pop--${at}`}>{pop}</span>
    </div>
  )
}
