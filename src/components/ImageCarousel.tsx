import { useRef, useState } from 'react'
import type { ProjectImage } from '../data/projects'
import { ArrowButton, Lightbox } from './Lightbox'

interface ImageCarouselProps {
  images: ProjectImage[]
  /** Project name, for the controls' labels. */
  name: string
  className?: string
}

// A project's picture frame. The pictures sit side by side in a horizontally scrolling strip
// that snaps one picture at a time, so a phone swipes through them natively; on a computer
// the arrows appear on hover and scroll the strip. Clicking or tapping a picture opens the
// gallery full screen. The frame keeps one size, so the card never jumps.
export function ImageCarousel({ images, name, className = '' }: ImageCarouselProps) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)
  if (images.length === 0) return null

  const many = images.length > 1
  // The index follows the strip's scroll position (so a swipe updates the dots), and is also
  // set straight away here, so quick repeated arrow clicks don't read a stale index while a
  // smooth scroll is still on its way.
  const goTo = (i: number, behavior: ScrollBehavior = 'smooth') => {
    setIndex(i)
    const el = track.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior })
  }
  const step = (delta: number) => goTo((index + delta + images.length) % images.length)

  return (
    <div
      className={`group relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-950 ${className}`}
    >
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="ecec-no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((image, i) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setExpanded(i)}
            aria-label={`View full screen: ${image.alt}`}
            className="h-full w-full shrink-0 snap-center cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-400"
          >
            <img
              src={image.src}
              alt=""
              loading="lazy"
              draggable={false}
              className={`h-full w-full ${image.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
            />
          </button>
        ))}
      </div>

      {many && (
        <>
          <ArrowButton direction="previous" onClick={() => step(-1)} revealOnHover />
          <ArrowButton direction="next" onClick={() => step(1)} revealOnHover />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5"
            aria-hidden="true"
          >
            {images.map((img, i) => (
              <span
                key={img.src}
                className={`h-1.5 rounded-full shadow shadow-black/60 transition-all ${
                  i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Picture {index + 1} of {images.length}: {images[index]?.alt}
          </p>
        </>
      )}

      <Lightbox
        images={images}
        index={expanded}
        onIndexChange={(i) => {
          setExpanded(i)
          goTo(i, 'instant')
        }}
        onClose={() => setExpanded(null)}
        label={`${name} pictures`}
      />
    </div>
  )
}
