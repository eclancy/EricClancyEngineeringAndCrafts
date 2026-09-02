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
    repoUrl: 'https://github.com/ericclancy/wizard-survivors',
  },
  {
    id: 'arcane-arena',
    name: 'Arcane Arena',
    tagline: 'An arena shooter where every player is a spellcasting wizard.',
    description:
      'A Quake-like arena shooter reimagined with wizard classes, combo-able spells, and ' +
      'deep character builds, drawing inspiration from Deep Rock Galactic, Magicka, and ' +
      'classic arena shooters.',
    tech: ['Unity', 'C#'],
    repoUrl: 'https://github.com/ericclancy/ArcaneArena',
  },
  {
    id: 'erics-miniatures',
    name: "Eric's Miniatures",
    tagline: 'A personal arts & crafts showcase site.',
    description:
      'A personal website for showcasing hand-painted miniatures and other arts and ' +
      'crafts projects, built with a classic React + Material-UI stack.',
    tech: ['React', 'TypeScript', 'Material UI', 'SASS'],
    repoUrl: 'https://github.com/ericclancy/EricsMiniatures',
  },
]
