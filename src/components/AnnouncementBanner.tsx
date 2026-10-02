import { useState } from 'react'
import { announcements, type Announcement } from '../data/announcements'

const STORAGE_KEY = 'ecec-dismissed-announcements'

// Browser storage can throw (private windows, blocked site data), and a banner is not worth
// breaking the page over - so every read and write falls back to "nothing dismissed".
function readDismissed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeDismissed(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Not remembered; it comes back on the next visit, which is fine.
  }
}

function current(dismissed: string[]): Announcement | undefined {
  const today = new Date().toISOString().slice(0, 10)
  return announcements.find(
    (a) => !dismissed.includes(a.id) && (!a.until || today <= a.until),
  )
}

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(readDismissed)
  const announcement = current(dismissed)
  if (!announcement) return null

  const dismiss = () => {
    const next = [...dismissed, announcement.id]
    writeDismissed(next)
    setDismissed(next)
  }

  return (
    <aside
      aria-label="Announcement"
      className="ecec-cta relative flex items-center justify-center gap-x-3 gap-y-1 px-12 py-2.5 text-center text-sm font-bold text-white sm:text-base"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {announcement.emoji && (
          <span aria-hidden="true" className="ecec-banner-emoji text-xl">
            {announcement.emoji}
          </span>
        )}
        <span>{announcement.text}</span>
        {announcement.link && (
          <a
            href={announcement.link.href}
            className="whitespace-nowrap rounded-full bg-white/95 px-3 py-0.5 text-slate-950 underline-offset-2 shadow transition hover:bg-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {announcement.link.label} →
          </a>
        )}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-lg text-white/90 transition hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        ×
      </button>
    </aside>
  )
}
