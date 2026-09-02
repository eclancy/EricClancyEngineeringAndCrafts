import wsTitleScreen from '../assets/projects/wizard-survivors/title-screen.jpg'
import wwStartScreen from '../assets/projects/wizard-wars/start-screen.jpg'
import emClockworkDragon from '../assets/projects/erics-miniatures/clockwork-dragon.jpg'
import emPurpleWorm from '../assets/projects/erics-miniatures/purple-worm.jpg'
import emMasterLich from '../assets/projects/erics-miniatures/master-lich.jpg'

export interface ProjectImage {
  src: string
  alt: string
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
    images: [{ src: wsTitleScreen, alt: 'Wizard Survivors title screen' }],
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
    images: [{ src: wwStartScreen, alt: 'Wizard Wars title screen' }],
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
      { src: emClockworkDragon, alt: 'Hand-painted clockwork dragon miniature' },
      { src: emPurpleWorm, alt: 'Hand-painted purple worm miniature' },
      { src: emMasterLich, alt: 'Hand-painted master lich miniature' },
    ],
  },
]
