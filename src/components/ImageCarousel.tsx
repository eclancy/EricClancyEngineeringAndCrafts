import { useState } from 'react'
import type { ProjectImage } from '../data/projects'
import { ArrowButton, Lightbox } from './Lightbox'

interface ImageCarouselProps {
  images: ProjectImage[]
  /** Project name, for the controls' labels. */
  name: string
  /** Where a click on the picture itself goes. */
  href?: string
  hrefLabel?: string
  newTab?: boolean
  className?: string
}

// The picture frame on a project card: arrows step through the pictures in place, and the
// expand button opens them full screen. The frame keeps one size, so the card never jumps.
export function ImageCarousel({
  images,
  name,
  href,
  hrefLabel,
  newTab = false,
  className = '',
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)
  if (images.length === 0) return null

  const image = images[index]
  const many = images.length > 1
  const step = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length)

  const picture = (
    <img
      key={image.src}
      src={image.src}
      alt={image.alt}
      loading="lazy"
      className={`ecec-fade-in h-full w-full ${image.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
    />
  )

  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-950 ${className}`}
    >
      {href ? (
        <a
          href={href}
          aria-label={hrefLabel}
          {...(newTab ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          className="block h-full w-full transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-400"
        >
          {picture}
        </a>
      ) : (
        picture
      )}

      <button
        type="button"
        onClick={() => setExpanded(index)}
        aria-label={`View ${name} pictures full screen`}
        title="Full screen"
        className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-slate-950/70 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:scale-110 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300"
      >
        <svg
          viewBox="0 0 20 20"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" />
        </svg>
      </button>

      {many && (
        <>
          <ArrowButton direction="previous" onClick={() => step(-1)} />
          <ArrowButton direction="next" onClick={() => step(1)} />
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
            Picture {index + 1} of {images.length}: {image.alt}
          </p>
        </>
      )}

      <Lightbox
        images={images}
        index={expanded}
        onIndexChange={(i) => {
          setExpanded(i)
          setIndex(i)
        }}
        onClose={() => setExpanded(null)}
        label={`${name} pictures`}
      />
    </div>
  )
}
