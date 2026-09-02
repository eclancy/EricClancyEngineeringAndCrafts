import type { Profile } from '../data/linkedin'

interface SocialLinksProps {
  profile: Profile
  className?: string
}

export function SocialLinks({ profile, className }: SocialLinksProps) {
  return (
    <ul className={`flex gap-4 ${className ?? ''}`}>
      <li>
        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-400 hover:text-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
        >
          <span aria-hidden="true">💻</span> GitHub
        </a>
      </li>
      <li>
        <a
          href={profile.linkedinUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-400 hover:text-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
        >
          <span aria-hidden="true">🔗</span> LinkedIn
        </a>
      </li>
    </ul>
  )
}
