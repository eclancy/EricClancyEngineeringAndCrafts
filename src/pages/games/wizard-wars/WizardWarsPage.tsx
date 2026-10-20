import { useEffect, useState, type ReactNode } from 'react'
import type { GamePageProps } from '../types'
import { downloadPath } from '../../../data/projects'
import { formatDate, useReleases } from '../../../lib/releases'
import { useGoogleFonts } from '../../../lib/useGoogleFonts'
import { LoopVideo } from '../../../components/LoopVideo'
import { Lightbox } from '../../../components/Lightbox'
import { UpdatesSignup } from '../../../components/UpdatesSignup'
import { UpdatesLink } from '../../../components/UpdatesLink'
import { SpellBook } from './SpellBook'
import { PartySelect } from './PartySelect'
import { Glyph } from './Glyph'
import { clipPath, wizards } from './wizards'
import './wizard-wars.css'

// Elder Futhark, for the rune margins: the game's Storm Plateau obelisks are carved with them.
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'
const runeLine = (start: number, length: number) =>
  Array.from({ length }, (_, i) => RUNES[(start + i * 7) % RUNES.length]).join(' ')

const clips = [
  {
    name: 'brawl',
    title: 'Four-way brawl',
    caption:
      'Woodland, Free-for-All. Mud, flames, an ice patch and a frozen wizard in the first seven seconds.',
    label:
      'Four computer wizards fight in the Woodland: a mud patch, a ring of fire, an ice patch and a wizard frozen in an ice block',
  },
  {
    name: 'ultimates',
    title: 'Everybody’s ultimate at once',
    caption:
      'Storm Plateau. Meteor Storm, Absolute Zero, Earthquake and Overcharge, all four in one breath.',
    label:
      'On the Storm Plateau all four wizards cast their ultimates together: red sky and meteors, a frost sheet, cracked ground and crackling lightning',
  },
  {
    name: 'teams',
    title: 'Green vs Pink',
    caption:
      'The Volcano, two against two. The lava river burns, so you cross on the bridges.',
    label:
      'A two-against-two Teams battle on the Volcano stage, with a lava river down the middle and stone bridges across it',
  },
]

const stages = [
  { name: 'Woodland', cover: 'Tree stumps', hazard: '', tone: 'woodland' },
  { name: 'Frost Tundra', cover: 'Ice crystals', hazard: '', tone: 'tundra' },
  { name: 'Scorched Canyon', cover: 'Saguaro cacti', hazard: '', tone: 'canyon' },
  { name: 'Storm Plateau', cover: 'Rune stones', hazard: '', tone: 'plateau' },
  {
    name: 'Volcano',
    cover: 'Basalt boulders',
    hazard: 'A lava river burns anyone who wades in. Cross on the bridges.',
    tone: 'volcano',
  },
  {
    name: 'Swamp',
    cover: 'Toadstools',
    hazard: 'Bog pools slow you and stop your energy recharging.',
    tone: 'swamp',
  },
]

// From the game's README: pad for everyone, keyboard for player one.
const controls: [string, string, string][] = [
  ['Move', 'Left stick', 'W A S D'],
  ['Aim', 'Right stick', 'Arrow keys'],
  ['Basic attack (free)', 'RT', '1'],
  ['Second ability', 'LT', '2'],
  ['Third ability', 'RB', '3'],
  ['Fourth ability', 'LB', '4'],
  ['Ultimate (gold bar full)', 'X', '5'],
  ['Join / start / pause', 'Start', 'Enter'],
  ['Confirm / lock in', 'A', 'Space'],
  ['Back / leave', 'B', 'Backspace'],
  ['Free-for-All or Teams', 'Back / View', 'Tab'],
  ['Switch team', 'Y', 'T'],
  ['How to play (hold)', 'Right stick click', 'H'],
  ['Fullscreen / window', '', 'F11 or Alt+Enter'],
]

