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
          className="mb-1 h-40 w-full rounded-xl object-cover"
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
      {hasGallery && (
        <div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="text-sm font-medium text-cyan-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            {open ? 'Hide screenshots ▲' : 'See more screenshots ▼'}
          </button>
          <div
            className={`grid overflow-hidden transition-all duration-300 ease-out ${
              open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
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
      <div className="mt-2 flex gap-4 text-sm font-medium">
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-violet-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
          >
            View code
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-violet-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
          >
            Live demo
          </a>
        )}
      </div>
    </article>
  )
}
