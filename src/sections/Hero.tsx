import { profile } from '../data/linkedin'
import { SocialLinks } from '../components/SocialLinks'

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="flex min-h-[80vh] flex-col justify-center gap-6 py-24"
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
        {profile.headline}
      </p>
      <h1 id="hero-heading" className="text-4xl font-bold text-slate-100 sm:text-6xl">
        Hi, I'm {profile.name.split(' ')[0]} — I build software with AI, start to finish.
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
        {profile.summary}
      </p>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <a
          href="#projects"
          className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
        >
          See my work
        </a>
        <SocialLinks profile={profile} />
      </div>
    </section>
  )
}
