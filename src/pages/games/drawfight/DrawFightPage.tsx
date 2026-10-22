import { useEffect, useState, type ReactNode } from 'react'
import type { GamePageProps } from '../types'
import { downloadPath } from '../../../data/projects'
import { formatDate, useReleases, type Release } from '../../../lib/releases'
import { useGoogleFonts } from '../../../lib/useGoogleFonts'
import { LoopVideo } from '../../../components/LoopVideo'
import { Lightbox } from '../../../components/Lightbox'
import { UpdatesSignup } from '../../../components/UpdatesSignup'
import { UpdatesLink } from '../../../components/UpdatesLink'
import { PracticePage } from './PracticePage'
import { Puppet } from './Puppet'
import { rigs } from './rigs'
import { sample } from './poses'
import { Arrow, Scribble, Star, Underline } from './Doodles'
import { gameSeo } from '../../../data/seo'
import './drawfight.css'

const CLIPS = [
  {
    name: 'laser-ko',
    caption: "Circy's eye laser, then a smash: DoomBot is gone",
    label:
      'Circy, a yellow smiley face on stick legs, fires a red laser at DoomBot on the Open Plains, knocks his damage up past 80 percent, and launches him off the screen in a red and yellow KO burst.',
  },
  {
    name: 'fridge-ko',
    caption: 'Triguy runs rings round DoomBot on the Fridge Door',
    label:
      'Triguy, a black stick-figure triangle in a top hat, keeps hitting DoomBot round the Fridge Door stage until his damage is at 98 percent, then knocks him off the right side for a KO.',
  },
  {
    name: 'glitter',
    caption: 'Glitter bomb! Circy and Triguy up on the Big Show',
    label:
      'Circy and Triguy fight along the girder over the Big Show concert stage; a glitter bomb goes off in a shower of sparkles and sends Circy rolling.',
  },
  {
    name: 'pencil',
    caption: 'Triguy grabs the Giant Pencil and goes after Circy',
    label:
      'Over the Open Plains, Triguy picks up the Giant Pencil item and swings it at Circy in mid-air, taking her damage from 19 to 51 percent.',
  },
]

const FIGHTERS = [
  {
    name: 'Circy',
    by: 'Elim',
    kid: true,
    blurb:
      'Stretches tall for big slow hits, or short for small fast ones. Rolls when hit.',
  },
  {
    name: 'Triguy',
    by: 'Elim',
    kid: true,
    blurb:
      "A really fast triangle in a top hat. Can't stop: he skids. The first fighter sent in through the form.",
  },
  {
    name: 'DoomBot',
    by: 'Eric',
    blurb: 'A giant rogue factory robot. Heats up as he fights, then lets it all out.',
  },
  {
    name: 'EdgeLord',
    by: 'Eric',
    blurb: 'Super fast, with endless swords. Air-dashes instead of a second jump.',
  },
  {
    name: 'Flambé',
    by: 'a stand-in',
    blurb: 'A fire-punk chef: fireballs, wings of flame and fire rain.',
  },
  {
    name: 'Lugnut',
    by: 'a stand-in',
    blurb: 'A construction worker with site tools. Hard to launch.',
  },
]

const PAD: [string, string][] = [
  ['Left stick', 'Move. The harder you push, the faster you run'],
  ['A or Y', 'Jump, and jump again in the air'],
  ['X', 'Attack. Tap for a jab combo, flick the stick for a smash (hold to charge)'],
  ['B', 'Special, with a direction for all four'],
  ['LT or RT', 'Block behind a shield'],
  ['RB', 'Grab, then the stick picks a throw'],
  ['X by an item', 'Pick it up. X again swings, throws or sprays it'],
  ['LB', 'Taunt. Does nothing but show off'],
]

const KEYS = {
  p1: [
    ['arrows', 'move'],
    ['A', 'jump'],
    ['Q', 'attack'],
    ['W', 'special'],
    ['S', 'block'],
    ['D', 'grab'],
    ['E', 'taunt'],
  ],
  p2: [
    ['8 4 5 6', 'move'],
    ['1', 'jump'],
    ['2', 'attack'],
    ['3', 'special'],
    ['0', 'block'],
    ['9', 'grab'],
    ['7', 'taunt'],
  ],
}

