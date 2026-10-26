// Renders the link-preview card for ecec.dev/house-share (public/house-share/preview.png,
// 1200x630) from the page itself: its night sky, its drawing of the house, and the
// "We bought a house!" heading. Run after changing the drawing:
//
//   node scripts/house-share-card.mjs
//
// then bump the ?v= on og:image and twitter:image in public/house-share/index.html, so Discord,
// Messages and the rest fetch the new card instead of the one they cached.
//
// Uses a headless Chrome directly, like render-og.mjs. Point CHROME at a binary if needed.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const page = readFileSync(join(root, 'public/house-share/index.html'), 'utf8')
const out = join(root, 'public/house-share/preview.png')

const pick = (re, what) => {
  const m = page.match(re)
  if (!m) throw new Error(`No ${what} in public/house-share/index.html`)
  return m[0]
}
const style = pick(/<style>[\s\S]*?<\/style>/, '<style>')
const sky = pick(/<svg\s+class="sky"[\s\S]*?<\/svg>/, 'sky')
const scene = pick(/<svg\s+class="scene"[\s\S]*?<\/svg>/, 'drawing')

const card = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800&display=swap"
      rel="stylesheet"
    />
    ${style}
    <style>
      /* A still frame: no motion, and the card's own layout on top of the page's styles. */
      *, *::before, *::after { animation: none !important; transition: none !important; }
      html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
      body { background: #24452f; }
      .og { position: relative; width: 1200px; height: 630px; background: #24452f; overflow: hidden; }
      .og .sky { position: absolute; inset: 0; width: 100%; height: 100%; }
      .og .scene { position: absolute; left: 0; bottom: 0; width: 1200px; height: 330px; margin: 0; }
      .og .text { position: absolute; left: 72px; top: 56px; color: #fbf6ec; }
      .og .pill {
        display: inline-block; padding: 8px 20px; border-radius: 999px; font: 700 28px ui-sans-serif, system-ui, 'Segoe UI', sans-serif;
        background: #24452f; box-shadow: 0 0 0 1px rgb(255 255 255 / 0.18), 0 0 24px 10px #24452f;
      }
      .og h1 {
        margin: 20px 0 0; font: 800 100px/1 'Fraunces', Georgia, serif; letter-spacing: -1.5px;
        text-shadow: 0 0 6px #24452f, 0 0 14px #24452f, 0 0 26px #24452f, 0 0 40px #24452f;
      }
      .og p {
        display: inline-block; margin: 18px 0 0; font: 400 34px ui-sans-serif, system-ui, 'Segoe UI', sans-serif;
        color: #ffc9a8; text-shadow: 0 0 6px #24452f, 0 0 14px #24452f, 0 0 24px #24452f;
      }
    </style>
  </head>
  <body>
    <div class="og">
      ${sky}
      <div class="text">
        <span class="pill">🏡 Big news</span>
        <h1>We bought a house!</h1>
        <p>Falmouth, Maine · fire pit nights ahead</p>
      </div>
      ${scene}
    </div>
  </body>
</html>`

const dir = mkdtempSync(join(tmpdir(), 'house-card-'))
const html = join(dir, 'card.html')
writeFileSync(html, card)

const chrome =
  process.env.CHROME ??
  [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((c) => {
    try {
      execFileSync(c, ['--version'], { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  })
if (!chrome) throw new Error('No Chrome found; set CHROME=/path/to/chrome')

execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1200,630',
  '--virtual-time-budget=5000',
  `--screenshot=${out}`,
  pathToFileURL(html).href,
])
console.log(`Wrote ${out}`)
