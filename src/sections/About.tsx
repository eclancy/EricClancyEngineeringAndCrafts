import { profile } from '../data/linkedin'

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-cyan-500/20 py-20"
    >
      <h2 id="about-heading" className="text-3xl font-bold text-slate-100">
        About <span className="ecec-emoji ecec-emoji-wave">👋</span>
      </h2>
      <div className="mt-6 max-w-3xl space-y-4 text-slate-400">
        <p>{profile.summary}</p>
        <p>
          {profile.experienceBlurb}{' '}
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-cyan-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            See the full history →
          </a>
        </p>
      </div>
    </section>
  )
}