export default function DrawFightPage({ project }: GamePageProps) {
  const { game } = project
  useGoogleFonts(['Permanent Marker', 'Patrick Hand', 'Lexend:wght@400;500;600;700'])
  const releases = useReleases(game)
  const latest = releases.state === 'ok' ? releases.list[0] : undefined
  const images = project.images ?? []
  const [open, setOpen] = useState<number | null>(null)
  const feature = game.feature
  const triguy = rigs.find((r) => r.id === 'triguy')!

  useEffect(() => {
    document.title = gameSeo.drawfight.title
  }, [])

  return (
    <div className="df-page">
      <a className="df-skip" href="#df-main">
        Skip to the page
      </a>
      <header className="df-top">
        <a href="/" className="df-back">
          ← ecec.dev
        </a>
        <nav aria-label="On this page">
          <a href="#watch">Watch</a>
          <a href="#smack">Try it</a>
          <a href="#controls">Controls</a>
          <a href="#new">What&apos;s new</a>
        </nav>
      </header>

      <main id="df-main">
        {/* ---------------------------------------------------------------- hero */}
        <section className="df-hero" aria-labelledby="df-title">
          <div className="df-hero-text">
            <p className="df-eyebrow">
              Free · {game.platform ?? 'Windows'} · {game.players}
            </p>
            <h1 id="df-title" className="df-logo">
              <span className="df-logo-draw">Draw</span>
              <span className="df-logo-fight">Fight</span>
              <Star className="df-logo-star" />
            </h1>
            <p className="df-tagline">
              <Highlight text={project.tagline} phrase="a kid's drawing" />
            </p>
            <p className="df-lede">{project.description}</p>

            <div className="df-ctas">
              {game.comingSoon ? (
                <p className="df-soon">Coming soon</p>
              ) : (
                <a className="df-download" href={downloadPath(project)}>
                  <span aria-hidden="true">⬇</span> Play {project.name}
                </a>
              )}
              {feature && (
                <a className="df-submit" href={feature.href}>
                  <span aria-hidden="true">{feature.emoji}</span> {feature.label}
                </a>
              )}
            </div>
            {!game.comingSoon && <VersionLine release={latest} state={releases.state} />}
            {!game.comingSoon && <UpdatesLink className="df-updates-link" />}
          </div>

          <figure className="df-polaroid df-hero-clip">
            <span className="df-tape df-tape-l" aria-hidden="true" />
            <span className="df-tape df-tape-r" aria-hidden="true" />
            <LoopVideo
              src="/games/drawfight/clips/fridge-ko.mp4"
              poster="/games/drawfight/clips/fridge-ko.jpg"
              label={CLIPS[1].label}
              width={960}
              height={540}
            />
            <figcaption>Two drawings, one fridge door, three lives each</figcaption>
          </figure>
          <p className="df-margin-note df-note-hero" aria-hidden="true">
            <Arrow className="df-note-arrow" />
            Triguy here was drawn by a kid. That&apos;s his actual drawing, moving!
          </p>
        </section>

        {/* ------------------------------------------------------ be in the game */}
        {feature && (
          <section className="df-feature" aria-labelledby="df-feature-title">
            <div className="df-sticky">
              <span className="df-tape df-tape-c" aria-hidden="true" />
              <h2 id="df-feature-title">{feature.title}</h2>
              <p>{feature.text}</p>
              <ol className="df-steps">
                <li>
                  <b>Draw</b> a fighter on paper, arms and legs apart
                </li>
                <li>
                  <b>Snap</b> a photo of it
                </li>
                <li>
                  <b>Send</b> it in, and tell us its moves
                </li>
              </ol>
              <div className="df-feature-ctas">
                <a className="df-submit df-submit-big" href={feature.href}>
                  <span aria-hidden="true">{feature.emoji}</span> {feature.label}
                </a>
                {feature.more && (
                  <a className="df-more" href={feature.more.href}>
                    {feature.more.label} →
                  </a>
                )}
              </div>
            </div>
            <figure className="df-feature-fig">
              <svg
                viewBox="-110 -250 220 270"
                role="img"
                aria-label="Triguy, drawn by Elim, cheering with both arms up"
              >
                <Puppet rig={triguy} pose={sample('cheer', 0)} height={230} />
              </svg>
              <figcaption>
                <Arrow className="df-feature-arrow" />
                Triguy got in this way. He was drawn by Elim, and he&apos;s really fast.
              </figcaption>
            </figure>
          </section>
        )}

        {/* ---------------------------------------------------------------- clips */}
        <section id="watch" className="df-section" aria-labelledby="df-watch-title">
          <SectionTitle id="df-watch-title" note="no sound, just the good bits">
            Watch it go
          </SectionTitle>
          <div className="df-clips">
            {CLIPS.map((clip, i) => (
              <figure key={clip.name} className={`df-polaroid df-clip df-clip-${i}`}>
                <span className="df-tape df-tape-c" aria-hidden="true" />
                <LoopVideo
                  src={`/games/drawfight/clips/${clip.name}.mp4`}
                  poster={`/games/drawfight/clips/${clip.name}.jpg`}
                  label={clip.label}
                  width={960}
                  height={540}
                />
                <figcaption>{clip.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------- the toy */}
        <section
          id="smack"
          className="df-section df-smack"
          aria-labelledby="df-smack-title"
        >
          <SectionTitle id="df-smack-title" note="go on, it's only paper">
            Smack the doodle
          </SectionTitle>
          <div className="df-smack-intro">
            <p>
              Nobody in DrawFight has a health bar. Every hit adds to a{' '}
              <mark>damage %</mark>, and the higher it climbs, the further the next hit
              sends you flying. Get knocked <mark>off the page</mark> and you lose one of
              your three lives.
            </p>
            <p className="df-hint">
              Try it: poke them a few times, then give them the pencil. These are the real
              fighters, rigs and knockback formula from the game.
            </p>
          </div>
          <PracticePage />
          <p className="df-margin-note df-note-bones" aria-hidden="true">
            Flick on &ldquo;show the skeleton&rdquo;, then switch fighter: one skeleton,
            every drawing.
          </p>
        </section>

        {/* ------------------------------------------------------- about */}
        <section className="df-section df-about" aria-labelledby="df-about-title">
          <SectionTitle id="df-about-title">How it works</SectionTitle>
          <div className="df-about-grid">
            <div className="df-about-text">
              {game.about.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <aside className="df-checklist" aria-labelledby="df-box-title">
              <h3 id="df-box-title">In the box</h3>
              <ul>
                <li>6 fighters, 17 moves each</li>
                <li>A story for every fighter</li>
                <li>7 stages, from the Fridge Door to the Big Show</li>
                <li>30 art-supply items</li>
                <li>Draw your own fighter or stage, in the game</li>
                <li>Computer players: Easy, Medium, Hard</li>
                <li>Xbox pads or the keyboard</li>
              </ul>
            </aside>
          </div>

          <h3 className="df-sub">Who&apos;s fighting</h3>
          <ul className="df-roster">
            {FIGHTERS.map((f, i) => (
              <li key={f.name} className={`df-card df-card-${i % 3}`}>
                <h4>{f.name}</h4>
                <p className="df-by">
                  drawn by {f.by}
                  {f.kid && <span className="df-kid">kid art!</span>}
                </p>
                <p>{f.blurb}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------------- screenshots */}
        {images.length > 0 && (
          <section className="df-section" aria-labelledby="df-shots-title">
            <SectionTitle id="df-shots-title" note="tap one to see it big">
              Snapshots
            </SectionTitle>
            <ul className="df-shots">
              {images.map((image, i) => (
                <li key={image.src} className={`df-shot df-shot-${i}`}>
                  <button type="button" onClick={() => setOpen(i)}>
                    <span className="df-tape df-tape-c" aria-hidden="true" />
                    <img src={image.src} alt={image.alt} loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
            <Lightbox
              images={images}
              index={open}
              onIndexChange={setOpen}
              onClose={() => setOpen(null)}
              label="DrawFight screenshots"
            />
          </section>
        )}

        {/* ------------------------------------------------------- controls */}
        <section id="controls" className="df-section" aria-labelledby="df-controls-title">
          <SectionTitle id="df-controls-title" note="grab a friend">
            How to play
          </SectionTitle>
          <div className="df-controls-grid">
            <div className="df-index">
              <h3>With an Xbox pad</h3>
              <dl className="df-pad">
                {PAD.map(([button, what]) => (
                  <div key={button}>
                    <dt>{button}</dt>
                    <dd>{what}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="df-index">
              <h3>On one keyboard</h3>
              {(['p1', 'p2'] as const).map((p) => (
                <div key={p} className="df-keys">
                  <h4>{p === 'p1' ? 'Player 1' : 'Player 2, on the number pad'}</h4>
                  <ul>
                    {KEYS[p].map(([key, what]) => (
                      <li key={key}>
                        <kbd>{key}</kbd> {what}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="df-small">
                The mouse only does anything on the drawing screens.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- releases */}
        {!game.comingSoon && (
          <section id="new" className="df-section" aria-labelledby="df-new-title">
            <SectionTitle id="df-new-title" note="it updates itself">
              What&apos;s new
            </SectionTitle>
            <Releases
              state={releases.state}
              list={releases.state === 'ok' ? releases.list : []}
              repo={project.repoUrl}
            />
            <UpdatesSignup game={project.id} name={project.name} className="df-signup" />
          </section>
        )}

        <section className="df-end" aria-labelledby="df-end-title">
          <h2 id="df-end-title">Ready to fight?</h2>
          <div className="df-ctas df-ctas-center">
            {!game.comingSoon && (
              <a className="df-download" href={downloadPath(project)}>
                <span aria-hidden="true">⬇</span> Play {project.name}
              </a>
            )}
            {feature && (
              <a className="df-submit" href={feature.href}>
                <span aria-hidden="true">{feature.emoji}</span> {feature.label}
              </a>
            )}
          </div>
        </section>
      </main>

      <footer className="df-foot">
        <Scribble className="df-foot-scribble" />
        <p>Made by Eric Clancy, with drawings by kids.</p>
        <nav aria-label="More">
          <a href="/">ecec.dev</a>
          {project.repoUrl && <a href={project.repoUrl}>Source on GitHub</a>}
          {project.repoUrl && <a href={`${project.repoUrl}/releases`}>All versions</a>}
          <a href="/privacy">Privacy</a>
        </nav>
      </footer>
    </div>
  )
}

function SectionTitle({
  id,
  note,
  children,
}: {
  id: string
  note?: string
  children: ReactNode
}) {
  return (
    <div className="df-title">
      <h2 id={id}>
        {children}
        <Underline className="df-underline" />
      </h2>
      {note && (
        <p className="df-title-note" aria-hidden="true">
          ({note})
        </p>
      )}
    </div>
  )
}

function VersionLine({ release, state }: { release?: Release; state: string }) {
  if (state === 'loading')
    return <p className="df-version">checking the latest version…</p>
  if (!release)
    return <p className="df-version">Windows 10 and 11 · keeps itself up to date</p>
  return (
    <p className="df-version">
      v{release.version}
      {release.sizeMb !== undefined && <> · {release.sizeMb} MB</>} · updated{' '}
      {formatDate(release.date)} · keeps itself up to date
    </p>
  )
}

function Releases({
  state,
  list,
  repo,
}: {
  state: string
  list: Release[]
  repo?: string
}) {
  if (state === 'loading')
    return <p className="df-small">Flipping back through the notebook…</p>
  if (list.length === 0)
    return (
      <p className="df-small">
        Couldn&apos;t reach GitHub just now.{' '}
        {repo && <a href={`${repo}/releases`}>See every version there</a>}.
      </p>
    )
  const entry = (r: Release, i: number) => (
    <li key={r.version}>
      <p className="df-log-date">
        <time dateTime={r.date}>{formatDate(r.date)}</time>
      </p>
      <div>
        <h3>
          <a href={r.url}>v{r.version}</a>
          {i === 0 && <span className="df-latest">latest!</span>}
        </h3>
        <Notes text={r.notes} />
      </div>
    </li>
  )
  return (
    <>
      <ol className="df-log">{list.slice(0, 4).map(entry)}</ol>
      {list.length > 4 && (
        <details className="df-older">
          <summary>Older versions</summary>
          <ol className="df-log">{list.slice(4).map((r, i) => entry(r, i + 4))}</ol>
        </details>
      )}
    </>
  )
}

// Release notes are a few plain paragraphs, or a list of "- " lines.
function Notes({ text }: { text: string }) {
  if (!text) return <p className="df-small">Fixes and polish.</p>
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  const bullets = lines.filter((l) => /^\s*[-*] /.test(l))
  if (bullets.length >= lines.length / 2)
    return (
      <ul className="df-notes">
        {lines.map((l) => (
          <li key={l}>{l.replace(/^\s*[-*] /, '')}</li>
        ))}
      </ul>
    )
  return (
    <div className="df-notes">
      {lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  )
}

function Highlight({ text, phrase }: { text: string; phrase: string }) {
  const at = text.indexOf(phrase)
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark>{phrase}</mark>
      {text.slice(at + phrase.length)}
    </>
  )
}
