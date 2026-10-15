import { useEffect, useState } from 'react'
import { downloadPath, type GameInfo, type Project } from '../data/projects'
import { colorAt } from '../lib/palette'
import { EcecLogo } from '../components/EcecLogo'
import { Footer } from '../components/Footer'
import { ImageCarousel } from '../components/ImageCarousel'
import { Lightbox } from '../components/Lightbox'

interface Release {
  version: string
  date: string
  notes: string
  url: string
  sizeMb?: number
}

type Releases =
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
function useReleases(game: GameInfo): Releases {
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
              const zip = r.assets.find((a) => a.name === `${game.repo}-windows.zip`)
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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export function GamePage({ project }: { project: Project & { game: GameInfo } }) {
  const { game } = project
  const releases = useReleases(game)
  const images = project.images ?? []
  const shots = images.slice(1)
  const [expanded, setExpanded] = useState<number | null>(null)
  const latest = releases.state === 'ok' ? releases.list[0] : undefined

  useEffect(() => {
    document.title = `${project.name} | ECEC`
  }, [project.name])

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6">
        <EcecLogo href="/" size={36} />
        <a
          href={`/#project-${project.id}`}
          className="text-sm font-medium text-slate-400 transition hover:text-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
        >
          ← All projects
        </a>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section
          aria-labelledby="game-heading"
          className="grid items-center gap-10 py-8 lg:grid-cols-2"
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
              Free · {game.platform ?? 'Windows'} · {game.players}
            </p>
            <h1
              id="game-heading"
              className="text-4xl font-extrabold text-slate-100 sm:text-5xl"
            >
              {project.name}
            </h1>
            <p className="text-lg text-violet-300">{project.tagline}</p>
            <ul
              className="flex flex-wrap gap-2"
              aria-label={`${project.name} tech stack`}
            >
              {project.tech.map((tech, index) => (
                <li
                  key={tech}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${colorAt(index).chip}`}
                >
                  {tech}
                </li>
              ))}
            </ul>
            {game.comingSoon ? (
              <p className="mt-2 rounded-xl border border-dashed border-fuchsia-400/50 px-5 py-4 text-center text-lg font-bold text-fuchsia-200 sm:max-w-sm">
                <span aria-hidden="true">⏳</span> Coming soon
              </p>
            ) : (
              <a
                href={downloadPath(project)}
                className="ecec-cta group mt-2 flex items-center justify-center gap-3 rounded-xl px-5 py-4 text-lg font-extrabold tracking-wide text-white transition hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300 sm:max-w-sm"
              >
                <span aria-hidden="true" className="ecec-cta-emoji text-2xl">
                  🎮
                </span>
                <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  Download & play
                </span>
                <span
                  aria-hidden="true"
                  className="text-xl transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            )}
            {!game.comingSoon && (
              <p className="text-sm text-slate-500" aria-live="polite">
                {latest
                  ? `Version ${latest.version} · ${formatDate(latest.date)}${
                      latest.sizeMb ? ` · ${latest.sizeMb} MB` : ''
                    } · updates itself`
                  : releases.state === 'none'
                    ? 'Keeps itself up to date once installed'
                    : ' '}
              </p>
            )}
            {game.feature && (
              <a
                href={game.feature.href}
                className="ecec-cta-alt group flex items-center justify-center gap-3 rounded-xl px-5 py-4 text-lg font-extrabold tracking-wide text-white transition hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:max-w-sm"
              >
                <span aria-hidden="true" className="ecec-cta-emoji text-2xl">
                  {game.feature.emoji}
                </span>
                <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  {game.feature.label}
                </span>
                <span
                  aria-hidden="true"
                  className="text-xl transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            )}
          </div>
          <ImageCarousel
            images={images}
            name={project.name}
            className="rounded-2xl border border-slate-800 shadow-2xl shadow-violet-950/40"
          />
        </section>

        {game.feature && (
          <section
            aria-labelledby="feature-heading"
            className="ecec-paper mb-12 flex flex-col items-start gap-5 rounded-2xl py-8 pl-12 pr-7 text-slate-900 shadow-2xl shadow-black/40 sm:flex-row sm:items-center sm:justify-between sm:pl-14"
          >
            <div className="max-w-xl">
              <h2 id="feature-heading" className="text-3xl font-extrabold">
                <span aria-hidden="true">{game.feature.emoji}</span> {game.feature.title}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700">
                {game.feature.text}
              </p>
              {game.feature.more && (
                <a
                  href={game.feature.more.href}
                  className="mt-3 inline-block text-sm font-semibold text-blue-700 underline-offset-4 hover:underline"
                >
                  {game.feature.more.label} →
                </a>
              )}
            </div>
            <a
              href={game.feature.href}
              className="shrink-0 rounded-md border-[2.5px] border-slate-900 bg-blue-600 px-6 py-4 text-xl font-extrabold text-white shadow-[4px_4px_0_#0f172a] transition hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_#0f172a] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#0f172a] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-yellow-300"
            >
              {game.feature.label} →
            </a>
          </section>
        )}

        <div className="grid gap-12 border-t border-violet-500/20 pt-12 lg:grid-cols-[3fr_2fr]">
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-2xl font-bold text-slate-100">
              About the game
            </h2>
            <div className="mt-4 flex flex-col gap-4 leading-relaxed text-slate-300">
              {game.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {project.repoUrl && (
              <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-violet-300 underline-offset-4 hover:underline"
                >
                  Source code on GitHub →
                </a>
                <a
                  href={`https://github.com/eclancy/${game.repo}/releases`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-violet-300 underline-offset-4 hover:underline"
                >
                  Every version →
                </a>
              </p>
            )}
          </section>

          <section aria-labelledby="versions-heading">
            <h2 id="versions-heading" className="text-2xl font-bold text-slate-100">
              What's new
            </h2>
            {releases.state === 'loading' && (
              <p className="mt-4 text-slate-500">Loading…</p>
            )}
            {releases.state === 'none' && (
              <p className="mt-4 text-slate-400">
                {game.comingSoon
                  ? `${project.name} is still being made. Check back soon.`
                  : 'No versions published yet. The first one is on its way.'}
              </p>
            )}
            {releases.state === 'ok' && (
              <ol className="mt-4 flex flex-col gap-4">
                {releases.list.map((release, index) => (
                  <li
                    key={release.version}
                    className={`rounded-xl border p-4 ${
                      index === 0
                        ? 'border-fuchsia-500/50 bg-fuchsia-500/5'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <p className="flex flex-wrap items-baseline justify-between gap-2">
                      <a
                        href={release.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-semibold text-slate-100 underline-offset-4 hover:underline"
                      >
                        Version {release.version}
                        {index === 0 && (
                          <span className="ml-2 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-xs text-fuchsia-200">
                            latest
                          </span>
                        )}
                      </a>
                      <time dateTime={release.date} className="text-xs text-slate-500">
                        {formatDate(release.date)}
                      </time>
                    </p>
                    {release.notes && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-400">
                        {release.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {shots.length > 0 && (
          <section aria-labelledby="shots-heading" className="mt-16">
            <h2 id="shots-heading" className="text-2xl font-bold text-slate-100">
              Screenshots
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {shots.map((image, i) => (
                <li key={image.src}>
                  <button
                    type="button"
                    onClick={() => setExpanded(i + 1)}
                    aria-label={`View full screen: ${image.alt}`}
                    className="block w-full overflow-hidden rounded-xl border border-slate-800 transition hover:border-violet-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                  >
                    <img
                      src={image.src}
                      alt=""
                      loading="lazy"
                      className="aspect-[16/10] w-full bg-slate-900 object-cover transition duration-300 hover:scale-[1.03]"
                    />
                  </button>
                </li>
              ))}
            </ul>
            <Lightbox
              images={images}
              index={expanded}
              onIndexChange={setExpanded}
              onClose={() => setExpanded(null)}
              label={`${project.name} pictures`}
            />
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
