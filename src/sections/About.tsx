import { profile } from '../data/linkedin'
import { AnimatedEmoji } from '../components/AnimatedEmoji'

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-cyan-500/20 py-20"
    >
      <h2 id="about-heading" className="text-3xl font-bold text-slate-100">
        About <AnimatedEmoji emoji="👋" animation="wave" label="waving hand" />
      </h2>
      <div className="mt-6 max-w-3xl space-y-4 text-slate-400">
        <p>
          My mantra is simple: we build software for humans. That means taking design into
          account from day one, so the user experience is part of the engineering rather
          than something added at the end.
        </p>
        <p>
          My work in healthcare has made that especially clear. Software should be
          intrinsic to use, responsive, and reliable enough to fade into the background,
          giving users more attention for what matters.
        </p>
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