export default function WizardWarsPage({ project }: GamePageProps) {
  const { game } = project
  const releases = useReleases(game)
  const latest = releases.state === 'ok' ? releases.list[0] : undefined
  const images = project.images ?? []
  const [plate, setPlate] = useState<number | null>(null)

  useGoogleFonts([
    'Luckiest Guy',
    'Alegreya:ital,wght@0,400;0,700;1,400',
    'Cinzel Decorative:wght@700',
    'Noto Sans Runic',
  ])

  useEffect(() => {
    document.title = 'Wizard Wars | ECEC'
  }, [])

  const versionLine = latest
    ? `Version ${latest.version} · ${formatDate(latest.date)}${
        latest.sizeMb ? ` · ${latest.sizeMb} MB` : ''
      } · updates itself`
    : releases.state === 'none'
      ? 'Free for Windows · keeps itself up to date'
      : ' '

  return (
    <div className="ww">
      <a href="#ww-main" className="ww-skip">
        Skip to the spellbook
      </a>
      <header className="ww-topbar">
        <a href="/" className="ww-toplink">
          <span aria-hidden="true">←</span> ecec.dev
        </a>
        <a href={`/#project-${project.id}`} className="ww-toplink">
          All projects
        </a>
      </header>

      <main id="ww-main">
        {/* ---------- The cover spread ---------- */}
        <section className="ww-hero" aria-labelledby="ww-title">
          <div className="ww-book ww-book--hero">
            <Ribbon el="fire" side="left" />
            <Ribbon el="electricity" side="right" />
            <div className="ww-spread ww-spread--hero">
              <div className="ww-page ww-page--left">
                <p className="ww-runes" aria-hidden="true">
                  {runeLine(0, 14)}
                </p>
                <p className="ww-kicker">A spellbook for 1–4 wizards</p>
                <h1 id="ww-title" className="ww-title">
                  <span>Wizard</span> <span>Wars</span>
                </h1>
                <p className="ww-tagline">
                  Fire, frost, earth and lightning in a local arena battler. Grab a
                  controller, grab a friend, and be the last wizard standing.
                </p>
                <ul className="ww-facts" aria-label="At a glance">
                  <li>{game.players}</li>
                  <li>Free-for-All or Teams</li>
                  <li>{game.platform ?? 'Windows'} · free</li>
                </ul>
                <p className="ww-runes ww-runes--foot" aria-hidden="true">
                  {runeLine(5, 14)}
                </p>
              </div>
              <div className="ww-page ww-page--right">
                <div className="ww-cluster">
                  {wizards.map((w, i) => (
                    <img
                      key={w.id}
                      src={w.art}
                      alt={
                        i === 0
                          ? 'The four wizards: fire, frost, earth and electricity'
                          : ''
                      }
                      width={500}
                      height={485}
                      className="ww-cluster-art"
                      data-el={w.id}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="ww-orb-wrap">
              <a href={downloadPath(project)} className="ww-orb">
                <span className="ww-orb-start">Start</span>
                <span className="ww-orb-sub">Play {project.name}</span>
              </a>
              <p className="ww-version" aria-live="polite">
                {versionLine}
              </p>
              <UpdatesLink className="ww-updates-link" />
            </div>
          </div>
        </section>

        {/* ---------- Chapter I: the wizards ---------- */}
        <section className="ww-chapter" aria-labelledby="ww-ch-wizards">
          <ChapterHead n="I" id="ww-ch-wizards" title="Choose your wizard">
            Four wizards, one each: once a wizard is locked in, nobody else can pick them.
            Every wizard has a free basic attack, three abilities that cost energy, and an
            ultimate that charges with a gold bar.
          </ChapterHead>
          <div className="ww-book">
            <SpellBook />
          </div>
          <p className="ww-aside">
            Elements bump into each other on the floor, too: fire melts an ice patch, and
            mud puts a flame out.
          </p>
        </section>

        {/* ---------- Chapter II: clips ---------- */}
        <section className="ww-chapter" aria-labelledby="ww-ch-clips">
          <ChapterHead n="II" id="ww-ch-clips" title="Moving pictures">
            Recorded straight from the game: computer wizards, no tricks.
          </ChapterHead>
          <div className="ww-plates">
            {clips.map((clip, i) => (
              <figure key={clip.name} className="ww-plate" data-tilt={i % 3}>
                <div className="ww-plate-frame">
                  <LoopVideo
                    src={clipPath(`${clip.name}.mp4`)}
                    poster={clipPath(`${clip.name}.jpg`)}
                    label={clip.label}
                    width={960}
                    height={540}
                  />
                </div>
                <figcaption>
                  <strong>{clip.title}</strong> {clip.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ---------- Chapter III: party ---------- */}
        <section className="ww-chapter" aria-labelledby="ww-ch-party">
          <ChapterHead n="III" id="ww-ch-party" title="Gather your party">
            Up to four players on one screen. Each presses Start on a controller to join;
            player one can use the keyboard instead. Try it:
          </ChapterHead>
          <div className="ww-book">
            <div className="ww-spread ww-spread--single">
              <div className="ww-page">
                <PartySelect />
              </div>
            </div>
          </div>
          <p className="ww-aside">
            Matches are best of 1, 3 or 5 rounds, with a scoreboard in between. When it is
            over, everyone stays joined, so a rematch is one press of Start.
          </p>
        </section>

        {/* ---------- Chapter IV: stages ---------- */}
        <section className="ww-chapter" aria-labelledby="ww-ch-stages">
          <ChapterHead n="IV" id="ww-ch-stages" title="Six arenas">
            Every arena has its own cover to duck behind. If it casts a shadow, it stops
            shots.
          </ChapterHead>
          <ul className="ww-stages">
            {stages.map((s) => (
              <li key={s.name} className="ww-stage" data-tone={s.tone}>
                <h3>{s.name}</h3>
                <p>
                  <span className="ww-stage-label">Cover</span> {s.cover}
                </p>
                {s.hazard && (
                  <p className="ww-stage-hazard">
                    <span className="ww-stage-label">Hazard</span> {s.hazard}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Plates: screenshots ---------- */}
        {images.length > 0 && (
          <section className="ww-chapter" aria-labelledby="ww-ch-shots">
            <ChapterHead n="V" id="ww-ch-shots" title="Illustrations">
              Tap one for a closer look.
            </ChapterHead>
            <ul className="ww-shots">
              {images.map((img, i) => (
                <li key={img.src}>
                  <button
                    type="button"
                    className="ww-shot"
                    onClick={() => setPlate(i)}
                    aria-label={`Enlarge: ${img.alt}`}
                  >
                    <img src={img.src} alt="" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
            <Lightbox
              images={images}
              index={plate}
              onIndexChange={setPlate}
              onClose={() => setPlate(null)}
              label={`${project.name} screenshots`}
            />
          </section>
        )}

        {/* ---------- About + controls ---------- */}
        <section className="ww-chapter" aria-labelledby="ww-ch-about">
          <ChapterHead n="VI" id="ww-ch-about" title="About the book" />
          <div className="ww-book">
            <div className="ww-spread">
              <div className="ww-page ww-page--left ww-prose">
                {game.about.map((p, i) => (
                  <p key={i} className={i === 0 ? 'ww-dropcap' : undefined}>
                    {p}
                  </p>
                ))}
              </div>
              <div className="ww-page ww-page--right">
                <h3 className="ww-subhead" id="ww-controls">
                  Controls
                </h3>
                <div className="ww-table-wrap">
                  <table className="ww-controls" aria-labelledby="ww-controls">
                    <thead>
                      <tr>
                        <th scope="col">Action</th>
                        <th scope="col">Pad</th>
                        <th scope="col">Keys (P1)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {controls.map(([action, pad, key]) => (
                        <tr key={action}>
                          <th scope="row">{action}</th>
                          <td>{pad ? <kbd>{pad}</kbd> : '—'}</td>
                          <td>
                            <kbd>{key}</kbd>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- What's new ---------- */}
        {!game.comingSoon && (
          <section className="ww-chapter" aria-labelledby="ww-ch-new">
            <ChapterHead n="VII" id="ww-ch-new" title="What’s new" />
            {releases.state === 'ok' ? (
              <ol className="ww-releases">
                {releases.list.slice(0, 4).map((r) => (
                  <li key={r.version} className="ww-release">
                    <p className="ww-release-head">
                      <a href={r.url}>Version {r.version}</a>{' '}
                      <span>{formatDate(r.date)}</span>
                    </p>
                    {r.notes
                      .split(/\n\s*\n/)
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="ww-aside">
                {releases.state === 'loading'
                  ? 'Turning the pages…'
                  : 'The release notes live on GitHub.'}
              </p>
            )}
            <p className="ww-center">
              <a
                className="ww-chip-btn"
                href={`https://github.com/eclancy/${game.repo}/releases`}
              >
                Every version
              </a>
            </p>
            <UpdatesSignup game={project.id} name={project.name} className="ww-signup" />
          </section>
        )}

        <section className="ww-finale" aria-label="Download">
          <div className="ww-finale-wizards" aria-hidden="true">
            {wizards.map((w) => (
              <span key={w.id} data-el={w.id}>
                <Glyph id={w.id} />
              </span>
            ))}
          </div>
          <a href={downloadPath(project)} className="ww-big-btn">
            Play {project.name}
          </a>
          <p className="ww-version">{versionLine}</p>
        </section>
      </main>

      <footer className="ww-footer">
        <a href="/">ecec.dev</a>
        {project.repoUrl && <a href={project.repoUrl}>Source on GitHub</a>}
        <a href={`https://github.com/eclancy/${game.repo}/releases`}>All versions</a>
      </footer>
    </div>
  )
}

function ChapterHead({
  n,
  id,
  title,
  children,
}: {
  n: string
  id: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="ww-chapter-head">
      <p className="ww-chapter-n">Chapter {n}</p>
      <h2 id={id}>{title}</h2>
      {children && <p className="ww-chapter-lede">{children}</p>}
    </div>
  )
}

function Ribbon({ el, side }: { el: string; side: 'left' | 'right' }) {
  return (
    <span className="ww-deco-ribbon" data-el={el} data-side={side} aria-hidden="true" />
  )
}
