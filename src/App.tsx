import { Hero } from './sections/Hero'
import { Expertise } from './sections/Expertise'
import { CareerHighlights } from './sections/CareerHighlights'
import { Projects } from './sections/Projects'
import { Crafts } from './sections/Crafts'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Footer } from './components/Footer'
import { AnnouncementBanner } from './components/AnnouncementBanner'
import { SiteHeader } from './components/SiteHeader'

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-violet-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <AnnouncementBanner />
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6">
        <Hero />
        <Projects />
        <Crafts />
        <Expertise />
        <CareerHighlights />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
