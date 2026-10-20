import type { ComponentType } from 'react'
import type { GamePageProps } from './types'

type PageModule = { default: ComponentType<GamePageProps> }

// Each designed game page is its own chunk. main.tsx lazy-loads these for /games/<id>, and the
// home page's project cards call prefetchGamePage on hover, focus or touch, so the chunk is often
// already downloaded by the time the click lands. import() caches, so prefetching twice is free.
export const gamePageLoaders: Record<string, () => Promise<PageModule>> = {
  drawfight: () => import('./drawfight/DrawFightPage'),
  drawpets: () => import('./drawpets/DrawPetsPage'),
  'wizard-survivors': () => import('./wizard-survivors/WizardSurvivorsPage'),
  'wizard-wars': () => import('./wizard-wars/WizardWarsPage'),
}

export function prefetchGamePage(id: string) {
  gamePageLoaders[id]?.().catch(() => {})
}
