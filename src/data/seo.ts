// What search engines and link previews show for each page: its title, description and the
// structured data that tells Google what the page is about. scripts/game-pages.ts writes it
// into the HTML at build time (previewers and most crawlers don't run JavaScript), and the
// game pages read their titles from here so the tab never disagrees with the HTML.
//
// No imports: vite.config.ts loads this through scripts/game-pages.ts, outside the app build.

export const ORIGIN = 'https://ecec.dev'

export interface PageSeo {
  /** Under about 60 characters, or Google cuts it short. */
  title: string
  /** Under about 155 characters, for the same reason. */
  description: string
}

export interface GameSeo extends PageSeo {
  name: string
  /** The download page's preview image, public/<id>/download/title-screen.jpg. */
  image: { width: number; height: number; alt: string }
  genre: string[]
  platforms: string[]
  players: { min: number; max: number }
}

const person = {
  '@type': 'Person',
  name: 'Eric Clancy',
  url: `${ORIGIN}/`,
}

export const homeSeo: PageSeo = {
  title: 'Eric Clancy – Full-Stack Developer & Free Games | ECEC',
  description:
    'Eric Clancy is a full-stack developer and technical lead who builds with AI. Play ' +
    'his free games: DrawFight, DrawPets, Wizard Survivors and Wizard Wars.',
}

export const homeStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ECEC',
    alternateName: 'Eric Clancy Engineering & Crafts',
    url: `${ORIGIN}/`,
  },
  {
    '@context': 'https://schema.org',
    ...person,
    jobTitle: 'Full Stack Developer, Technical Lead & AI Specialist',
    email: 'mailto:eric@ecec.dev',
    sameAs: ['https://github.com/eclancy', 'https://www.linkedin.com/in/ericclancy/'],
  },
]

export const gameSeo: Record<string, GameSeo> = {
  drawfight: {
    name: 'DrawFight',
    title: "DrawFight – Free Fighting Game Made of Kids' Drawings",
    description:
      "A Smash-style fighting game where every fighter is a kid's drawing. Free for " +
      'Windows, for 1 to 4 players with controllers or the keyboard.',
    image: { width: 1200, height: 675, alt: 'The DrawFight title screen.' },
    genre: ['Fighting', 'Platform fighter'],
    platforms: ['Windows'],
    players: { min: 1, max: 4 },
  },
  drawpets: {
    name: 'DrawPets',
    title: 'DrawPets – Draw Your Own Virtual Pet, Free',
    description:
      'A virtual pet you draw part by part, then watch come alive and look after. Free for ' +
      'Windows, Android and any browser, with no ads, no accounts and no AI.',
    image: { width: 1200, height: 675, alt: 'The DrawPets title screen.' },
    genre: ['Virtual pet', 'Drawing'],
    platforms: ['Windows', 'Android', 'Web browser'],
    players: { min: 1, max: 1 },
  },
  'wizard-survivors': {
    name: 'Wizard Survivors',
    title: 'Wizard Survivors – Free Roguelite Spell Shooter',
    description:
      'A roguelite auto-shooter: move, survive, and let your spells do the rest. Free for ' +
      'Windows and Android.',
    image: { width: 1200, height: 675, alt: 'The Wizard Survivors title screen.' },
    genre: ['Roguelite', 'Shooter'],
    platforms: ['Windows', 'Android'],
    players: { min: 1, max: 1 },
  },
  'wizard-wars': {
    name: 'Wizard Wars',
    title: 'Wizard Wars – Free 4-Player Wizard Battle Game',
    description:
      'Fire, frost, earth or lightning: a wizard battle arena for up to four players. ' +
      'Free for Windows.',
    image: { width: 1200, height: 750, alt: 'The Wizard Wars title screen.' },
    genre: ['Party', 'Battle arena'],
    platforms: ['Windows'],
    players: { min: 1, max: 4 },
  },
}

/** A game page's schema.org VideoGame, for Google to read what the game is. */
export function gameStructuredData(id: string, game: GameSeo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    description: game.description,
    url: `${ORIGIN}/games/${id}`,
    image: `${ORIGIN}/${id}/download/title-screen.jpg`,
    author: person,
    genre: game.genre,
    gamePlatform: game.platforms,
    applicationCategory: 'GameApplication',
    operatingSystem: game.platforms.filter((p) => p !== 'Web browser').join(', '),
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: game.players.min,
      maxValue: game.players.max,
    },
    playMode: game.players.max > 1 ? ['SinglePlayer', 'MultiPlayer'] : ['SinglePlayer'],
    downloadUrl: `${ORIGIN}/${id}/download`,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}
