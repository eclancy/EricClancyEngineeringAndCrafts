import { useEffect, useState, type ReactNode } from 'react'
import type { GamePageProps } from '../types'
import { downloadPath } from '../../../data/projects'
import { formatDate, useReleases } from '../../../lib/releases'
import { useGoogleFonts } from '../../../lib/useGoogleFonts'
import { LoopVideo } from '../../../components/LoopVideo'
import { Lightbox } from '../../../components/Lightbox'
import { UpdatesSignup } from '../../../components/UpdatesSignup'
import { UpdatesLink } from '../../../components/UpdatesLink'
import { CurlyArrow, DoodleFilters, Heart, Sparkle, Squiggle, Star } from './Doodles'
import { PartMaker } from './PartMaker'
import { PetMe } from './PetMe'
import { gameSeo } from '../../../data/seo'
import './drawpets.css'

const ART = '/games/drawpets/art'
const CLIPS = '/games/drawpets/clips'

// The four ways it plays, each a few seconds of the real game recorded from its demo.
const STEPS = [
  {
    clip: 'draw-a-tail',
    title: 'Draw every part on its own sheet',
    text:
      'Heads, eyes, legs, wings, a tail, tentacles - each one starts at a red dot that ' +
      'marks where it joins on.',
    label:
      'Drawing an orange tail going left from a red dot, then the tail wagging on the body',
    caption: 'a tail, from the red dot... and it wags!',
  },
  {
    clip: 'comes-alive',
    title: 'Put it together and it comes alive',
    text:
      'Every kind of part has its own way of moving, so whatever you invent blinks, ' +
      'walks and wags the very first time.',
    label:
      'A drawn creature coming alive part by part: its eyes blink, mouth opens, ears ' +
      'bounce, head looks around and legs walk',
    caption: 'eyes blink, ears bounce, legs walk',
  },
  {
    clip: 'fetch-and-cuddles',
    title: "Then it's yours to look after",
    text:
      'Throw its ball and it fetches. Rub its tummy long enough and it rolls over for a ' +
      'belly rub.',
    label:
      'The pet fetching a ball in its meadow, then rolling over for a belly rub with hearts',
    caption: 'fetch! then a belly rub',
  },
  {
    clip: 'bath-day',
    title: 'And once a week, bath day',
    text: 'Clip its nails, a soapy wash, a rinse and a shake, then brush its teeth and fur.',
    label:
      'Bath day: the pet in a bubbly tub having its nails clipped, a wash and a brush',
    caption: 'squeaky clean!',
  },
]

// Toys do what their describing words say - the words the kid picks, never the picture.
const WORDS = [
  {
    word: 'bouncy',
    thing: 'ball',
    art: 'ball',
    w: 220,
    h: 220,
    does: 'gets fetched, and held out for another throw',
  },
  {
    word: 'stretchy',
    thing: 'rope',
    art: 'rope',
    w: 220,
    h: 165,
    does: 'means tug of war',
  },
  {
    word: 'soft',
    thing: 'teddy',
    art: 'teddy',
    w: 220,
    h: 304,
    does: 'gets a big cuddle',
  },
  {
    word: 'squeaky',
    thing: 'duck',
    art: 'duck',
    w: 220,
    h: 184,
    does: 'gets pounced on',
  },
  { word: 'cozy', thing: 'bed', art: 'bed', w: 220, h: 84, does: 'is where it naps' },
]

const TITLE_COLORS = [
  'var(--dp-ink)',
  'var(--dp-ink)',
  'var(--dp-ink)',
  'var(--dp-ink)',
  'var(--dp-orange-deep)',
  'var(--dp-pink)',
  'var(--dp-blue)',
  'var(--dp-green)',
]

