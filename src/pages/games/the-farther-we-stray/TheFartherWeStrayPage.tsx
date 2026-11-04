import { useEffect, useState, type CSSProperties } from 'react'
import type { GamePageProps } from '../types'
import { downloadPath } from '../../../data/projects'
import { formatDate, useReleases } from '../../../lib/releases'
import { useGoogleFonts } from '../../../lib/useGoogleFonts'
import { LoopVideo } from '../../../components/LoopVideo'
import { Lightbox } from '../../../components/Lightbox'
import { UpdatesSignup } from '../../../components/UpdatesSignup'
import { UpdatesLink } from '../../../components/UpdatesLink'
import { gameSeo } from '../../../data/seo'
import { ART, Glyph, Sprite } from './Pixels'
import { StrayPen } from './StrayPen'
import { strays } from './strays'
import './the-farther-we-stray.css'

const CLIPS = `${ART}clips/`

const clips = [
  {
    name: 'lantern',
    title: 'The undercity',
    text: 'Lantern Row: neon overhead, roofs to climb, and a pack of strays in the street.',
    label:
      'Gameplay: on an undercity street of brick and neon signs, a squad of beasts fights a pack of strays, one perched on a rooftop.',
  },
  {
    name: 'gardens',
    title: 'The city above',
    text: 'The Gilded Gardens: fountains, hedges and tiled roofs, and a fight in the middle of them.',
    label:
      'Gameplay: beasts battle among the fountains, hedges and pastel houses of the city above.',
  },
  {
    name: 'skills',
    title: 'Fifty-one jobs',
    text: 'Every job brings its own skills: embers, frost, venom, chem and more, each with its own burst.',
    label:
      'Gameplay: beasts on an undercity board fire a run of skills, each a different coloured burst.',
  },
  {
    name: 'summons',
    title: 'Signature classes',
    text: "Seven jobs opened by their own trials. A Conjurer calls up a great beast's ghost.",
    label:
      'Gameplay: the ghost of a great beast rises over the board and strikes a pack of strays.',
  },
]

// The tiers, as the game names and colours them (Classes/Tiers.cs): a creature goes by the most
// extreme thing done to it.
const tiers = [
  {
    name: 'Stray',
    glyph: 'paw',
    hex: '#b8ad9c',
    text: 'Uncaught, and rolled fresh: no two alike.',
  },
  {
    name: 'Thoroughbred',
    glyph: 'crown',
    hex: '#9ac25a',
    text: 'Caught and left natural, with a bonus from its own species.',
  },
  {
    name: 'Infused',
    glyph: 'flask',
    hex: '#4ff0a0',
    text: 'Its stats tuned with infusions at the lab, or new blood brewed in.',
  },
  {
    name: 'Chimera',
    glyph: 'helix',
    hex: '#c08cff',
    text: 'Bred across bloods or spliced: the abilities of other species.',
  },
  {
    name: 'Rigged',
    glyph: 'gear',
    hex: '#4fe3ff',
    text: 'Augments bolted on: abilities no natural creature has, for upkeep.',
  },
  {
    name: 'Abomination',
    glyph: 'skull',
    hex: '#ff5a6a',
    text: 'All three at once. Huge stats, and never quite stable between missions.',
  },
]

const facts: [string, string][] = [
  ['30', 'forms'],
  ['51', 'jobs'],
  ['12', 'maps'],
  ['5', 'rival tamers'],
  ['6', 'tiers'],
  ['40', 'sounds'],
  ['6', 'songs'],
]

// Three strays to stand in the hero: a raptor, a stag and a sentinel.
const heroes = ['s05', 's01', 's06']
  .map((id) => strays.find((s) => s.id === id))
  .filter((s) => s !== undefined)

