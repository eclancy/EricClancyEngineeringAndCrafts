import { useCallback, useState, type CSSProperties } from 'react'
import { Glyph, Sprite } from './Pixels'
import { strays, type ReelName, type Stray } from './strays'

// How each temper takes a poke, from the reels the game exported: the aggressive strike back, the
// proud and the curious rear up, the skittish and the loyal flinch.
const reaction: Record<string, ReelName> = {
  Aggressive: 'strike',
  Proud: 'cast',
  Curious: 'cast',
  Skittish: 'hurt',
  Loyal: 'hurt',
}

const SQUAD = 3

/** A thumbnail's pixel scale: whole numbers where they fit, so the pixels stay square. */
const thumbScale = (s: Stray, room: number) => {
  const fit = room / Math.max(s.frame.w, s.frame.h)
  return fit >= 1 ? Math.min(2, Math.floor(fit)) : fit
}

function Chip({
  glyph,
  children,
  hint,
  colour,
}: {
  glyph: string
  children: React.ReactNode
  hint?: string
  colour?: string
}) {
  return (
    <li
      className="tfws-chip"
      title={hint}
      style={colour ? ({ '--chip': colour } as CSSProperties) : undefined}
    >
      <Glyph name={glyph} />
      <span>{children}</span>
      {hint && <span className="tfws-sr"> ({hint})</span>}
    </li>
  )
}

/**
 * The pen on the page: a stray of every one of the game's thirty forms, drawn by the game. Look
 * through them, poke one to see its temper, and catch up to three for a squad; a caught stray
 * shows the tier it becomes.
 */
