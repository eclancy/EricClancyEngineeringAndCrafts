import type { Project } from '../data/projects'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [hero, ...gallery] = project.images ?? []

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
        {project.tech.map((tech) => (
          <li
            key={tech}
            className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300"
          >
            {tech}
          </li>
        ))}
      </ul>
      {gallery.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={`${project.name} screenshots`}>
          {gallery.map((image) => (
            <li key={image.src}>
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-16 w-16 rounded-lg border border-slate-800 bg-slate-950 object-contain"
              />
            </li>
          ))}
        </ul>
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
