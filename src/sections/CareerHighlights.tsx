export function CareerHighlights() {
  return (
    <section
      id="career-highlights"
      aria-labelledby="career-highlights-heading"
      className="border-t border-cyan-500/20 py-20"
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Experience</p>
      <h2 id="career-highlights-heading" className="mt-2 text-3xl font-bold text-slate-100">
        What matters in my work <span className="ecec-emoji ecec-emoji-rocket">🚀</span>
      </h2>
      <p className="mt-5 max-w-3xl leading-relaxed text-slate-400">
        For 11+ years, I&apos;ve helped teams deliver software that people depend on. In my current
        Booz Allen Hamilton role, the platforms I help modernize serve millions of veterans, while
        tens of thousands of medical professionals use them every day.
      </p>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        <li className="border-l-2 border-cyan-400 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-slate-100">End-to-end innovation</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            I connect the work from early opportunity and architecture through production release,
            keeping technical decisions practical and outcomes in view.
          </p>
        </li>
        <li className="border-l-2 border-fuchsia-400 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-slate-100">AI-enabled teams</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            I help teams use AI-assisted workflows, modern coding standards, and CI/CD automation
            to spend more time on the decisions that need people.
          </p>
        </li>
        <li className="border-l-2 border-violet-400 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-slate-100">Agile that moves work forward</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            I facilitate planning and alignment across client stakeholders, UX partners, and
            engineering teams so good ideas become shippable work.
          </p>
        </li>
        <li className="border-l-2 border-amber-400 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-slate-100">Systems people can trust</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            From healthcare and payments to public-sector software, I focus on reliable services,
            thoughtful user experiences, and the infrastructure behind both.
          </p>
        </li>
      </ul>
    </section>
  )
}