import wsTitleScreen from '../assets/projects/wizard-survivors/title-screen.jpg'
import wsMeadowBattle from '../assets/projects/wizard-survivors/meadow-battle.jpg'
import wsDungeonBattle from '../assets/projects/wizard-survivors/dungeon-battle.jpg'
import wwStartScreen from '../assets/projects/wizard-wars/start-screen-transparent.png'
import wwArenaBattle from '../assets/projects/wizard-wars/arena-battle.jpg'
import wwFireSpell from '../assets/projects/wizard-wars/fire-spell.jpg'
import emLogo from '../assets/projects/erics-miniatures/logo.png'
import emEscapeReality from '../assets/projects/erics-miniatures/escape-reality.jpg'
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
  images?: ProjectImage[]
}

// Curated from each project's README / design docs. Refresh via the
// content-updater agent when a project's scope or stack changes.
export const projects: Project[] = [
  {
    id: 'wizard-survivors',
    name: 'Wizard Survivors',
    tagline: 'A 2D roguelite auto-shooter built in Godot 4 with C#.',
    description:
      'A Vampire Survivors-inspired roguelite where you build a wizard around 12 ' +
      'elemental spell types, chaining upgrades and tier thresholds into emergent builds ' +
      'across escalating waves of enemies.',
    tech: ['Godot 4', 'C#', '.NET 9'],
    repoUrl: 'https://github.com/Rhystus/wizard-survivors',
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
      'A couch-multiplayer party game where up to four wizards face off with ' +
      'controller-driven elemental attacks (fire, ice, earth, and electric), each with ' +
      'counters and combo potential across multiple arena stages.',
    tech: ['Unity', 'UnityScript'],
    repoUrl: 'https://github.com/eclancy/WizardWars',
    images: [
      { src: wwStartScreen, alt: 'Wizard Wars title screen', fit: 'contain' },
      { src: wwArenaBattle, alt: 'Wizard Wars start menu' },
      { src: wwFireSpell, alt: 'Wizard Wars fire spell combat' },
    ],
  },
  {
    id: 'erics-miniatures',
    name: "Eric's Miniatures",
    tagline: 'A personal arts & crafts showcase site.',
    description:
      'A personal website for showcasing hand-painted miniatures and other arts and ' +
      'crafts projects, built with a classic React + Material-UI stack.',
    tech: ['React', 'TypeScript', 'Material UI', 'SASS'],
    repoUrl: 'https://github.com/eclancy/EricsMiniatures',
    images: [
      { src: emLogo, alt: "Eric's Miniatures logo", fit: 'contain' },
      { src: emEscapeReality, alt: "Eric's Miniatures Art That Escapes Reality page" },
      { src: emTerrain, alt: "Eric's Miniatures Custom Built Terrain page" },
      { src: emEscapeRealityFeature, alt: "Eric's Miniatures Art That Escapes Reality feature" },
    ],
  },
]
