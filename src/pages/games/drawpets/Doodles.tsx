// Little hand-drawn doodles for the DrawPets page: hearts, stars and squiggles in the game's
// marker-and-pencil style. All of them are decoration, hidden from screen readers.

interface DoodleProps {
  className?: string
  color?: string
}

/** The SVG filters the page's wobbly outlines use, rendered once at the top of the page. */
export function DoodleFilters() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="dp-filters">
      <defs>
        {/* A hand's wobble: a little noise pushes every edge off true. */}
        <filter id="dp-wobble" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
        </filter>
        <filter id="dp-wobble-soft" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06"
            numOctaves="2"
            seed="9"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
        {/* Coloured-pencil shading: diagonal strokes for filling hills and blobs. */}
        <pattern
          id="dp-hatch"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(32)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="7"
            stroke="#ffffff"
            strokeWidth="2.2"
            opacity="0.35"
          />
        </pattern>
      </defs>
    </svg>
  )
}

export function Heart({ className = '', color = 'var(--dp-pink)' }: DoodleProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={`dp-doodle ${className}`}
    >
      <path
        d="M12 21s-7.6-4.7-9.6-9.4C.9 8.2 3.1 4.4 6.7 4.4c2.1 0 3.6 1.3 5.3 3.3 1.7-2 3.2-3.3 5.3-3.3 3.6 0 5.8 3.8 4.3 7.2C19.6 16.3 12 21 12 21z"
        fill={color}
        stroke="var(--dp-ink)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.3 8.2c.6-.9 1.6-1.3 2.5-1.1"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  )
}

export function Star({ className = '', color = 'var(--dp-sun)' }: DoodleProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={`dp-doodle ${className}`}
    >
      <path
        d="M12 2.6l2.7 6 6.5.6-4.9 4.4 1.5 6.5L12 16.7l-5.8 3.4 1.5-6.5L2.8 9.2l6.5-.6z"
        fill={color}
        stroke="var(--dp-ink)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A sparkle: four little rays, for "it's alive!" moments. */
export function Sparkle({ className = '', color = 'var(--dp-ink)' }: DoodleProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={`dp-doodle ${className}`}
    >
      <path
        d="M12 3v5M12 16v5M3 12h5M16 12h5"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A marker swoosh to underline a heading. */
export function Squiggle({ className = '', color = 'var(--dp-orange)' }: DoodleProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 200 16"
      preserveAspectRatio="none"
      className={`dp-squiggle ${className}`}
    >
      <path
        d="M3 10c18-7 30 4 48-1s28-7 47-1 30 5 50-1 32-5 49 0"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A curly hand-drawn arrow, pointing down and to the right. */
export function CurlyArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 80 70"
      className={`dp-doodle ${className}`}
    >
      <path
        d="M6 10c22-6 40 2 38 16-1 9-14 9-12 0 3-12 24-8 30 6 4 9 4 18 2 26"
        fill="none"
        stroke="var(--dp-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M54 50l10 10 8-13"
        fill="none"
        stroke="var(--dp-ink)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
