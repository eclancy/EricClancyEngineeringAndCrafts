export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  tech: string[]
  repoUrl?: string
  liveUrl?: string
  image?: string
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
  },
  {
    id: 'wizard-wars',
    name: 'Wizard Wars',
    tagline: 'A local multiplayer wizard battle arena for up to 4 players.',
    description:
      'A couch-multiplayer party game where up to four wizards face off with ' +
      'controller-driven elemental attacks — fire, ice, earth, and electric — each with ' +
      'counters and combo potential across multiple arena stages.',
    tech: ['Unity', 'UnityScript'],
    repoUrl: 'https://github.com/eclancy/WizardWars',
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
  },
]

