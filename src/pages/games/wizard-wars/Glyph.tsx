import type { Wizard } from './wizards'

// A little element badge: flame, snowflake, rock or bolt, drawn chunky with a dark outline.
export function Glyph({ id, className = '' }: { id: Wizard['id']; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={`ww-glyph ${className}`}
    >
      {id === 'fire' && (
        <path
          d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"
          fill="#ffb21e"
          stroke="#2b1a10"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}
      {id === 'frost' && (
        <g stroke="#2b1a10" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 2v20M3.5 7l17 10M3.5 17l17-10" />
          <path d="M12 2v20M3.5 7l17 10M3.5 17l17-10" stroke="#e6f6ff" strokeWidth="1" />
        </g>
      )}
      {id === 'earth' && (
        <path
          d="M4 17l2-7 5-4 6 2 3 6-2 5H7z"
          fill="#a87443"
          stroke="#2b1a10"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}
      {id === 'electricity' && (
        <path
          d="M14 2L5 14h6l-2 8 10-13h-6z"
          fill="#ffe14d"
          stroke="#2b1a10"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
