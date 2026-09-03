import { profile } from '../data/linkedin'
import { EcecLogo } from './EcecLogo'

export function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 text-sm text-slate-500">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-6">
        <EcecLogo layout="horizontal-descriptor" size={36} />
        <p>
          &copy; {new Date().getFullYear()} {profile.name}. Built with React and TypeScript.
        </p>
      </div>
    </footer>
  )
}
