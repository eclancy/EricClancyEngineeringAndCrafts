import { profile } from '../data/linkedin'

export function Expertise() {
  return (
    <section
      id="expertise"
      aria-labelledby="expertise-heading"
      className="border-t border-slate-800 py-20"
    >
      <h2 id="expertise-heading" className="text-3xl font-bold text-slate-100">
        What I bring
      </h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {profile.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300"
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}
