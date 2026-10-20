import { gamePath, platformsOf, type Project } from '../data/projects'
import { colorAt } from '../lib/palette'
import { prefetchGamePage } from '../pages/games/loaders'
import { ImageCarousel } from './ImageCarousel'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const pageUrl = project.game ? gamePath(project) : undefined
  // Start downloading the game page's own code as soon as a link to it is aimed at.
  const prefetch = {
    onPointerEnter: () => prefetchGamePage(project.id),
    onFocus: () => prefetchGamePage(project.id),
    onTouchStart: () => prefetchGamePage(project.id),
  }

  return (
    <article
      id={`project-${project.id}`}
      className="ecec-project-card flex scroll-mt-6 flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/20 transition hover:border-violet-500/60"
    >
      {project.images && (
        <ImageCarousel images={project.images} name={project.name} className="mb-1" />
      )}
      <h3 className="text-xl font-semibold text-slate-100">
        {pageUrl ? (
          <a
            href={pageUrl}
            {...prefetch}
            className="underline-offset-4 hover:text-violet-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
          >
            {project.name}
          </a>
        ) : (
          project.name
        )}
      </h3>
      <p className="text-sm text-violet-300">{project.tagline}</p>
      <p className="text-sm leading-relaxed text-slate-400">{project.description}</p>
      {/* Games show where they run; other projects show what they're built with. */}
      <ul
        className="flex flex-wrap gap-2"
        aria-label={
          project.game ? `${project.name} platforms` : `${project.name} tech stack`
        }
      >
        {(project.game ? platformsOf(project) : project.tech).map((tech, index) => (
          <li
            key={tech}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${colorAt(index).chip}`}
          >
            {tech}
          </li>
        ))}
      </ul>
      {/* Takes up any spare height, so the buttons sit at the bottom of every card in a row. */}
      <div className="-mt-3 flex-1" aria-hidden="true" />
      {project.callsToAction && project.callsToAction.length > 0 && (
        <div className="mt-2 grid gap-3">
          {project.callsToAction.map((cta) => (
            <a
              key={cta.href}
              href={cta.href}
              target="_blank"
              rel="noreferrer noopener"
              className="ecec-cta group flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-3.5 text-base font-extrabold text-white transition hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
            >
              {cta.emoji && (
                <span aria-hidden="true" className="ecec-cta-emoji text-xl">
                  {cta.emoji}
                </span>
              )}
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{cta.label}</span>
              <span
                aria-hidden="true"
                className="text-xl transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          ))}
        </div>
      )}
      {project.game?.comingSoon && (
        <p className="mt-2 rounded-xl border border-dashed border-fuchsia-400/50 px-4 py-3 text-center text-sm font-semibold text-fuchsia-200">
          <span aria-hidden="true">⏳</span> Coming soon
        </p>
      )}
      {/* Games keep their source link on their own page; the card's title opens that page. */}
      {!project.game && (
        <div className="mt-2 flex flex-wrap gap-3 text-sm font-medium">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center rounded-lg border border-violet-400/60 px-3 py-2 text-violet-200 transition hover:border-violet-300 hover:bg-violet-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
            >
              View code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center rounded-lg border border-violet-400/60 px-3 py-2 text-violet-200 transition hover:border-violet-300 hover:bg-violet-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
            >
              {project.liveLabel ?? 'Live demo'}
            </a>
          )}
        </div>
      )}
    </article>
  )
}
