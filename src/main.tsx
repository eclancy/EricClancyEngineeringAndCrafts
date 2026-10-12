import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { projects, type GameInfo, type Project } from './data/projects'
import { GamePage } from './pages/GamePage'

// The site is one page plus a page per game at /games/<id>. nginx's SPA fallback serves
// index.html for both, so a two-way switch here is all the routing there is.
const gameId = window.location.pathname.match(/^\/games\/([^/]+)\/?$/)?.[1]
const game = projects.find(
  (p): p is Project & { game: GameInfo } => p.id === gameId && p.game !== undefined,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>{game ? <GamePage project={game} /> : <App />}</StrictMode>,
)
