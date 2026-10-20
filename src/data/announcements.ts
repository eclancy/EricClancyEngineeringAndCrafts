export interface Announcement {
  /** Unique and never reused: dismissing a banner remembers this id, so a new announcement
   *  needs a new id to show to people who closed the last one. */
  id: string
  emoji?: string
  text: string
  link?: { href: string; label: string }
  /** Where a click anywhere else on the banner goes, e.g. '#project-drawfight' to scroll to
   *  that project's card. */
  href?: string
  /** Optional last day to show it, as YYYY-MM-DD. Omit to show it until it is removed. */
  until?: string
}

// The banner across the top of the home page. The first one that has not expired and has not
// been dismissed is shown; add new ones at the top. Keep them short - it is one line on a phone.
export const announcements: Announcement[] = [
  {
    id: 'games-download-2026-10',
    emoji: '🎮',
    text: 'Try my free games',
    link: { href: '#projects', label: 'Pick one' },
    href: '#projects',
  },
]
