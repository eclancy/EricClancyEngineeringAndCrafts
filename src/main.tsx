import {
  StrictMode,
  Suspense,
  lazy,
  type ComponentType,
  type LazyExoticComponent,
} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { projects, type GameInfo, type Project } from './data/projects'
import { GamePage } from './pages/GamePage'
import type { GamePageProps } from './pages/games/types'

// The site is one page plus a page per game at /games/<id>. nginx's SPA fallback serves
// index.html for both, so a switch here is all the routing there is. Each game's page is its
// own design and its own chunk, loaded only when someone visits it.
const designedPages: Record<string, LazyExoticComponent<ComponentType<GamePageProps>>> = {
  drawfight: lazy(() => import('./pages/games/drawfight/DrawFightPage')),
  drawpets: lazy(() => import('./pages/games/drawpets/DrawPetsPage')),
  'wizard-survivors': lazy(
    () => import('./pages/games/wizard-survivors/WizardSurvivorsPage'),
  ),
  'wizard-wars': lazy(() => import('./pages/games/wizard-wars/WizardWarsPage')),
}

const gameId = window.location.pathname.match(/^\/games\/([^/]+)\/?$/)?.[1]
const game = projects.find(
  (p): p is Project & { game: GameInfo } => p.id === gameId && p.game !== undefined,
)
const Designed = game ? designedPages[game.id] : undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {game ? (
      Designed ? (
        <Suspense fallback={null}>
          <Designed project={game} />
        </Suspense>
      ) : (
        <GamePage project={game} />
      )
    ) : (
      <App />
    )}
  </StrictMode>,
)