export default function DrawPetsPage({ project }: GamePageProps) {
  const { game } = project
  const releases = useReleases(game)
  const latest = releases.state === 'ok' ? releases.list[0] : undefined
  const images = project.images ?? []
  const [expanded, setExpanded] = useState<number | null>(null)
  const [word, setWord] = useState(0)
  const repoUrl = project.repoUrl ?? `https://github.com/eclancy/${game.repo}`
  const platform = game.platform ?? 'Windows'

  useGoogleFonts([
    'Fredoka:wght@500;600;700',
    'Kalam:wght@400;700',
    'Nunito:wght@400;600;700;800',
  ])

  useEffect(() => {
    document.title = gameSeo.drawpets.title
  }, [])

  const versionLine = latest
    ? `Version ${latest.version} · ${formatDate(latest.date).replace(/ /g, '\u00a0')}${
        latest.sizeMb ? ` · ${latest.sizeMb} MB` : ''
      } · updates itself`
    : releases.state === 'none'
      ? 'Free · keeps itself up to date once installed'
      : '\u00a0'

  const picked = WORDS[word]

  return (
    <div className="dp-page">
      <DoodleFilters />
      <a href="#dp-main" className="dp-skip">
        Skip to the game
      </a>

      <header className="dp-top">
        <a href="/" className="dp-home">
          <span aria-hidden="true">←</span> ecec.dev
        </a>
        <a href={`/#project-${project.id}`} className="dp-top-link">
          All projects
        </a>
      </header>

      <main id="dp-main">
        {/* Hero: the name, the download, and a kitten to pet. */}
        <section className="dp-hero dp-wrap" aria-labelledby="dp-title">
          <div className="dp-hero-text">
            <ul className="dp-tags" aria-label="At a glance">
              <li className="dp-tag is-orange">Free</li>
              <li className="dp-tag is-blue">{platform.replace(' and ', ' & ')}</li>
              <li className="dp-tag is-mint">{game.players}</li>
              <li className="dp-tag is-pink">Ages 7+</li>
            </ul>
            <h1 id="dp-title" className="dp-title">
              <span className="dp-sr">{project.name}</span>
              <span aria-hidden="true" className="dp-title-letters">
                {project.name.split('').map((ch, i) => (
                  <span
                    key={i}
                    style={{
                      color: TITLE_COLORS[i % TITLE_COLORS.length],
                      rotate: `${[-4, 3, -2, 4, -3, 2, -4, 3][i % 8]}deg`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
              <Squiggle className="dp-title-squiggle" />
            </h1>
            <p className="dp-lede">
              Draw a creature. <em>Bring it to life.</em> Look after it.
            </p>
            <p className="dp-sub">
              A virtual pet you draw part by part, then feed, play with and give a home of
              its own. Every pet is a kid's own drawing.
            </p>

            {game.comingSoon ? (
              <p className="dp-soon">Coming soon</p>
            ) : (
              <div className="dp-cta">
                <a href={downloadPath(project)} className="dp-btn dp-download">
                  <span className="dp-download-main">Download free</span>
                  <span className="dp-download-for">for {platform}</span>
                </a>
                <p className="dp-version" aria-live="polite">
                  {versionLine}
                </p>
                <UpdatesLink className="dp-updates-link" />
              </div>
            )}
          </div>

          <div className="dp-scene dp-sketch">
            <Sky />
            <img
              src={`${ART}/ball.webp`}
              alt=""
              width={220}
              height={220}
              className="dp-sticker dp-scene-ball"
            />
            <img
              src={`${ART}/teddy.webp`}
              alt=""
              width={220}
              height={304}
              className="dp-sticker dp-scene-teddy"
            />
            <div className="dp-scene-note" aria-hidden="true">
              <span>pet me!</span>
              <CurlyArrow className="dp-scene-arrow" />
            </div>
            <PetMe />
          </div>
        </section>

        {/* How it plays: four clips from the real game. */}
        <section className="dp-section dp-wrap" aria-labelledby="dp-how">
          <SectionTitle id="dp-how" kicker="how it plays">
            From a red dot to a best friend
          </SectionTitle>
          <ol className="dp-steps">
            {STEPS.map((step, i) => (
              <li key={step.clip} className="dp-step">
                <figure
                  className="dp-polaroid"
                  style={{ rotate: `${[-1.4, 1.2, -0.8, 1.5][i]}deg` }}
                >
                  <span className="dp-tape" aria-hidden="true" />
                  <LoopVideo
                    src={`${CLIPS}/${step.clip}.mp4`}
                    poster={`${CLIPS}/${step.clip}.jpg`}
                    label={step.label}
                    width={960}
                    height={540}
                    className="dp-polaroid-media"
                  />
                  <figcaption>{step.caption}</figcaption>
                </figure>
                <div className="dp-step-text">
                  <span className="dp-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* The fun part: draw a part yourself. */}
        <section className="dp-section dp-wrap" aria-labelledby="dp-try">
          <SectionTitle id="dp-try" kicker="your turn">
            Draw a part, bring it to life
          </SectionTitle>
          <p className="dp-section-lede">
            This little one needs a tail, some legs and maybe wings. Draw each from its
            red dot, then press the button and watch them move - just like in the game.
          </p>
          <div className="dp-sketch dp-maker-card">
            <Star className="dp-maker-star" />
            <PartMaker />
          </div>
        </section>

        {/* Words decide how things play. */}
        <section className="dp-section dp-wrap" aria-labelledby="dp-words">
          <SectionTitle id="dp-words" kicker="toys & words">
            Toys do what their words say
          </SectionTitle>
          <p className="dp-section-lede">
            Draw a toy, or pick one from the box, then choose its describing words. The
            words decide how your pet plays with it - never what it looks like.
          </p>
          <div className="dp-words">
            <div className="dp-word-picks" role="group" aria-label="Pick a word">
              {WORDS.map((w, i) => (
                <button
                  key={w.word}
                  type="button"
                  className="dp-word"
                  aria-pressed={i === word}
                  onClick={() => setWord(i)}
                >
                  <img src={`${ART}/${w.art}.webp`} alt="" width={w.w} height={w.h} />
                  <span>{w.word}</span>
                </button>
              ))}
            </div>
            <p className="dp-word-says dp-sketch" aria-live="polite">
              A <b>{picked.word}</b> {picked.thing} {picked.does}.
            </p>
          </div>
        </section>

        {/* Screenshots, scrapbook style. */}
        {images.length > 0 && (
          <section className="dp-section dp-wrap" aria-labelledby="dp-shots">
            <SectionTitle id="dp-shots" kicker="snapshots">
              Pages from the sketchbook
            </SectionTitle>
            <ul className="dp-shots">
              {images.map((image, i) => (
                <li
                  key={image.src}
                  style={{ rotate: `${[1.5, -1.2, 0.8, -1.6, 1.1][i % 5]}deg` }}
                >
                  <button
                    type="button"
                    className="dp-shot"
                    onClick={() => setExpanded(i)}
                    aria-label={`Enlarge: ${image.alt}`}
                  >
                    <span className="dp-tape is-small" aria-hidden="true" />
                    <img src={image.src} alt={image.alt} loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* About, what's new and grown-ups, side by side on wide screens. */}
        <section className="dp-section dp-wrap dp-notes" aria-label="About DrawPets">
          <article className="dp-note dp-sketch is-lined" aria-labelledby="dp-about">
            <h2 id="dp-about" className="dp-note-title">
              About the game
            </h2>
            {game.about.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
            <img
              src={`${ART}/apple.webp`}
              alt=""
              width={220}
              height={217}
              className="dp-sticker dp-note-apple"
              loading="lazy"
            />
          </article>

          <div className="dp-note-stack">
            <article className="dp-note dp-sketch is-mint" aria-labelledby="dp-grownups">
              <h2 id="dp-grownups" className="dp-note-title">
                For grown-ups
              </h2>
              <ul className="dp-promises">
                <li>No ads, no accounts, and nothing to buy with real money.</li>
                <li>No AI and no photos - every pet is the kid's own drawing.</li>
                <li>Pets and drawings are saved on the device, and stay there.</li>
                <li>
                  Friends can swap pets phone to phone when they're together - never
                  through the internet.
                </li>
                <li>Pets never get sick, run away or die.</li>
                <li>
                  The only thing it asks the internet is whether there's a newer version.
                </li>
              </ul>
            </article>

            <article className="dp-note dp-sketch is-lilac" aria-labelledby="dp-new">
              <h2 id="dp-new" className="dp-note-title">
                What's new
              </h2>
              {releases.state === 'loading' && <p className="dp-muted">Checking...</p>}
              {releases.state === 'none' && (
                <p className="dp-muted">
                  {game.comingSoon
                    ? 'The first version is on its way.'
                    : 'Release notes will appear here.'}
                </p>
              )}
              {releases.state === 'ok' && (
                <ol className="dp-releases">
                  {releases.list.slice(0, 3).map((r) => (
                    <li key={r.version}>
                      <p className="dp-release-head">
                        <a href={r.url} className="dp-release-version">
                          v{r.version}
                        </a>
                        <span className="dp-release-date">{formatDate(r.date)}</span>
                      </p>
                      {r.notes && <p className="dp-release-notes">{r.notes}</p>}
                    </li>
                  ))}
                </ol>
              )}
              <a href={`${repoUrl}/releases`} className="dp-link">
                All versions
              </a>
              {!game.comingSoon && (
                <UpdatesSignup
                  game={project.id}
                  name={project.name}
                  className="dp-signup"
                />
              )}
            </article>
          </div>
        </section>

        {!game.comingSoon && (
          <section className="dp-wrap dp-final" aria-labelledby="dp-final-title">
            <Heart className="dp-final-heart is-left" />
            <h2 id="dp-final-title" className="dp-final-title">
              Ready to draw your first pet?
            </h2>
            <a href={downloadPath(project)} className="dp-btn dp-download">
              <span className="dp-download-main">Download free</span>
              <span className="dp-download-for">for {platform}</span>
            </a>
            <Heart className="dp-final-heart is-right" color="var(--dp-orange)" />
          </section>
        )}
      </main>

      <footer className="dp-footer">
        <div className="dp-wrap dp-footer-inner">
          <p>
            Made by <a href="/">ECEC</a>
            <Sparkle className="dp-footer-sparkle" color="var(--dp-orange)" />
          </p>
          <nav aria-label="More DrawPets links">
            <a href={downloadPath(project)}>Download</a>
            <a href={repoUrl}>Source code</a>
            <a href={`${repoUrl}/releases`}>All versions</a>
            <a href="/">ecec.dev</a>
          </nav>
        </div>
      </footer>

      <Lightbox
        images={images}
        index={expanded}
        onIndexChange={setExpanded}
        onClose={() => setExpanded(null)}
        label={`${project.name} screenshots`}
      />
    </div>
  )
}

function SectionTitle({
  id,
  kicker,
  children,
}: {
  id: string
  kicker: string
  children: ReactNode
}) {
  return (
    <div className="dp-section-title">
      <p className="dp-kicker" aria-hidden="true">
        {kicker}
      </p>
      <h2 id={id}>
        {children}
        <Squiggle className="dp-h2-squiggle" />
      </h2>
    </div>
  )
}

// The meadow behind the kitten: a pencil-shaded sky, sun, clouds and hills.
function Sky() {
  return (
    <svg
      className="dp-sky"
      viewBox="0 0 600 450"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <g filter="url(#dp-wobble)">
        <g className="dp-sun">
          <circle
            cx="510"
            cy="78"
            r="38"
            fill="#ffd45c"
            stroke="#e8a92a"
            strokeWidth="4"
          />
          <circle cx="510" cy="78" r="38" fill="url(#dp-hatch)" />
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2
            return (
              <line
                key={i}
                x1={510 + Math.cos(a) * 50}
                y1={78 + Math.sin(a) * 50}
                x2={510 + Math.cos(a) * 64}
                y2={78 + Math.sin(a) * 64}
                stroke="#f2b632"
                strokeWidth="5"
                strokeLinecap="round"
              />
            )
          })}
        </g>
        <g className="dp-cloud" fill="#fff" stroke="#b9d9ea" strokeWidth="3">
          <path d="M70 110c-4-22 22-34 38-20 8-20 42-18 46 6 22-2 28 26 8 32H78c-18 0-22-14-8-18z" />
        </g>
        <g className="dp-cloud is-slow" fill="#fff" stroke="#b9d9ea" strokeWidth="3">
          <path d="M300 60c-3-16 16-25 28-15 6-15 31-13 34 4 16-1 21 19 6 24h-62c-13 0-16-10-6-13z" />
        </g>
        <path
          d="M-10 330C80 280 170 290 260 318S440 290 610 300V460H-10z"
          fill="#bde6a2"
        />
        <path
          d="M-10 330C80 280 170 290 260 318S440 290 610 300V460H-10z"
          fill="url(#dp-hatch)"
        />
        <path d="M-10 372c120-40 260-30 360-6s170 6 260-12V460H-10z" fill="#9fd685" />
        <path
          d="M-10 372c120-40 260-30 360-6s170 6 260-12V460H-10z"
          fill="url(#dp-hatch)"
        />
        {[
          [60, 380, '#ff8fb1'],
          [120, 410, '#ffd45c'],
          [470, 395, '#c9a3ff'],
          [540, 420, '#ff8fb1'],
          [30, 425, '#ffd45c'],
        ].map(([x, y, c]) => (
          <g key={`${x}-${y}`}>
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={(y as number) + 22}
              stroke="#5aa858"
              strokeWidth="3"
            />
            <circle
              cx={x}
              cy={y}
              r="8"
              fill={c as string}
              stroke="#3b3566"
              strokeWidth="2"
            />
            <circle cx={x} cy={y} r="3" fill="#fff6c9" />
          </g>
        ))}
      </g>
    </svg>
  )
}
