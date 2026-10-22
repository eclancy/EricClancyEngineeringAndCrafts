import type { Plugin } from 'vite'

// Writes dist/games/<id>/index.html for each game page: the built index.html with its share
// block (between the share:start and share:end comments) swapped for the game's own title,
// description and preview image. nginx serves that file at /games/<id>, so a game link pasted
// into Messages or Discord previews the game, and search engines index each page under its
// own title, instead of every page carrying the home page's tags. Link previewers don't run
// JavaScript, so setting these from React would be too late for them.
//
// The preview images are the ones the download pages already use. A new game needs an entry
// here, or nginx answers its page with a 404 (see the /games location in nginx.conf).

const ORIGIN = 'https://ecec.dev'

interface GameShare {
  name: string
  description: string
  image: { width: number; height: number; alt: string }
}

const games: Record<string, GameShare> = {
  drawfight: {
    name: 'DrawFight',
    description:
      "A Smash-style fighting game where every fighter is a kid's drawing. Free for " +
      'Windows, for 1 to 4 players with controllers or the keyboard.',
    image: { width: 1200, height: 675, alt: 'The DrawFight title screen.' },
  },
  drawpets: {
    name: 'DrawPets',
    description:
      'A virtual pet you draw part by part, then watch come alive and look after. Free for ' +
      'Windows, Android and any browser, with no ads, no accounts and no AI.',
    image: { width: 1200, height: 675, alt: 'The DrawPets title screen.' },
  },
  'wizard-survivors': {
    name: 'Wizard Survivors',
    description:
      'A roguelite auto-shooter: move, survive, and let your spells do the rest. Free for ' +
      'Windows and Android.',
    image: { width: 1200, height: 675, alt: 'The Wizard Survivors title screen.' },
  },
  'wizard-wars': {
    name: 'Wizard Wars',
    description:
      'Fire, frost, earth or lightning: a wizard battle arena for up to four players. ' +
      'Free for Windows.',
    image: { width: 1200, height: 750, alt: 'The Wizard Wars title screen.' },
  },
}

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function shareTags(id: string, game: GameShare): string {
  const url = `${ORIGIN}/games/${id}`
  const image = `${ORIGIN}/${id}/download/title-screen.jpg`
  return [
    `<title>${esc(game.name)} | ECEC</title>`,
    `<meta name="description" content="${esc(game.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(game.name)}" />`,
    `<meta property="og:description" content="${esc(game.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="ECEC" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${game.image.width}" />`,
    `<meta property="og:image:height" content="${game.image.height}" />`,
    `<meta property="og:image:alt" content="${esc(game.image.alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ')
}

export function gamePages(): Plugin {
  return {
    name: 'ecec-game-pages',
    apply: 'build',
    // After Vite's own HTML plugin has put the built index.html in the bundle.
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') this.error('no index.html in the build')
      const html = String(index.source)
      const block = /<!-- share:start[\s\S]*?<!-- share:end -->/
      if (!block.test(html)) this.error('index.html has no share:start/share:end block')
      for (const [id, game] of Object.entries(games)) {
        this.emitFile({
          type: 'asset',
          fileName: `games/${id}/index.html`,
          source: html.replace(block, shareTags(id, game)),
        })
      }
    },
  }
}
