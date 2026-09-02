import { Hero } from './sections/Hero'
import { Expertise } from './sections/Expertise'
import { Projects } from './sections/Projects'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-violet-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <main className="mx-auto max-w-5xl px-6">
        <Hero />
        <Expertise />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
