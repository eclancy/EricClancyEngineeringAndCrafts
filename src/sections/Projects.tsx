import { projects } from '../data/projects'
import { AnimatedEmoji } from '../components/AnimatedEmoji'
import { ProjectCard } from '../components/ProjectCard'

// The games. Kept at #projects, which the announcement banner and the hero's "See my work" use.
export function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="border-t border-violet-500/20 py-20"
    >
      <h2 id="projects-heading" className="heading-fluid font-bold text-slate-100">
        Games I&apos;ve made{' '}
        <AnimatedEmoji emoji="🎮" animation="tools-pop" label="game controller" />
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects
          .filter((project) => project.game)
          .map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
      </div>
    </section>
  )
}
