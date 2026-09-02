import { profile } from '../data/linkedin'
import { SocialLinks } from '../components/SocialLinks'

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-slate-800 py-20"
    >
      <h2 id="contact-heading" className="text-3xl font-bold text-slate-100">
        Get in touch
      </h2>
      <p className="mt-4 max-w-xl text-slate-400">
        I'm open to full-stack and AI-focused roles — reach out on LinkedIn, check out my
        code on GitHub, or email me directly.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a
          href="mailto:hello@ecec.dev"
          className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
        >
          Email me
        </a>
        <SocialLinks profile={profile} />
      </div>
    </section>
  )
}
