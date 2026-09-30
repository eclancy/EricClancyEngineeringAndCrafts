// Generates public/<slug>/index.html for every entry in short-links.json.
//
// These pages exist because a 302 has no preview. When a short link is pasted
// into Messages, Discord, Slack or anywhere else, the unfurler fetches the URL
// and reads its Open Graph tags -- but a redirect hands it the *target's* tags
// instead, and the targets here are private Claude artifacts, so the unfurler
// hits a permission wall and renders nothing useful.
//
// So each path serves a real page carrying its own tags, and sends humans on to
// the artifact with location.replace() the moment it loads. Unfurlers do not run
// JavaScript, so they read the tags and stop; people get one fast extra hop.
//
// Deliberately no <meta http-equiv="refresh">: some crawlers follow it, which
// would put us right back to unfurling the permission wall.
//
// Run after editing short-links.json:  node scripts/build-short-links.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { format } from 'prettier'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const ORIGIN = 'https://ecec.dev'

const links = JSON.parse(readFileSync(join(here, 'short-links.json'), 'utf8'))

const resolvePrettierConfig = async () =>
  JSON.parse(readFileSync(join(root, '.prettierrc.json'), 'utf8'))

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// The target lands in a JS string literal, so it needs its own escaping.
const jsString = (s) => JSON.stringify(String(s))

for (const link of links) {
  const { slug, target, title, sub } = link
  if (!slug || !target)
    throw new Error(`short-links.json entry is missing slug or target`)

  const canonical = `${ORIGIN}/${slug}`
  const image = `${ORIGIN}/og/${slug}.png`
  const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)} · ECEC</title>
    <meta name="description" content="${esc(sub)}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="theme-color" content="#8E51FF" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ECEC" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(sub)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(title)} — ${esc(sub)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(sub)}" />
    <meta name="twitter:image" content="${image}" />

    <link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <style>
      :root {
        color-scheme: dark;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background: #020618;
        color: #f1f5f9;
        font-family:
          ui-sans-serif,
          system-ui,
          -apple-system,
          'Segoe UI',
          sans-serif;
        line-height: 1.55;
      }
      main {
        max-width: 440px;
        text-align: center;
      }
      h1 {
        font-size: 1.7rem;
        line-height: 1.15;
        letter-spacing: -0.02em;
        margin: 0 0 10px;
      }
      p {
        color: #90a1b9;
        margin: 0 0 24px;
      }
      a.go {
        display: inline-block;
        padding: 12px 26px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        color: #fff;
        background: linear-gradient(90deg, #8e51ff, #e12afb);
      }
      small {
        display: block;
        margin-top: 20px;
        color: #64748b;
        font-size: 0.82rem;
      }
      small a {
        color: #90a1b9;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${esc(title)}</h1>
      <p>${esc(sub)}</p>
      <a class="go" href="${esc(target)}">Open</a>
      <small>
        Taking you there now. This page is a short link from
        <a href="${ORIGIN}/">ecec.dev</a> — the page itself is private, so you
        may need to be signed in to an account it has been shared with.
      </small>
    </main>
    <script>
      // replace() rather than assign() so Back returns to wherever they came
      // from instead of bouncing them straight back through this page.
      window.location.replace(${jsString(target)});
    </script>
  </body>
</html>
`

  // Run the output through the project's own Prettier so the generated files
  // satisfy `npm run format:check` in CI, and regenerating never produces a diff.
  const formatted = await format(page, {
    ...(await resolvePrettierConfig()),
    parser: 'html',
  })

  const dir = join(root, 'public', slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), formatted)
  console.log(`built public/${slug}/index.html -> ${target}`)
}
