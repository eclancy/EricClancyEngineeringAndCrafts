import { profile } from '../data/linkedin'
import { EcecLogo } from '../components/EcecLogo'
import { SocialLinks } from '../components/SocialLinks'

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="flex flex-col pb-20 pt-4 sm:pt-6"
    >
      <EcecLogo layout="horizontal-descriptor" size={42} href="#home" />
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
