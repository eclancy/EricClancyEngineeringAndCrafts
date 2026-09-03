import { profile } from '../data/linkedin'
import { SocialLinks } from '../components/SocialLinks'

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="flex flex-col pb-20 pt-4 sm:pt-6"
    >
      <div className="flex items-center gap-3" aria-label="Eric Clancy Engineering and Crafts">
        <span
          aria-hidden="true"
          className="relative h-11 w-14 font-mono font-bold leading-none"
        >
          <span className="absolute bottom-0 left-0 h-px w-full bg-fuchsia-300/70" />
          <span className="absolute bottom-0 left-1 h-9 w-px bg-cyan-300/70" />
          <span className="absolute left-2 top-0 text-4xl text-cyan-200">E</span>
          <span className="absolute left-7 top-1 text-3xl text-fuchsia-200">C</span>
          <span className="absolute bottom-1 left-8 text-[10px] text-fuchsia-200">E</span>
          <span className="absolute bottom-1 right-1 text-[10px] text-cyan-200">C</span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
          Eric Clancy Engineering &amp; Crafts
        </span>
      </div>
      <div className="mt-12 flex flex-col gap-5 sm:mt-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-fuchsia-400">
          {profile.headline}
        </p>
        <h1 id="hero-heading" className="max-w-3xl text-2xl font-bold text-slate-100 sm:text-4xl">
          Hi, I'm{' '}
          <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            {profile.name.split(' ')[0]}
          </span>
          . I build software with AI, start to finish.
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-slate-400">
          {profile.summary}
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="#projects"
            className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-fuchsia-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
          >
            See my work
          </a>
          <SocialLinks profile={profile} />
        </div>
      </div>
    </section>
  )
}
