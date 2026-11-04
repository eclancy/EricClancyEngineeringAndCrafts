import { useEffect, useState, type CSSProperties } from 'react'
import {
  fps,
  glyphCell,
  glyphCols,
  glyphIndex,
  reels,
  type ReelName,
  type Stray,
} from './strays'

export const ART = '/games/the-farther-we-stray/'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const total = reels.reduce((n, r) => n + r.frames, 0)
const first = (reel: ReelName) => {
  let n = 0
  for (const r of reels) {
    if (r.name === reel) return n
    n += r.frames
  }
  return 0
}
const length = (reel: ReelName) => reels.find((r) => r.name === reel)?.frames ?? 1

/**
 * A stray as the game draws it: its strip of frames, breathing at 8 frames a second, or playing
 * `reel` once and then telling `onDone`. Give it a new `key` to start a reel over. Sized by the
 * CSS variable --s (the pixel scale), so a stylesheet can make it smaller on a phone. With less
 * motion asked for, it holds its first frame.
 */
export function Sprite({
  stray,
  reel = 'idle',
  onDone,
  still = false,
  className = '',
  label,
}: {
  stray: Stray
  reel?: ReelName
  onDone?: () => void
  still?: boolean
  className?: string
  label?: string
}) {
  const [tick, setTick] = useState(0)

  const [moving] = useState(() => !still && !reduced())

  useEffect(() => {
    if (!moving) return
    const id = window.setInterval(() => setTick((t) => t + 1), 1000 / fps)
    return () => window.clearInterval(id)
  }, [moving])

  const frames = length(reel)
  const done = reel !== 'idle' && (!moving || tick >= frames)
  useEffect(() => {
    if (done) onDone?.()
  }, [done, onDone])

  const frame = !moving
    ? 0
    : first(reel) + (reel === 'idle' ? tick % frames : Math.min(tick, frames - 1))
  const { w, h, ax, ay } = stray.frame
  const style = {
    '--w': w,
    '--h': h,
    '--ax': ax,
    '--ay': ay,
    '--n': total,
    '--f': frame,
    backgroundImage: `url(${ART}strays/${stray.id}.png)`,
  } as CSSProperties
  return (
    <span
      className={`tfws-sprite ${className}`}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}

/** One of the game's 12x12 glyphs (with its outline), at 2x unless --g says otherwise. */
export function Glyph({ name, className = '' }: { name: string; className?: string }) {
  const i = glyphIndex[name] ?? glyphIndex.star ?? 0
  const style = {
    '--gx': i % glyphCols,
    '--gy': Math.floor(i / glyphCols),
    '--gc': glyphCell,
    '--gn': glyphCols,
  } as CSSProperties
  return <span className={`tfws-glyph ${className}`} style={style} aria-hidden="true" />
}
