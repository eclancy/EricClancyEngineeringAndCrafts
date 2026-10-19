// Hand-drawn marks for the margins. All decorative: hidden from screen readers.

interface DoodleProps {
  className?: string
}

/** A wobbly marker underline, stretched to whatever it sits under. */
export function Underline({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 18"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M3 11 C 40 5, 80 13, 120 8 S 200 4, 236 9 S 280 12, 297 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M30 15 C 90 10, 170 14, 270 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** A curly pencil arrow, pointing up and to the left. */
export function Arrow({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 90 70" aria-hidden="true">
      <path
        d="M84 62 C 70 64, 52 58, 46 46 C 40 34, 56 26, 60 36 C 64 46, 44 50, 32 40 C 22 32, 14 20, 10 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M2 18 L10 6 L20 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A five-point doodle star, drawn in one stroke. */
export function Star({ className }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M30 4 L37 23 L57 23 L41 35 L47 55 L30 43 L13 55 L19 35 L3 23 L23 23 Z"
        fill="#ffe45c"
        stroke="#1c2230"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M50 6 l4 -4 M54 12 l5 -1 M8 8 l-4 -4"
        stroke="#1c2230"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A loose pencil scribble, for the bottom of the page. */
export function Scribble({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M4 24 C 20 6, 30 36, 46 20 S 70 4, 84 22 S 110 36, 126 18 S 150 6, 166 24 S 190 34, 206 18 S 232 6, 246 24 S 272 36, 288 20 S 312 6, 328 22 S 352 34, 368 18 S 390 10, 396 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
