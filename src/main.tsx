import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { projects, type GameInfo, type Project } from './data/projects'
import { GamePage } from './pages/GamePage'
import { GameLoader } from './pages/games/GameLoader'
import { gamePageLoaders } from './pages/games/loaders'

// The site is one page plus a page per game at /games/<id>. nginx serves index.html for both,
// so a switch here is all the routing there is. Each game's page is its own design and its own
// chunk, loaded only when someone visits it; GameLoader fills the moment while it downloads.
const gameId = window.location.pathname.match(/^\/games\/([^/]+)\/?$/)?.[1]
const game = projects.find(
  (p): p is Project & { game: GameInfo } => p.id === gameId && p.game !== undefined,
)
const load = game ? gamePageLoaders[game.id] : undefined
const Designed = load ? lazy(load) : undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {game ? (
      Designed ? (
        <Suspense fallback={<GameLoader id={game.id} name={game.name} />}>
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
