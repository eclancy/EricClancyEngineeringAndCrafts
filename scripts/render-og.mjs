// Renders one 1200x630 Open Graph card per entry in og-cards.json into public/og/.
//
// Uses a headless Chrome directly rather than adding Playwright to the project's
// dependencies. Point CHROME at a binary if none of the usual paths exist:
//   CHROME=/path/to/chrome node scripts/render-og.mjs
//
// The cards are committed, so this only needs re-running when the copy or the
// template changes.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const outDir = join(root, 'public', 'og')

const CANDIDATES = [
  process.env.CHROME,
  '/opt/pw-browsers/chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean)

function findChrome() {
  for (const c of CANDIDATES) {
    try {
      execFileSync(c, ['--version'], { stdio: 'ignore' })
      return c
    } catch {
      /* try the next one */
    }
  }
  throw new Error(
    `No Chrome found. Tried:\n  ${CANDIDATES.join('\n  ')}\nSet CHROME=/path/to/chrome and re-run.`,
  )
}

const chrome = findChrome()
const template = readFileSync(join(here, 'og-card.html'), 'utf8')
const cards = JSON.parse(readFileSync(join(here, 'short-links.json'), 'utf8'))
const staging = mkdtempSync(join(tmpdir(), 'og-'))

mkdirSync(outDir, { recursive: true })

const WIDTH = 1200
const HEIGHT = 630

function shoot(pageUrl, pngPath, windowHeight) {
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${WIDTH},${windowHeight}`,
      `--screenshot=${pngPath}`,
      pageUrl,
    ],
    { stdio: 'ignore' },
  )
}

// A PNG's IHDR puts width and height at bytes 16-23, big-endian.
function pngSize(path) {
  const head = readFileSync(path).subarray(0, 24)
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) }
}

// Chrome screenshots the viewport, which is the window minus its own chrome --
// and that inset is not the same across platforms or versions. Asking for a
// 630px window silently yields a shorter viewport, leaving the bottom of the
// card unpainted. So measure the inset once against a known window, then size
// every real render to land on exactly 1200x630.
function calibrate() {
  const probePage = join(staging, 'probe.html')
  const probePng = join(staging, 'probe.png')
  writeFileSync(probePage, '<!doctype html><title>probe</title>')
  shoot(`file://${probePage}`, probePng, 800)
  const inset = 800 - pngSize(probePng).height
  if (inset < 0 || inset > 400) {
    throw new Error(`Implausible viewport inset of ${inset}px; refusing to guess.`)
  }
  return inset
}

const inset = calibrate()
const windowHeight = HEIGHT + inset
console.log(`viewport inset ${inset}px -> rendering in a ${WIDTH}x${windowHeight} window`)

// Escape for HTML text context. The copy is ours, but a stray & or < in a card
// would otherwise produce invalid markup and a silently wrong render.
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

for (const card of cards) {
  let html = template
  for (const field of ['eyebrow', 'title', 'sub', 'url']) {
    const marker = `data-og="${field}"></div>`
    if (!html.includes(marker)) {
      throw new Error(`Template is missing a placeholder for "${field}".`)
    }
    html = html.replace(marker, `data-og="${field}">${esc(card[field])}</div>`)
  }

  const page = join(staging, `${card.slug}.html`)
  const png = join(outDir, `${card.slug}.png`)
  writeFileSync(page, html)
  shoot(`file://${page}`, png, windowHeight)

  const got = pngSize(png)
  if (got.width !== WIDTH || got.height !== HEIGHT) {
    throw new Error(
      `${card.slug}.png came out ${got.width}x${got.height}, expected ${WIDTH}x${HEIGHT}.`,
    )
  }
  console.log(`rendered public/og/${card.slug}.png`)
}
