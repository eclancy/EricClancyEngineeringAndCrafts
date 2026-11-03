#!/usr/bin/env node
// Prints the current README/overview text for each source project so it can be
// compared against src/data/projects.ts and updated by hand (or via the
// content-updater agent). Does not write any files.
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const GITHUB_ROOT = 'C:\\Users\\ericc\\Documents\\GitHub'

const sources = [
  { id: 'drawfight', dir: 'DrawFight', file: 'README.md' },
  { id: 'wizard-wars', dir: 'WizardsArena', file: 'GAME_COMPLETION_PLAN.md' },
  { id: 'erics-miniatures', dir: 'EricsMiniatures', file: 'README.md' },
  // The local checkout kept its old folder name when the game was renamed (renaming it would
  // break every worktree), so look for the new name first and fall back to that one.
  {
    id: 'the-one-he-missed',
    dir: ['TheOneHeMissed', 'WizardSurvivors'],
    file: '.ai/project-overview.md',
  },
]

for (const source of sources) {
  const dirs = Array.isArray(source.dir) ? source.dir : [source.dir]
  const found = dirs.find((dir) => existsSync(path.join(GITHUB_ROOT, dir, source.file)))
  const filePath = path.join(GITHUB_ROOT, found ?? dirs[0], source.file)
  try {
    const content = await readFile(filePath, 'utf8')
    console.log(`\n=== ${source.id} (${filePath}) ===\n`)
    console.log(content)
  } catch (err) {
    console.error(`Could not read ${filePath}: ${err.message}`)
  }
}
