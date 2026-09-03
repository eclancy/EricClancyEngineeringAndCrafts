import { profile } from '../data/linkedin'
import { EcecLogo } from './EcecLogo'

export function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
      <EcecLogo layout="horizontal-descriptor" size={32} className="mb-4" />
      <p>
        &copy; {new Date().getFullYear()} {profile.name}. Built with React, TypeScript,
        and AI pair-programming, start to finish.
      </p>
    </footer>
  )
}