export default function TheFartherWeStrayPage({ project }: GamePageProps) {
  const game = project.game
  const releases = useReleases(game)
  const latest = releases.state === 'ok' ? releases.list[0] : undefined
  const images = project.images ?? []
  const [shown, setShown] = useState<number | null>(null)

  useGoogleFonts([
    'Limelight',
    'Lexend:wght@300;400;500;600',
    'Pixelify Sans:wght@500;700',
  ])

  useEffect(() => {
    document.title = gameSeo['the-farther-we-stray'].title
  }, [])

  return (
    <div className="tfws-root">
      <div className="tfws-smog" aria-hidden="true" />

      <a className="tfws-skip" href="#tfws-main">
        Skip to content
      </a>
      <nav className="tfws-topbar" aria-label="Site">
        <a href="/" className="tfws-topbar__home">
          <span aria-hidden="true">←</span> ecec.dev
        </a>
        <a href={`/#project-${project.id}`} className="tfws-topbar__link">
          All projects
        </a>
      </nav>

      <header
        className="tfws-hero"
        style={{ '--hero': `url(${CLIPS}lantern.jpg)` } as CSSProperties}
      >
        <div className="tfws-hero__inner">
          <div className="tfws-hero__text">
            <p className="tfws-eyebrow">A creature tactics game · free</p>
            <h1 className="tfws-title">
              <span>The Farther</span> <span>We Stray</span>
            </h1>
            <p className="tfws-tag">
              Catch strays. Breed your beasts. <em>Lead them into battle.</em>
            </p>
            <p className="tfws-sub">
              Turn-based tactics on isometric maps, from your farmyard home out to a
              gilded city and the undercity beneath it. Every creature is made by code,
              and no two are alike.
            </p>
            <div className="tfws-actions">
              <a
                className="tfws-btn tfws-btn--gold tfws-btn--big"
                href={downloadPath(project)}
              >
                <span className="tfws-btn__glyph" aria-hidden="true">
                  ⬇
                </span>
                Download free
              </a>
              <a className="tfws-btn tfws-btn--cyan" href="#tfws-strays">
                Meet the strays
              </a>
            </div>
            <p className="tfws-meta">
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
              {game.platform} · {game.players} · early build
            </p>
            <UpdatesLink className="tfws-updates-link" />
          </div>
          <div className="tfws-hero__beasts" aria-hidden="true">
            {heroes.map((s) => (
              <span
                key={s.id}
                className="tfws-hero__beast"
                style={{ '--slot': Math.max(s.frame.w, 48) } as CSSProperties}
              >
                <span className="tfws-tile" />
                <Sprite stray={s} className="tfws-hero__sprite" />
              </span>
            ))}
          </div>
        </div>
      </header>

      <main id="tfws-main">
        <section
          id="tfws-strays"
          className="tfws-section"
          aria-labelledby="tfws-strays-title"
        >
          <div className="tfws-heading">
            <p className="tfws-eyebrow">Try it here</p>
            <h2 id="tfws-strays-title">Meet the strays</h2>
            <p className="tfws-lede">
              One stray of each of the game&rsquo;s thirty forms, drawn by the game
              itself. Poke one to see its temper, and catch three for a squad.
            </p>
          </div>
          <StrayPen />
        </section>

        <section className="tfws-section" aria-labelledby="tfws-clips-title">
          <div className="tfws-heading">
            <p className="tfws-eyebrow">How it plays</p>
            <h2 id="tfws-clips-title">Above and below</h2>
          </div>
          <div className="tfws-clips">
            {clips.map((clip) => (
              <figure key={clip.name} className="tfws-clip">
                <div className="tfws-frame tfws-panel">
                  <LoopVideo
                    src={`${CLIPS}${clip.name}.mp4`}
                    poster={`${CLIPS}${clip.name}.jpg`}
                    label={clip.label}
                    width={960}
                    height={540}
                    className="tfws-clip__video"
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

        <section className="tfws-section" aria-labelledby="tfws-tiers-title">
          <div className="tfws-heading">
            <p className="tfws-eyebrow">The lab and the vats</p>
            <h2 id="tfws-tiers-title">How far will you take them?</h2>
            <p className="tfws-lede">
              A beast goes by the furthest thing done to it. The city above prizes pure
              bloodlines; the undercity runs on rigs and chemicals.
            </p>
          </div>
          <ol className="tfws-tiers">
            {tiers.map((t) => (
              <li key={t.name} style={{ '--tier': t.hex } as CSSProperties}>
                <span className="tfws-tiers__mark">
                  <Glyph name={t.glyph} />
                </span>
                <strong>{t.name}</strong>
                <span>{t.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="tfws-section" aria-labelledby="tfws-about-title">
          <div className="tfws-about">
            <div className="tfws-panel tfws-about__text">
              <h2 id="tfws-about-title">About the game</h2>
              {game.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ul className="tfws-facts" aria-label="By the numbers">
              {facts.map(([n, what]) => (
                <li key={what}>
                  <span className="tfws-facts__n">{n}</span>
                  <span className="tfws-facts__what">{what}</span>
                </li>
              ))}
              <li className="tfws-facts__note">
                every creature, sound and song made by code
              </li>
            </ul>
          </div>
        </section>

        {images.length > 0 && (
          <section className="tfws-section" aria-labelledby="tfws-shots-title">
            <div className="tfws-heading">
              <p className="tfws-eyebrow">Stills</p>
              <h2 id="tfws-shots-title">Screenshots</h2>
            </div>
            <ul className="tfws-shots">
              {images.map((image, i) => (
                <li key={image.src}>
                  <button type="button" className="tfws-shot" onClick={() => setShown(i)}>
                    <img src={image.src} alt={image.alt} loading="lazy" />
                    <span className="tfws-sr">Enlarge</span>
                  </button>
                </li>
              ))}
            </ul>
            <Lightbox
              images={images}
              index={shown}
              onIndexChange={setShown}
              onClose={() => setShown(null)}
              label="The Farther We Stray screenshots"
            />
          </section>
        )}

        <section className="tfws-section tfws-split" aria-label="Controls and what's new">
          <div className="tfws-panel tfws-controls">
            <h2>Controls</h2>
            <h3>Mouse and keyboard</h3>
            <dl>
              <div>
                <dt>
                  <span className="tfws-kbd">Click</span>{' '}
                  <span className="tfws-kbd">WASD</span>
                </dt>
                <dd>Walk round your base</dd>
              </div>
              <div>
                <dt>
                  <span className="tfws-kbd">E</span>
                </dt>
                <dd>Use a station: the pens, the yard, the gate</dd>
              </div>
              <div>
                <dt>
                  <span className="tfws-kbd">Click</span>{' '}
                  <span className="tfws-kbd">←↑↓→</span>{' '}
                  <span className="tfws-kbd">Enter</span>
                </dt>
                <dd>In battle: pick a tile, move, act</dd>
              </div>
              <div>
                <dt>
                  <span className="tfws-kbd">WASD</span>{' '}
                  <span className="tfws-kbd">Wheel</span>
                </dt>
                <dd>Pan and zoom the battle</dd>
              </div>
              <div>
                <dt>
                  <span className="tfws-kbd">Esc</span>
                </dt>
                <dd>Back, or the menu</dd>
              </div>
            </dl>
            <h3>On a phone, held sideways</h3>
            <dl>
              <div>
                <dt>
                  <span className="tfws-kbd">D-pad</span>
                </dt>
                <dd>Walk, pick, move the cursor</dd>
              </div>
              <div>
                <dt>
                  <span className="tfws-kbd">A</span> <span className="tfws-kbd">B</span>
                </dt>
                <dd>Select, and back</dd>
              </div>
              <div>
                <dt>
                  <span className="tfws-kbd">Start</span>
                </dt>
                <dd>The menu</dd>
              </div>
              <div>
                <dt>
                  <span className="tfws-kbd">Tap</span>
                </dt>
                <dd>Tap a tile, tap again to act, drag to look around</dd>
              </div>
            </dl>
          </div>

          <div className="tfws-panel tfws-news">
            <h2>What&rsquo;s new</h2>
            {releases.state === 'loading' && (
              <p className="tfws-muted">Reading the latest notes…</p>
            )}
            {releases.state === 'none' && (
              <p className="tfws-muted">
                The release notes are on{' '}
                <a href={`https://github.com/eclancy/${game.repo}/releases`}>GitHub</a>.
              </p>
            )}
            {releases.state === 'ok' && (
              <ol className="tfws-news__list">
                {releases.list.slice(0, 4).map((release) => (
                  <li key={release.version}>
                    <p className="tfws-news__head">
                      <a href={release.url}>v{release.version}</a>
                      <span>{formatDate(release.date)}</span>
                    </p>
                    {release.notes && <p className="tfws-news__notes">{release.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
            <a
              className="tfws-news__all"
              href={`https://github.com/eclancy/${game.repo}/releases`}
            >
              Every version →
            </a>
            <UpdatesSignup
              game={project.id}
              name={project.name}
              className="tfws-signup"
            />
          </div>
        </section>

        <section className="tfws-section tfws-final" aria-labelledby="tfws-final-title">
          <h2 id="tfws-final-title">The strays are waiting</h2>
          <p>
            Free for Windows and Android. An early build: the story is still being
            written.
          </p>
          <a
            className="tfws-btn tfws-btn--gold tfws-btn--big"
            href={downloadPath(project)}
          >
            <span className="tfws-btn__glyph" aria-hidden="true">
              ⬇
            </span>
            Download free
          </a>
        </section>
      </main>

      <footer className="tfws-footer">
        <span className="tfws-footer__rule" aria-hidden="true" />
        <p>
          <a href="/">ecec.dev</a>
          <span aria-hidden="true"> · </span>
          {project.repoUrl && <a href={project.repoUrl}>Source on GitHub</a>}
          <span aria-hidden="true"> · </span>
          <a href={`https://github.com/eclancy/${game.repo}/releases`}>All versions</a>
          <span aria-hidden="true"> · </span>
          <a href="/privacy">Privacy</a>
        </p>
        <p className="tfws-footer__small">
          Made by Eric Clancy. Every creature, sound and song in the game is made by code.
        </p>
      </footer>
    </div>
  )
}
