import { useState } from 'react'
import type { Project } from '../data/projects'
import { colorAt } from '../lib/palette'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [open, setOpen] = useState(false)
  const [hero, ...gallery] = project.images ?? []
  const hasGallery = gallery.length > 0

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/20 transition hover:border-violet-500/60">
      {hero && (
        <img
          src={hero.src}
          alt={hero.alt}
          loading="lazy"
          className={`mb-1 aspect-[16/10] w-full rounded-xl bg-slate-950 ${
            hero.fit === 'contain' ? 'object-contain' : 'object-cover'
          }`}
        />
      )}
      <h3 className="text-xl font-semibold text-slate-100">{project.name}</h3>
      <p className="text-sm text-violet-300">{project.tagline}</p>
      <p className="text-sm leading-relaxed text-slate-400">{project.description}</p>
      <ul className="flex flex-wrap gap-2" aria-label={`${project.name} tech stack`}>
        {project.tech.map((tech, index) => (
          <li
            key={tech}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${colorAt(index).chip}`}
          >
            {tech}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap gap-3 text-sm font-medium">
        {hasGallery && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/60 px-3 py-2 text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            Screenshots
            <span aria-hidden="true">{open ? '▲' : '▼'}</span>
          </button>
        )}
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
            Live demo
          </a>
        )}
      </div>
      {hasGallery && (
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-out ${
            open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <ul
              className="grid grid-cols-2 gap-2 overflow-hidden"
              aria-label={`${project.name} additional screenshots`}
            >
              {gallery.map((image) => (
                <li key={image.src}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-24 w-full rounded-lg object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  )
}
