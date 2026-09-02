#!/usr/bin/env node
// Prints the current README/overview text for each source project so it can be
// compared against src/data/projects.ts and updated by hand (or via the
// content-updater agent). Does not write any files.
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const GITHUB_ROOT = 'C:\\Users\\ericc\\Documents\\GitHub'

const sources = [
  { id: 'wizard-wars', dir: 'WizardsArena', file: 'GAME_COMPLETION_PLAN.md' },
  { id: 'erics-miniatures', dir: 'EricsMiniatures', file: 'README.md' },
  { id: 'wizard-survivors', dir: 'wizard-survivors', file: '.ai/project-overview.md' },
]

for (const source of sources) {
  const filePath = path.join(GITHUB_ROOT, source.dir, source.file)
  try {
    const content = await readFile(filePath, 'utf8')
    console.log(`\n=== ${source.id} (${filePath}) ===\n`)
    console.log(content)
  } catch (err) {
    console.error(`Could not read ${filePath}: ${err.message}`)
  }
}
