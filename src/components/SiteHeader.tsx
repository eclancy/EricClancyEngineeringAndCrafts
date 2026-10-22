import { useEffect, useState } from 'react'
import { EcecLogo } from './EcecLogo'

// The home page's sections, in page order. Games come first: most visitors arrive to play one.
const links = [
  { href: '#projects', label: 'Games' },
  { href: '#crafts', label: 'Crafts' },
  { href: '#expertise', label: 'Experience' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

const linkClass =
  'rounded-full px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-violet-500/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300'

// Sticks to the top of the home page. On a phone the links fold into a menu button, since
// five of them beside the logo would not fit.
export function SiteHeader() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <EcecLogo layout="horizontal-descriptor" size={34} href="#home" />
        <nav aria-label="Main" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="grid size-10 place-items-center rounded-full text-slate-200 transition hover:bg-violet-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300 sm:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none">
            <path
              d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {open && (
        <nav
          id="site-menu"
          aria-label="Main"
          className="border-t border-slate-800/80 px-6 pb-4 pt-2 sm:hidden"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`${linkClass} block py-3 text-base`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
