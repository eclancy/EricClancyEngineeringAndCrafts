import { useEffect, useRef, useState } from 'react'
import type { GamePageProps } from '../types'
import { downloadPath } from '../../../data/projects'
import { formatDate, useReleases } from '../../../lib/releases'
import { useGoogleFonts } from '../../../lib/useGoogleFonts'
import { LoopVideo } from '../../../components/LoopVideo'
import { Lightbox } from '../../../components/Lightbox'
import { UpdatesSignup } from '../../../components/UpdatesSignup'
import { UpdatesLink } from '../../../components/UpdatesLink'
import { TitleArt } from './TitleArt'
import { SurviveDemo } from './SurviveDemo'
import { Grimoire } from './Grimoire'
import { gameSeo } from '../../../data/seo'
import './wizard-survivors.css'

const CLIPS = '/games/wizard-survivors/clips/'

const clips = [
  {
    name: 'spells',
    title: 'The spells do the work',
    text: 'Chain lightning, meteors, scorching rays and black tentacles, all casting on their own while the Stormcaller keeps moving.',
    label:
      'Gameplay: a golden-robed wizard in a moonlit forest as chain lightning, falling meteors, scorching rays and a pool of black tentacles strike the skeletons around him.',
  },
  {
    name: 'levelup',
    title: 'Level up, choose, cast',
    text: 'Every level stops the clock and lays three torn pages on the stone. Pick one and it is firing a moment later.',
    label:
      'Gameplay: the level-up screen shows three parchment spell cards on a stone wall; one is chosen and the new spell starts casting in the fight.',
  },
  {
    name: 'boss',
    title: 'Mother Rot',
    text: 'Fifteen minutes in, the chapter boss arrives. Each of the nine is built around one idea; she heals from everything she sheds.',
    label:
      'Gameplay: the Blighted Swamp boss Mother Rot, a huge grey mound covered in green boils, fights the Geomancer under meteors and black tentacles.',
  },
  {
    name: 'sketchbook',
    title: 'The Sketchbook',
    text: 'One chapter on lined paper, its monsters drawn by kids and used exactly as drawn.',
    label:
      'Gameplay: the Sketchbook chapter, a lined-paper world with doodled houses and stick figures, where the Frostweaver casts ice spikes and lightning at crayon monsters drawn by children.',
  },
]

const facts: [string, string][] = [
  ['8', 'chapters'],
  ['9', 'bosses'],
  ['30', 'spells'],
  ['7', 'wizards'],
  ['29', 'relics'],
  ['14', 'boons'],
  ['506', 'sprites'],
  ['69', 'sounds'],
]

