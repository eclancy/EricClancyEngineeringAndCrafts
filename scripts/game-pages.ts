import type { Plugin } from 'vite'
import {
  ORIGIN,
  gameSeo,
  gameStructuredData,
  homeSeo,
  homeStructuredData,
  type PageSeo,
} from '../src/data/seo.ts'

// Fills index.html's share block (between the share:start and share:end comments) with the
// home page's title, description, preview tags and structured data, and writes
// dist/games/<id>/index.html for each game page with the game's own. nginx serves that file at
// /games/<id>, so a game link pasted into Messages or Discord previews the game, and search
// engines index each page under its own title. Link previewers and most crawlers don't run
// JavaScript, so setting these from React would be too late for them.
//
// The text lives in src/data/seo.ts. A new game needs an entry there, or nginx answers its
// page with a 404 (see the /games location in nginx.conf).

const BLOCK = /<!-- share:start[\s\S]*?<!-- share:end -->/

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// JSON in a <script> ends at the first "</", so that can't appear inside it.
const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

interface Share extends PageSeo {
  url: string
  ogTitle: string
  image: { url: string; width: number; height: number; alt?: string }
  structuredData: unknown[]
}

function shareBlock(page: Share): string {
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${page.url}" />`,
    `<meta property="og:title" content="${esc(page.ogTitle)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${page.url}" />`,
    `<meta property="og:site_name" content="ECEC" />`,
    `<meta property="og:image" content="${page.image.url}" />`,
    `<meta property="og:image:width" content="${page.image.width}" />`,
    `<meta property="og:image:height" content="${page.image.height}" />`,
    ...(page.image.alt
      ? [`<meta property="og:image:alt" content="${esc(page.image.alt)}" />`]
      : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${page.image.url}" />`,
    ...page.structuredData.map(jsonLd),
  ]
  // The comments stay, so the build can find the block again in the built index.html.
  return ['<!-- share:start -->', ...tags, '<!-- share:end -->'].join('\n    ')
}

const home: Share = {
  ...homeSeo,
  url: `${ORIGIN}/`,
  ogTitle: 'Eric Clancy Engineering & Crafts',
  image: { url: `${ORIGIN}/og-image.png`, width: 1200, height: 630 },
  structuredData: homeStructuredData,
}

export function gamePages(): Plugin {
  return {
    name: 'ecec-game-pages',
    transformIndexHtml(html) {
      if (!BLOCK.test(html))
        throw new Error('index.html has no share:start/share:end block')
      return html.replace(BLOCK, shareBlock(home))
    },
    // After Vite's own HTML plugin has put the built index.html in the bundle.
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') this.error('no index.html in the build')
      const html = String(index.source)
      for (const [id, game] of Object.entries(gameSeo)) {
        const page: Share = {
          title: game.title,
          description: game.description,
          url: `${ORIGIN}/games/${id}`,
          ogTitle: game.name,
          image: { url: `${ORIGIN}/${id}/download/title-screen.jpg`, ...game.image },
          structuredData: [gameStructuredData(id, game)],
        }
        this.emitFile({
          type: 'asset',
          fileName: `games/${id}/index.html`,
          source: html.replace(BLOCK, shareBlock(page)),
        })
      }
    },
  }
}
