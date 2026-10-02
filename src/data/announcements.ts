export interface Announcement {
  /** Unique and never reused: dismissing a banner remembers this id, so a new announcement
   *  needs a new id to show to people who closed the last one. */
  id: string
  emoji?: string
  text: string
  link?: { href: string; label: string }
  /** Optional last day to show it, as YYYY-MM-DD. Omit to show it until it is removed. */
  until?: string
}

// The banner across the top of the home page. The first one that has not expired and has not
// been dismissed is shown; add new ones at the top. Keep them short - it is one line on a phone.
export const announcements: Announcement[] = [
  {
    id: 'drawfight-download-2026-10',
    emoji: '🎮',
    text: 'DrawFight is out! Download it free and fight your friends.',
    link: { href: '/drawfight/download', label: 'Download & play' },
  },
]
