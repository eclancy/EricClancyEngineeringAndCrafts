import type { GameInfo, Project } from '../../data/projects'

/** What every game page receives: its entry from src/data/projects.ts. */
export interface GamePageProps {
  project: Project & { game: GameInfo }
}
