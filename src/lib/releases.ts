// Release info for a game page, read live from the game's GitHub Releases.
import { useEffect, useState } from 'react'
import type { GameInfo } from '../data/projects'

export interface Release {
  version: string
  date: string
  notes: string
  url: string
  sizeMb?: number
}

export type Releases =
  { state: 'loading' } | { state: 'none' } | { state: 'ok'; list: Release[] }

// Every release's notes end with the same "Download **<Game>-windows.zip**, ..." paragraph that
// release.sh adds; what comes before it is the player-facing "what changed". Keep only that,
// with markdown bold reduced to plain text.
function playerNotes(body: string | null): string {
  return (body ?? '')
    .split(/\r?\n\s*\r?\n/)
    .filter((paragraph) => !paragraph.trim().startsWith('Download **'))
    .join('\n\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .trim()
}

// Newest first, from GitHub's API, which allows cross-site reads. Anything going wrong (offline,
// rate limited) reads as "no releases yet" rather than an error; the download page still works.
export function useReleases(game: GameInfo): Releases {
  const [releases, setReleases] = useState<Releases>(
    game.comingSoon ? { state: 'none' } : { state: 'loading' },
  )
  useEffect(() => {
    if (game.comingSoon) return
    let live = true
    fetch(`https://api.github.com/repos/eclancy/${game.repo}/releases?per_page=8`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(
        (
          data: {
            tag_name: string
            published_at: string
            body: string | null
            html_url: string
            draft: boolean
            assets: { name: string; size: number }[]
          }[],
        ) => {
          const list = data
            .filter((r) => !r.draft)
            .map((r) => {
              // The installer is what the download button gives; releases made before it
              // existed only have the zip.
              const zip =
                r.assets.find((a) => a.name === `${game.repo}-Setup.exe`) ??
                r.assets.find((a) => a.name === `${game.repo}-windows.zip`)
              return {
                version: r.tag_name.replace(/^v/, ''),
                date: r.published_at,
                notes: playerNotes(r.body),
                url: r.html_url,
                sizeMb: zip ? Math.round(zip.size / 1048576) : undefined,
              }
            })
          if (live) setReleases(list.length ? { state: 'ok', list } : { state: 'none' })
        },
      )
      .catch(() => live && setReleases({ state: 'none' }))
    return () => {
      live = false
    }
  }, [game.repo, game.comingSoon])
  return releases
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
