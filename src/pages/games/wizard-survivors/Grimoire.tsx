import { useState } from 'react'
import { elementColour, elements, iconSrc, spells, type Element } from './spells'

// All thirty spells on one page of the book. Pick an element to see which spells carry it
// (stacking an element is how a build grows teeth), or a spell to read it.
export function Grimoire() {
  const [selected, setSelected] = useState('meteor_swarm')
  const [element, setElement] = useState<Element | null>(null)
  const spell = spells.find((s) => s.id === selected) ?? spells[0]

  return (
    <div className="ws-grimoire">
      <div
        className="ws-grimoire__elements"
        role="group"
        aria-label="Highlight an element"
      >
        {elements.map((el) => (
          <button
            key={el}
            type="button"
            aria-pressed={element === el}
            className="ws-chip"
            style={{ '--chip': elementColour[el] } as React.CSSProperties}
            onClick={() => setElement(element === el ? null : el)}
          >
            {el}
          </button>
        ))}
      </div>

      <div className="ws-grimoire__body">
        <ul className="ws-grimoire__grid" aria-label="The thirty spells">
          {spells.map((s) => {
            const dim = element !== null && !s.elements.includes(element)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`ws-sigil${dim ? ' is-dim' : ''}`}
                  aria-pressed={s.id === selected}
                  aria-label={s.name}
                  title={s.name}
                  onClick={() => setSelected(s.id)}
                >
                  <img src={iconSrc(s.id)} alt="" width={64} height={64} loading="lazy" />
                </button>
              </li>
            )
          })}
        </ul>

        <article className="ws-page ws-grimoire__page" aria-live="polite">
          <img
            src={iconSrc(spell.id)}
            alt=""
            width={64}
            height={64}
            className="ws-grimoire__icon"
          />
          <h3 className="ws-grimoire__name">{spell.name}</h3>
          <p className="ws-card__tags ws-card__tags--page">
            {spell.elements.map((el) => (
              <span key={el} style={{ background: elementColour[el] }}>
                {el}
              </span>
            ))}
          </p>
          <p className="ws-grimoire__text">{spell.text}</p>
          <p className="ws-grimoire__note">
            Each spell levels to seven, chooses a mutation at four and an Ascension at
            eight.
          </p>
        </article>
      </div>
    </div>
  )
}
