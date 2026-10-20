import type { ReactNode } from 'react'
import './game-loader.css'

// Shown for the moment a game page's own chunk is downloading. Each one is drawn in that
// game's colours, so the page arrives on the same backdrop instead of after a white flash.
// Pure CSS and system fonts: the game's own fonts and art arrive with the page itself.
const loaders: Record<string, { caption: string; art: ReactNode }> = {
  drawfight: {
    caption: 'Sharpening pencils…',
    art: (
      <svg viewBox="0 0 120 60" className="gl-df-scribble" aria-hidden="true">
        <path d="M8 44 C 22 10, 36 52, 50 24 S 78 8, 86 34 S 104 50, 112 16" />
      </svg>
    ),
  },
  drawpets: {
    caption: 'Waking up the pets…',
    art: (
      <span className="gl-dp-hearts" aria-hidden="true">
        <span>♥</span>
        <span>♥</span>
        <span>♥</span>
      </span>
    ),
  },
  'wizard-survivors': {
    caption: 'Beginning the ritual…',
    art: (
      <span className="gl-ws-circle" aria-hidden="true">
        <span />
      </span>
    ),
  },
  'wizard-wars': {
    caption: 'Opening the spellbook…',
    art: <span className="gl-ww-orb" aria-hidden="true" />,
  },
}

export function GameLoader({ id, name }: { id: string; name: string }) {
  const loader = loaders[id]
  return (
    <div className={`game-loader gl-${id}`} role="status" aria-live="polite">
      {loader?.art}
      <p>
        <span className="sr-only">Loading {name}. </span>
        {loader?.caption ?? 'Loading…'}
      </p>
    </div>
  )
}
