import { useEffect, useState } from 'react'
import type { GameInfo, Project } from '../data/projects'
import { gameSeo } from '../data/seo'
import { EcecLogo } from '../components/EcecLogo'
import { Footer } from '../components/Footer'
import { ImageCarousel } from '../components/ImageCarousel'
import { Lightbox } from '../components/Lightbox'

export function GamePage({ project }: { project: Project & { game: GameInfo } }) {
  const { game } = project
  const images = project.images ?? []
  const shots = images.slice(1)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    document.title = gameSeo[project.id]?.title ?? `${project.name} | ECEC`
  }, [project.id, project.name])

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
              {game.platform ?? 'Windows'} · {game.players}
            </p>
            <h1
              id="game-heading"
              className="text-4xl font-extrabold text-slate-100 sm:text-5xl"
            >
              {project.name}
            </h1>
            <p className="text-lg text-violet-300">{project.tagline}</p>
            <p className="mt-2 rounded-xl border border-dashed border-fuchsia-400/50 px-5 py-4 text-center text-lg font-bold text-fuchsia-200 sm:max-w-sm">
              <span aria-hidden="true">⏳</span> Coming soon
            </p>
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
              </p>
            )}
          </section>

          <section aria-labelledby="soon-heading">
            <h2 id="soon-heading" className="text-2xl font-bold text-slate-100">
              Coming soon
            </h2>
            <p className="mt-4 text-slate-400">
              {project.name} is still being made. Check back soon.
            </p>
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
