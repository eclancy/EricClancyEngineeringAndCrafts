import { useEffect, useRef, useState } from 'react'

interface LoopVideoProps {
  /** An .mp4 in public/, e.g. '/games/drawfight/clips/fight.mp4'. */
  src: string
  /** A still of the first frame, shown before it plays and to people who prefer less motion. */
  poster: string
  /** What the clip shows, for screen readers. */
  label: string
  width: number
  height: number
  className?: string
}

// A clip that behaves like a GIF: silent, looping, playing by itself, but a fraction of a GIF's
// size. It only plays while on screen, and for people who ask for reduced motion it waits on its
// poster until they press play.
export function LoopVideo({
  src,
  poster,
  label,
  width,
  height,
  className = '',
}: LoopVideoProps) {
  const video = useRef<HTMLVideoElement>(null)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = video.current
    if (!el || reduced) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return (
    <div className={`relative ${className}`}>
      <video
        ref={video}
        src={src}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block h-auto w-full"
      />
      {reduced && !playing && (
        <button
          type="button"
          onClick={() => video.current?.play()}
          aria-label={`Play: ${label}`}
          className="absolute inset-0 grid place-items-center bg-black/20 text-5xl text-white"
        >
          <span aria-hidden="true">▶</span>
        </button>
      )}
    </div>
  )
}
