import { profile } from '../data/linkedin'

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-slate-800 py-20"
    >
      <h2 id="about-heading" className="text-3xl font-bold text-slate-100">
        About
      </h2>
      <div className="mt-6 max-w-3xl space-y-4 text-slate-400">
        <p>{profile.summary}</p>
        {profile.experience.map((exp) => (
          <div key={`${exp.organization}-${exp.role}`}>
            <h3 className="font-semibold text-slate-200">
              {exp.role} · {exp.organization}
            </h3>
            <p className="text-sm text-slate-500">{exp.period}</p>
            <p>{exp.summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