export function StrayPen() {
  const [at, setAt] = useState(0)
  const [reel, setReel] = useState<ReelName>('idle')
  const [pokes, setPokes] = useState(0)
  const [squad, setSquad] = useState<string[]>([])
  const [said, setSaid] = useState('')
  const stray = strays[at]
  const caught = squad.includes(stray.id)
  const full = squad.length >= SQUAD
  const backToIdle = useCallback(() => setReel('idle'), [])

  const show = (i: number) => {
    setAt((i + strays.length) % strays.length)
    setReel('idle')
    setSaid('')
  }
  const poke = () => {
    setReel(reaction[stray.temper.name] ?? 'hurt')
    setPokes((p) => p + 1)
    setSaid(`${stray.temper.name}: it ${stray.temper.reacts}.`)
  }
  const catchIt = () => {
    if (caught || full) return
    setSquad((s) => [...s, stray.id])
    setSaid(
      `${stray.name} joins your squad, and is a ${stray.caught.tier.toLowerCase()} now.`,
    )
  }
  const release = (id: string) => {
    setSquad((s) => s.filter((x) => x !== id))
    const gone = strays.find((s) => s.id === id)
    if (gone) setSaid(`${gone.name} goes back to the wild.`)
  }

  const tier = caught
    ? { name: stray.caught.tier, glyph: stray.caught.glyph, hex: stray.caught.hex }
    : { name: 'Stray', glyph: 'paw', hex: '#b8ad9c' }
  const what = [
    `${stray.size} ${stray.plan}`,
    stray.element,
    stray.strain?.toLowerCase(),
  ].filter(Boolean)

  return (
    <div className="tfws-pen">
      <div className="tfws-pen__main">
        <div className={`tfws-stage${caught ? ' is-caught' : ''}`}>
          <p className="tfws-stage__count">
            <span>
              Form {at + 1} of {strays.length}
            </span>
            {stray.form}
          </p>
          <div className="tfws-stage__floor">
            <span className="tfws-tile" aria-hidden="true" />
            <span className="tfws-ring" aria-hidden="true" />
            <Sprite
              key={`${stray.id}-${reel}-${pokes}`}
              stray={stray}
              reel={reel}
              onDone={backToIdle}
              className="tfws-stage__sprite"
              label={`${stray.name}, a ${what.join(', ')} ${stray.form.toLowerCase()}`}
            />
          </div>
          <p className="tfws-said" aria-live="polite">
            {said}
          </p>
          <div className="tfws-stage__controls">
            <button
              type="button"
              className="tfws-btn tfws-btn--small"
              onClick={() => show(at - 1)}
              aria-label="The stray before"
            >
              ◀
            </button>
            <button type="button" className="tfws-btn tfws-btn--small" onClick={poke}>
              Poke it
            </button>
            <button
              type="button"
              className="tfws-btn tfws-btn--small tfws-btn--gold"
              onClick={catchIt}
              disabled={caught || full}
            >
              {caught ? 'Caught' : full ? 'Squad full' : 'Catch it'}
            </button>
            <button
              type="button"
              className="tfws-btn tfws-btn--small"
              onClick={() => show(at + 1)}
              aria-label="The next stray"
            >
              ▶
            </button>
          </div>
        </div>

        <section className="tfws-card tfws-panel" aria-label={`About ${stray.name}`}>
          <h3 className={caught ? 'is-caught' : undefined}>{stray.name}</h3>
          <p className="tfws-card__what">{what.join(' · ')}</p>
          <ul className="tfws-chips tfws-chips--stats" aria-label="Stats">
            <Chip glyph="hp" hint="HP">
              {stray.stats.hp}
            </Chip>
            <Chip glyph="atk" hint="ATK: damage">
              {stray.stats.atk}
            </Chip>
            <Chip glyph="def" hint="DEF: damage taken">
              {stray.stats.def}
            </Chip>
            <Chip glyph="spd" hint="SPD: turn order and hit chance">
              {stray.stats.spd}
            </Chip>
            <Chip glyph="move" hint="MOVE: tiles a turn">
              {stray.stats.move}
            </Chip>
          </ul>
          <ul className="tfws-chips" aria-label="What it is">
            <Chip glyph={tier.glyph} colour={tier.hex}>
              {tier.name}
            </Chip>
            <Chip glyph={stray.temper.glyph} hint={`it ${stray.temper.reacts}`}>
              {stray.temper.name}
            </Chip>
            <Chip glyph={stray.weapon.glyph} hint={`weapon: ${stray.weapon.text}`}>
              {stray.weapon.name}
            </Chip>
            <Chip glyph={stray.armor.glyph} hint={`armour: ${stray.armor.text}`}>
              {stray.armor.name}
            </Chip>
            <Chip glyph={stray.moves.glyph} hint={stray.moves.text}>
              {stray.moves.name}
            </Chip>
          </ul>
          <dl className="tfws-card__notes">
            <div>
              <dt>In battle</dt>
              <dd>It {stray.temper.reacts}.</dd>
            </div>
            <div>
              <dt>To recruit</dt>
              <dd>
                {stray.temper.recruit[0].toUpperCase() + stray.temper.recruit.slice(1)}.
              </dd>
            </div>
            {stray.traits.length > 0 && (
              <div>
                <dt>Born with</dt>
                <dd>
                  {stray.traits.map((t, i) => (
                    <span key={t.name}>
                      {i > 0 && '; '}
                      <b>{t.name}</b>: {t.text.replace(/\.$/, '')}
                    </span>
                  ))}
                  .
                </dd>
              </div>
            )}
            {caught && (
              <div className="tfws-card__tier">
                <dt>{stray.caught.tier}</dt>
                <dd>{stray.caught.text}</dd>
              </div>
            )}
          </dl>
          <p className="tfws-card__jobs-title">Takes to</p>
          <ul className="tfws-chips" aria-label="Jobs it takes to">
            {stray.favoured.map((job) => (
              <Chip key={job.name} glyph={job.glyph} hint={job.blurb} colour="#f2c14e">
                {job.name}
              </Chip>
            ))}
          </ul>
        </section>
      </div>

      <div className="tfws-squad" aria-label="Your squad">
        <p className="tfws-squad__title">
          Your squad{' '}
          <span>
            {squad.length}/{SQUAD}
          </span>
        </p>
        <ul>
          {Array.from({ length: SQUAD }, (_, i) => {
            const s = strays.find((x) => x.id === squad[i])
            if (!s)
              return (
                <li key={`empty-${i}`} className="tfws-slot is-empty">
                  <span>Empty</span>
                </li>
              )
            const index = strays.indexOf(s)
            return (
              <li key={s.id} className={`tfws-slot${index === at ? ' is-shown' : ''}`}>
                <button
                  type="button"
                  className="tfws-slot__pick"
                  onClick={() => show(index)}
                  style={{ '--s': thumbScale(s, 44) } as CSSProperties}
                >
                  <Sprite stray={s} still />
                  <span>{s.name}</span>
                </button>
                <button
                  type="button"
                  className="tfws-slot__release"
                  onClick={() => release(s.id)}
                  aria-label={`Release ${s.name}`}
                  title="Release"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <ul className="tfws-forms" aria-label="Every form">
        {strays.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`tfws-thumb${i === at ? ' is-shown' : ''}${squad.includes(s.id) ? ' is-caught' : ''}`}
              onClick={() => show(i)}
              aria-pressed={i === at}
              aria-label={`${s.form}: ${s.name}${squad.includes(s.id) ? ', in your squad' : ''}`}
              title={`${s.form}: ${s.name}`}
              style={{ '--s': thumbScale(s, 52) } as CSSProperties}
            >
              <Sprite stray={s} still />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
