import { projects } from '../data/projects'
import { AnimatedEmoji } from '../components/AnimatedEmoji'
import { ProjectCard } from '../components/ProjectCard'

// Everything that isn't a game: the miniatures site, for now.
export function Crafts() {
  return (
    <section
      id="crafts"
      aria-labelledby="crafts-heading"
      className="border-t border-violet-500/20 py-20"
    >
      <h2 id="crafts-heading" className="heading-fluid font-bold text-slate-100">
        Arts &amp; crafts{' '}
        <AnimatedEmoji emoji="🎨" animation="tools-pop" label="palette" />
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects
          .filter((project) => !project.game)
          .map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
      </div>
    </section>
  )
}
