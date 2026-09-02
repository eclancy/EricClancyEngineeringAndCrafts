import { profile } from '../data/linkedin'
import { colorAt } from '../lib/palette'

export function Expertise() {
  return (
    <section
      id="expertise"
      aria-labelledby="expertise-heading"
      className="border-t border-fuchsia-500/20 py-20"
    >
      <h2 id="expertise-heading" className="text-3xl font-bold text-slate-100">
        What I bring 🛠️
      </h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {profile.skills.map((skill, index) => {
          const color = colorAt(index)
          return (
            <li
              key={skill}
              className={`rounded-2xl border bg-slate-900/60 p-6 font-medium text-slate-200 transition hover:-translate-y-0.5 ${color.border}`}
            >
              <span className={color.text}>{skill}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
