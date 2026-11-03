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
import './the-one-he-missed.css'

const CLIPS = '/games/the-one-he-missed/clips/'

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

export default function TheOneHeMissedPage({ project }: GamePageProps) {
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
    document.title = gameSeo['the-one-he-missed'].title
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
    <div className="tohm-page-root">
      <div ref={stars} className="tohm-stars" aria-hidden="true" />
      <div className="tohm-fog" aria-hidden="true" />

      <a className="tohm-skip" href="#tohm-main">
        Skip to content
      </a>
      <nav className="tohm-topbar" aria-label="Site">
        <a href="/" className="tohm-topbar__home">
          <span aria-hidden="true">←</span> ecec.dev
        </a>
        <a href={`/#project-${project.id}`} className="tohm-topbar__link">
          All projects
        </a>
      </nav>

      <header className="tohm-hero">
        <h1 className="tohm-sr">The One He Missed</h1>
        <TitleArt />
        <div className="tohm-plaque">
          <p className="tohm-plaque__tag">
            You move. <em>Your spells fire themselves.</em>
          </p>
          <p className="tohm-plaque__sub">
            A roguelite auto-shooter in a moonlit, haunted wood. Every sprite and every
            sound made by code.
          </p>
          <div className="tohm-plaque__actions">
            <a
              className="tohm-btn tohm-btn--gold tohm-btn--big"
              href={downloadPath(project)}
            >
              <span className="tohm-btn__glyph" aria-hidden="true">
                ⬇
              </span>
              Download free
            </a>
            <a className="tohm-btn tohm-btn--stone" href="#tohm-try">
              Play the demo
            </a>
          </div>
          <p className="tohm-plaque__meta">
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
          <UpdatesLink className="tohm-updates-link" />
        </div>
      </header>

      <main id="tohm-main">
        <section id="tohm-try" className="tohm-section" aria-labelledby="tohm-try-title">
          <div className="tohm-heading">
            <p className="tohm-eyebrow">Try it here</p>
            <h2 id="tohm-try-title">Thirty seconds in the wood</h2>
            <p className="tohm-lede">
              A tiny version of the game, with its own sprites. You start with Chain
              Lightning; the dead drop light, and every level you get to pick another
              spell.
            </p>
          </div>
          <SurviveDemo />
        </section>

        <section className="tohm-section" aria-labelledby="tohm-clips-title">
          <div className="tohm-heading">
            <p className="tohm-eyebrow">How it plays</p>
            <h2 id="tohm-clips-title">From the field</h2>
          </div>
          <div className="tohm-clips">
            {clips.map((clip) => (
              <figure key={clip.name} className="tohm-clip">
                <div className="tohm-frame">
                  <LoopVideo
                    src={`${CLIPS}${clip.name}.mp4`}
                    poster={`${CLIPS}${clip.name}.jpg`}
                    label={clip.label}
                    width={clip.name === 'levelup' ? 1280 : 960}
                    height={clip.name === 'levelup' ? 720 : 540}
                    className="tohm-clip__video"
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

        <section className="tohm-section tohm-wall" aria-labelledby="tohm-grimoire-title">
          <div className="tohm-heading">
            <p className="tohm-eyebrow">The grimoire</p>
            <h2 id="tohm-grimoire-title">Thirty spells, twelve elements</h2>
            <p className="tohm-lede">
              Elements stack: carry enough of one and it starts to pay you back. Pick an
              element to see which spells carry it.
            </p>
          </div>
          <Grimoire />
        </section>

        <section className="tohm-section" aria-labelledby="tohm-about-title">
          <div className="tohm-about">
            <div className="tohm-page tohm-about__page">
              <h2 id="tohm-about-title">About the game</h2>
              {game.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ul className="tohm-facts" aria-label="By the numbers">
              {facts.map(([n, what]) => (
                <li key={what}>
                  <span className="tohm-facts__n">{n}</span>
                  <span className="tohm-facts__what">{what}</span>
                </li>
              ))}
              <li className="tohm-facts__note">
                all of the art and sound generated by code
              </li>
            </ul>
          </div>
        </section>

        {images.length > 0 && (
          <section className="tohm-section" aria-labelledby="tohm-shots-title">
            <div className="tohm-heading">
              <p className="tohm-eyebrow">Stills</p>
              <h2 id="tohm-shots-title">Screenshots</h2>
            </div>
            <ul className="tohm-shots">
              {images.map((image, i) => (
                <li key={image.src}>
                  <button type="button" className="tohm-shot" onClick={() => setShown(i)}>
                    <img src={image.src} alt={image.alt} loading="lazy" />
                    <span className="tohm-sr">Enlarge</span>
                  </button>
                </li>
              ))}
            </ul>
            <Lightbox
              images={images}
              index={shown}
              onIndexChange={setShown}
              onClose={() => setShown(null)}
              label="The One He Missed screenshots"
            />
          </section>
        )}

        <section className="tohm-section tohm-split" aria-label="Controls and what's new">
          <div className="tohm-panel tohm-controls">
            <h2>Controls</h2>
            <dl>
              <div>
                <dt>
                  <span className="tohm-kbd">W</span>
                  <span className="tohm-kbd">A</span>
                  <span className="tohm-kbd">S</span>
                  <span className="tohm-kbd">D</span> or{' '}
                  <span className="tohm-kbd">←↑↓→</span>
                </dt>
                <dd>Move. That is the whole job.</dd>
              </div>
              <div>
                <dt>
                  <span className="tohm-kbd">Left stick</span>
                </dt>
                <dd>Move, on an Xbox controller</dd>
              </div>
              <div>
                <dt>
                  <span className="tohm-kbd">Enter</span>{' '}
                  <span className="tohm-kbd">Ⓐ</span>
                </dt>
                <dd>Choose a card at a level-up</dd>
              </div>
              <div>
                <dt>
                  <span className="tohm-kbd">Esc</span>{' '}
                  <span className="tohm-kbd">Start</span>
                </dt>
                <dd>Pause, and read your build</dd>
              </div>
            </dl>
            <p className="tohm-controls__note">
              Spells aim and fire by themselves. You choose where to stand.
            </p>
          </div>

          <div className="tohm-panel tohm-news">
            <h2>What&rsquo;s new</h2>
            {releases.state === 'loading' && (
              <p className="tohm-muted">Reading the latest notes…</p>
            )}
            {releases.state === 'none' && (
              <p className="tohm-muted">
                The release notes are on{' '}
                <a href={`https://github.com/eclancy/${game.repo}/releases`}>GitHub</a>.
              </p>
            )}
            {releases.state === 'ok' && (
              <ol className="tohm-news__list">
                {releases.list.slice(0, 4).map((release) => (
                  <li key={release.version}>
                    <p className="tohm-news__head">
                      <a href={release.url}>v{release.version}</a>
                      <span>{formatDate(release.date)}</span>
                    </p>
                    {release.notes && <p className="tohm-news__notes">{release.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
            <a
              className="tohm-news__all"
              href={`https://github.com/eclancy/${game.repo}/releases`}
            >
              Every version →
            </a>
            <UpdatesSignup
              game={project.id}
              name={project.name}
              className="tohm-signup"
            />
          </div>
        </section>

        <section className="tohm-section tohm-final" aria-labelledby="tohm-final-title">
          <h2 id="tohm-final-title">Step into the circle</h2>
          <p>Free for Windows, Linux and Android.</p>
          <a
            className="tohm-btn tohm-btn--gold tohm-btn--big"
            href={downloadPath(project)}
          >
            <span className="tohm-btn__glyph" aria-hidden="true">
              ⬇
            </span>
            Download free
          </a>
        </section>
      </main>

      <footer className="tohm-footer">
        <img
          src="/games/the-one-he-missed/art/divider.png"
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
        <p className="tohm-footer__small">
          Made by Eric Clancy. The code is source-available; the art, least of all the
          Sketchbook&rsquo;s, is not for reuse.
        </p>
      </footer>
    </div>
  )
}
