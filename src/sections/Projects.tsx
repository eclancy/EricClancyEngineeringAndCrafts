import { projects } from '../data/projects'
import { ProjectCard } from '../components/ProjectCard'

export function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="border-t border-violet-500/20 py-20"
    >
      <h2 id="projects-heading" className="text-3xl font-bold text-slate-100">
        Featured (Personal) Projects 🚀
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