export default function WizardSurvivorsPage({ project }: GamePageProps) {
  const game = project.game
  const releases = useReleases(game)
  const latest = releases.state === 'ok' ? releases.list[0] : undefined
  const images = project.images ?? []
  const [shown, setShown] = useState<number | null>(null)
  const stars = useRef<HTMLDivElement>(null)

  useGoogleFonts([
    'Pixelify Sans:wght@400;500;700',
    'Cinzel:wght@500;700',
    'Alegreya:ital,wght@0,400;0,500;1,400',
  ])

  useEffect(() => {
    document.title = gameSeo['wizard-survivors'].title
  }, [])

  // The starfield drifts at a fraction of the scroll, behind everything.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        stars.current?.style.setProperty(
          '--drift',
          `${Math.round(window.scrollY * -0.25)}px`,
        )
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="ws-page-root">
      <div ref={stars} className="ws-stars" aria-hidden="true" />
      <div className="ws-fog" aria-hidden="true" />

      <a className="ws-skip" href="#ws-main">
        Skip to content
      </a>
      <nav className="ws-topbar" aria-label="Site">
        <a href="/" className="ws-topbar__home">
          <span aria-hidden="true">←</span> ecec.dev
        </a>
        <a href={`/#project-${project.id}`} className="ws-topbar__link">
          All projects
        </a>
      </nav>

      <header className="ws-hero">
        <h1 className="ws-sr">Wizard Survivors</h1>
        <TitleArt />
        <div className="ws-plaque">
          <p className="ws-plaque__tag">
            You move. <em>Your spells fire themselves.</em>
          </p>
          <p className="ws-plaque__sub">
            A roguelite auto-shooter in a moonlit, haunted wood. Every sprite and every
            sound made by code.
          </p>
          <div className="ws-plaque__actions">
            <a className="ws-btn ws-btn--gold ws-btn--big" href={downloadPath(project)}>
              <span className="ws-btn__glyph" aria-hidden="true">
                ⬇
              </span>
              Download free
            </a>
            <a className="ws-btn ws-btn--stone" href="#ws-try">
              Play the demo
            </a>
          </div>
          <p className="ws-plaque__meta">
            {latest ? (
              <>
                Version {latest.version} · {formatDate(latest.date)}
                {latest.sizeMb ? ` · ${latest.sizeMb} MB` : ''}
              </>
            ) : releases.state === 'loading' ? (
              'Checking for the latest version…'
            ) : (
              'Free'
            )}
            <span aria-hidden="true"> · </span>
            {game.platform ?? 'Windows'} · {game.players} · keyboard, controller or touch
          </p>
          <UpdatesLink className="ws-updates-link" />
        </div>
      </header>

      <main id="ws-main">
        <section id="ws-try" className="ws-section" aria-labelledby="ws-try-title">
          <div className="ws-heading">
            <p className="ws-eyebrow">Try it here</p>
            <h2 id="ws-try-title">Thirty seconds in the wood</h2>
            <p className="ws-lede">
              A tiny version of the game, with its own sprites. You start with Chain
              Lightning; the dead drop light, and every level you get to pick another
              spell.
            </p>
          </div>
          <SurviveDemo />
        </section>

        <section className="ws-section" aria-labelledby="ws-clips-title">
          <div className="ws-heading">
            <p className="ws-eyebrow">How it plays</p>
            <h2 id="ws-clips-title">From the field</h2>
          </div>
          <div className="ws-clips">
            {clips.map((clip) => (
              <figure key={clip.name} className="ws-clip">
                <div className="ws-frame">
                  <LoopVideo
                    src={`${CLIPS}${clip.name}.mp4`}
                    poster={`${CLIPS}${clip.name}.jpg`}
                    label={clip.label}
                    width={clip.name === 'levelup' ? 1280 : 960}
                    height={clip.name === 'levelup' ? 720 : 540}
                    className="ws-clip__video"
                  />
                </div>
                <figcaption>
                  <strong>{clip.title}</strong>
                  {clip.text}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="ws-section ws-wall" aria-labelledby="ws-grimoire-title">
          <div className="ws-heading">
            <p className="ws-eyebrow">The grimoire</p>
            <h2 id="ws-grimoire-title">Thirty spells, twelve elements</h2>
            <p className="ws-lede">
              Elements stack: carry enough of one and it starts to pay you back. Pick an
              element to see which spells carry it.
            </p>
          </div>
          <Grimoire />
        </section>

        <section className="ws-section" aria-labelledby="ws-about-title">
          <div className="ws-about">
            <div className="ws-page ws-about__page">
              <h2 id="ws-about-title">About the game</h2>
              {game.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ul className="ws-facts" aria-label="By the numbers">
              {facts.map(([n, what]) => (
                <li key={what}>
                  <span className="ws-facts__n">{n}</span>
                  <span className="ws-facts__what">{what}</span>
                </li>
              ))}
              <li className="ws-facts__note">
                all of the art and sound generated by code
              </li>
            </ul>
          </div>
        </section>

        {images.length > 0 && (
          <section className="ws-section" aria-labelledby="ws-shots-title">
            <div className="ws-heading">
              <p className="ws-eyebrow">Stills</p>
              <h2 id="ws-shots-title">Screenshots</h2>
            </div>
            <ul className="ws-shots">
              {images.map((image, i) => (
                <li key={image.src}>
                  <button type="button" className="ws-shot" onClick={() => setShown(i)}>
                    <img src={image.src} alt={image.alt} loading="lazy" />
                    <span className="ws-sr">Enlarge</span>
                  </button>
                </li>
              ))}
            </ul>
            <Lightbox
              images={images}
              index={shown}
              onIndexChange={setShown}
              onClose={() => setShown(null)}
              label="Wizard Survivors screenshots"
            />
          </section>
        )}

        <section className="ws-section ws-split" aria-label="Controls and what's new">
          <div className="ws-panel ws-controls">
            <h2>Controls</h2>
            <dl>
              <div>
                <dt>
                  <span className="ws-kbd">W</span>
                  <span className="ws-kbd">A</span>
                  <span className="ws-kbd">S</span>
                  <span className="ws-kbd">D</span> or{' '}
                  <span className="ws-kbd">←↑↓→</span>
                </dt>
                <dd>Move. That is the whole job.</dd>
              </div>
              <div>
                <dt>
                  <span className="ws-kbd">Left stick</span>
                </dt>
                <dd>Move, on an Xbox controller</dd>
              </div>
              <div>
                <dt>
                  <span className="ws-kbd">Enter</span> <span className="ws-kbd">Ⓐ</span>
                </dt>
                <dd>Choose a card at a level-up</dd>
              </div>
              <div>
                <dt>
                  <span className="ws-kbd">Esc</span>{' '}
                  <span className="ws-kbd">Start</span>
                </dt>
                <dd>Pause, and read your build</dd>
              </div>
            </dl>
            <p className="ws-controls__note">
              Spells aim and fire by themselves. You choose where to stand.
            </p>
          </div>

          <div className="ws-panel ws-news">
            <h2>What&rsquo;s new</h2>
            {releases.state === 'loading' && (
              <p className="ws-muted">Reading the latest notes…</p>
            )}
            {releases.state === 'none' && (
              <p className="ws-muted">
                The release notes are on{' '}
                <a href={`https://github.com/eclancy/${game.repo}/releases`}>GitHub</a>.
              </p>
            )}
            {releases.state === 'ok' && (
              <ol className="ws-news__list">
                {releases.list.slice(0, 4).map((release) => (
                  <li key={release.version}>
                    <p className="ws-news__head">
                      <a href={release.url}>v{release.version}</a>
                      <span>{formatDate(release.date)}</span>
                    </p>
                    {release.notes && <p className="ws-news__notes">{release.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
            <a
              className="ws-news__all"
              href={`https://github.com/eclancy/${game.repo}/releases`}
            >
              Every version →
            </a>
            <UpdatesSignup game={project.id} name={project.name} className="ws-signup" />
          </div>
        </section>

        <section className="ws-section ws-final" aria-labelledby="ws-final-title">
          <h2 id="ws-final-title">Step into the circle</h2>
          <p>Free for Windows, Linux and Android.</p>
          <a className="ws-btn ws-btn--gold ws-btn--big" href={downloadPath(project)}>
            <span className="ws-btn__glyph" aria-hidden="true">
              ⬇
            </span>
            Download free
          </a>
        </section>
      </main>

      <footer className="ws-footer">
        <img
          src="/games/wizard-survivors/art/divider.png"
          alt=""
          width={96}
          height={24}
        />
        <p>
          <a href="/">ecec.dev</a>
          <span aria-hidden="true"> · </span>
          {project.repoUrl && <a href={project.repoUrl}>Source on GitHub</a>}
          <span aria-hidden="true"> · </span>
          <a href={`https://github.com/eclancy/${game.repo}/releases`}>All versions</a>
          <span aria-hidden="true"> · </span>
          <a href="/privacy">Privacy</a>
        </p>
        <p className="ws-footer__small">
          Made by Eric Clancy. The code is source-available; the art, least of all the
          Sketchbook&rsquo;s, is not for reuse.
        </p>
      </footer>
    </div>
  )
}
