import { useEffect, useRef } from 'react'
import type { ProjectImage } from '../data/projects'

interface LightboxProps {
  images: ProjectImage[]
  /** Which image is showing, or null when closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
  label: string
}

// A native <dialog> shown modal: the browser handles Esc, the focus trap and inert background.
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  label,
}: LightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const open = index !== null

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  const step = (delta: number) => {
    if (index === null) return
    onIndexChange((index + delta + images.length) % images.length)
  }

  // Arrow keys step through the pictures, and a click on the empty space around the picture
  // (which lands on the dialog itself) closes it. Listened for directly because the dialog is
  // not itself a control.
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    const onClick = (e: MouseEvent) => e.target === el && el.close()
    el.addEventListener('keydown', onKey)
    el.addEventListener('click', onClick)
    return () => {
      el.removeEventListener('keydown', onKey)
      el.removeEventListener('click', onClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- step is rebuilt each render from these
  }, [index, images.length, onIndexChange])

  const image = index === null ? undefined : images[index]
  const many = images.length > 1

  return (
    <dialog
      ref={dialog}
      aria-label={label}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-slate-950/90 backdrop:backdrop-blur-sm"
    >
      {image && (
        <div className="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-3 p-4 sm:p-10">
          <img
            src={image.src}
            alt={image.alt}
            className="pointer-events-auto max-h-[85dvh] max-w-full rounded-xl object-contain shadow-2xl shadow-black/60"
          />
          <p className="pointer-events-auto text-center text-sm text-slate-300">
            {image.alt}
            {many && (
              <span className="ml-2 text-slate-500">
                {index! + 1} / {images.length}
              </span>
            )}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-slate-900/80 text-2xl text-white ring-1 ring-white/15 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300"
      >
        ×
      </button>
      {many && (
        <>
          <ArrowButton direction="previous" onClick={() => step(-1)} large />
          <ArrowButton direction="next" onClick={() => step(1)} large />
        </>
      )}
    </dialog>
  )
}

export function ArrowButton({
  direction,
  onClick,
  large = false,
}: {
  direction: 'previous' | 'next'
  onClick: () => void
  large?: boolean
}) {
  const side = direction === 'previous' ? 'left-2' : 'right-2'
  const size = large ? 'size-12 text-2xl' : 'size-9 text-lg'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'previous' ? 'Previous picture' : 'Next picture'}
      className={`absolute top-1/2 ${side} ${size} grid -translate-y-1/2 place-items-center rounded-full bg-slate-950/70 font-bold text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:scale-110 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300`}
    >
      <span aria-hidden="true">{direction === 'previous' ? '‹' : '›'}</span>
    </button>
  )
}
