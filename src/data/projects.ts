import dfTitleScreen from '../assets/projects/drawfight/title-screen.jpg'
import dfPoses from '../assets/projects/drawfight/poses.jpg'
import dfStagePlains from '../assets/projects/drawfight/stage-plains.jpg'
import wsTitleScreen from '../assets/projects/wizard-survivors/title-screen.jpg'
import wsMeadowBattle from '../assets/projects/wizard-survivors/meadow-battle.jpg'
import wsDungeonBattle from '../assets/projects/wizard-survivors/dungeon-battle.jpg'
import wwStartScreen from '../assets/projects/wizard-wars/start-screen-transparent.png'
import wwArenaBattle from '../assets/projects/wizard-wars/arena-battle.jpg'
import wwFireSpell from '../assets/projects/wizard-wars/fire-spell.jpg'
import emLogo from '../assets/projects/erics-miniatures/logo.png'
import emTerrain from '../assets/projects/erics-miniatures/terrain.jpg'
import emEscapeRealityFeature from '../assets/projects/erics-miniatures/escape-reality-feature.jpg'

export interface ProjectImage {
  src: string
  alt: string
  fit?: 'contain'
}

export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  tech: string[]
  repoUrl?: string
  liveUrl?: string
  /** Label for the liveUrl button. Defaults to 'Live demo'. */
  liveLabel?: string
  images?: ProjectImage[]
}

// Curated from each project's README / design docs. Refresh via the
// content-updater agent when a project's scope or stack changes.
export const projects: Project[] = [
  {
    id: 'drawfight',
    name: 'DrawFight',
    tagline: "A platform fighter where every character is a kid's drawing.",
    description:
      'A local-multiplayer platform fighter with Smash-style percent, knockback, and ' +
      'stocks. Every fighter starts as a drawing on paper, cut into body parts and ' +
      'rigged to a shared skeleton, so the original linework is what moves on screen.',
    tech: ['Godot 4.5', 'C#', '.NET 9'],
    repoUrl: 'https://github.com/eclancy/DrawFight',
    images: [
      { src: dfTitleScreen, alt: 'DrawFight title screen', fit: 'contain' },
      {
        src: dfPoses,
        alt: 'One DrawFight stick figure shown in ten animation poses',
      },
      { src: dfStagePlains, alt: 'DrawFight match on the Open Plains stage' },
    ],
  },
  {
    id: 'wizard-survivors',
    name: 'Wizard Survivors',
    tagline: 'A 2D roguelite auto-shooter built in Godot 4 with C#.',
    description:
      'A fast-paced survival game inspired by Vampire Survivors. Choose from 12 elemental ' +
      'spells and upgrades to shape your wizard, then survive increasingly difficult waves ' +
      'of enemies.',
    tech: ['Godot 4', 'C#', '.NET 9'],
    repoUrl: 'https://github.com/eclancy/WizardSurvivors',
    images: [
      { src: wsTitleScreen, alt: 'Wizard Survivors title screen', fit: 'contain' },
      { src: wsMeadowBattle, alt: 'Wizard Survivors battle in a meadow' },
      { src: wsDungeonBattle, alt: 'Wizard Survivors battle in a dungeon' },
    ],
  },
  {
    id: 'wizard-wars',
    name: 'Wizard Wars',
    tagline: 'A local multiplayer wizard battle arena for up to 4 players.',
    description:
      'A local party game for up to four players. Choose a wizard and battle with fire, ' +
      'ice, earth, or lightning attacks across several arena stages. Each element can ' +
      'counter another, rewarding quick decisions and teamwork.',
    tech: ['Unity', 'UnityScript'],
    repoUrl: 'https://github.com/eclancy/WizardWars',
    images: [
      { src: wwStartScreen, alt: 'Wizard Wars title screen', fit: 'contain' },
      { src: wwArenaBattle, alt: 'Wizard Wars character select screen' },
      { src: wwFireSpell, alt: 'Wizard Wars ring of fire attack' },
    ],
  },
  {
    id: 'erics-miniatures',
    name: "Eric's Miniatures",
    tagline: 'A personal arts & crafts showcase site.',
    description:
      'A website that shares hand-painted miniatures and other handmade art projects. ' +
      'Built with React, TypeScript, Material UI, and SASS.',
    tech: ['React', 'TypeScript', 'Material UI', 'SASS'],
    repoUrl: 'https://github.com/eclancy/EricsMiniatures',
    liveUrl: 'https://ericsminiatures.com',
    liveLabel: 'Visit site',
    images: [
      { src: emLogo, alt: "Eric's Miniatures logo", fit: 'contain' },
      {
        src: emEscapeRealityFeature,
        alt: "Eric's Miniatures Art That Escapes Reality feature",
      },
      { src: emTerrain, alt: "Eric's Miniatures Custom Built Terrain page" },
    ],
  },
]
