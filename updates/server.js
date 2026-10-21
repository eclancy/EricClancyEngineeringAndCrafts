// Game update emails. A grown-up signs up on a game's page (ecec.dev/games/<id>), confirms by
// email, and from then on gets an email whenever that game has a release with player-facing notes
// (release.sh X.Y.Z "what changed"). Releases without notes stay quiet.
//
//   POST /api/updates/subscribe     { game, email, adult: true, website: '' }  -> sends a confirm email
//   GET  /api/updates/confirm?t=…   confirms, shows a small page
//   GET  /api/updates/unsubscribe?t=…  page with an Unsubscribe button (link scanners can't do it)
//   POST /api/updates/unsubscribe?t=…  unsubscribes (the button, and email clients' one-click)
//
// Each new confirmed sign-up is also emailed to Eric (MAIL_TO).
//
// Every few minutes it checks each game's newest GitHub Release. The first time it sees a game it
// only remembers the tag, so a deploy never emails anyone about a release they already had.
//
// Sign-ups live in /data/subscribers.json (a Docker named volume, see docker-compose.yml): an
// email, a random token for its links, whether it's confirmed, and dates. Nothing else - no IP
// addresses, and emails never go to the logs. Only reachable through the web container's nginx.

import http from 'node:http'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const PORT = Number(process.env.PORT || 3002)
const DATA = process.env.DATA_DIR || '/data'
const FILE = path.join(DATA, 'subscribers.json')
const SITE = process.env.SITE_URL || 'https://ecec.dev'
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const MAIL_FROM = process.env.UPDATES_MAIL_FROM || 'ECEC Games <updates@ecec.dev>'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
// Where to tell Eric about each new confirmed sign-up: the same MAIL_TO the intake uses.
const MAIL_TO = process.env.MAIL_TO || 'eric@ecec.dev'
// Where a subscriber's reply goes. updates@ecec.dev itself receives nothing (only eric@ is
// forwarded), so without this a reply to an update email would be lost.
const REPLY_TO = process.env.UPDATES_REPLY_TO || 'eric@ecec.dev'
const POLL_MS = Number(process.env.POLL_MINUTES || 10) * 60_000

// Keep in step with the `game` entries in src/data/projects.ts.
const GAMES = {
  drawfight: { name: 'DrawFight', repo: 'DrawFight' },
  drawpets: { name: 'DrawPets', repo: 'DrawPets' },
  'wizard-survivors': { name: 'Wizard Survivors', repo: 'WizardSurvivors' },
  'wizard-wars': { name: 'Wizard Wars', repo: 'WizardWars' },
}

// --- Storage: one small JSON file, written whole and swapped in, one write at a time. ---------

let db = { games: {} }
let writing = Promise.resolve()

async function load() {
  try {
    db = JSON.parse(await fs.readFile(FILE, 'utf8'))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  for (const id of Object.keys(GAMES)) db.games[id] ??= { subscribers: [], lastTag: null }
}

function save() {
  writing = writing.then(async () => {
    const tmp = `${FILE}.tmp`
    await fs.writeFile(tmp, JSON.stringify(db, null, 2))
    await fs.rename(tmp, FILE)
  })
  return writing
}

const findByToken = (token) => {
  for (const [game, entry] of Object.entries(db.games)) {
    const sub = entry.subscribers.find((s) => s.token === token)
    if (sub) return { game, entry, sub }
  }
  return null
}

// --- Email -----------------------------------------------------------------------------------

// Without a Resend key (running locally), emails are printed instead of sent.
async function send(messages) {
  if (!messages.length) return
  if (!RESEND_API_KEY) {
    for (const m of messages)
      console.log(`[dry run] to ${m.to[0]}: ${m.subject}\n${m.text}\n`)
    return
  }
  // Resend's batch endpoint takes up to 100 emails; each still goes to one person, so each
  // carries its own unsubscribe link.
  for (let i = 0; i < messages.length; i += 100) {
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages.slice(i, i + 100)),
    })
    if (!response.ok)
      throw new Error(`Resend ${response.status}: ${await response.text()}`)
  }
}

const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )

function htmlEmail(heading, paragraphs, button, footer) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px">${p}</p>`).join('')
  return `<!doctype html><html><body style="margin:0;background:#f4f2fb;font-family:system-ui,Segoe UI,sans-serif;color:#1e1b2e">
<div style="max-width:520px;margin:0 auto;padding:28px 20px">
<h1 style="font-size:22px;margin:0 0 16px">${heading}</h1>${body}
${button ? `<p style="margin:22px 0"><a href="${button.href}" style="background:#7c3aed;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;display:inline-block">${button.label}</a></p>` : ''}
<p style="margin:28px 0 0;font-size:13px;color:#6b6780">${footer}</p></div></body></html>`
}

function confirmEmail(email, game, token) {
  const { name } = GAMES[game]
  const link = `${SITE}/api/updates/confirm?t=${token}`
  return {
    from: MAIL_FROM,
    to: [email],
    reply_to: REPLY_TO,
    subject: `Confirm: ${name} update emails`,
    text: `Someone (hopefully you) asked for an email whenever ${name} has an update.\n\nConfirm here: ${link}\n\nIf it wasn't you, ignore this - nothing more will be sent.`,
    html: htmlEmail(
      `Get ${escape(name)} updates?`,
      [
        `Someone (hopefully you) asked for an email whenever <b>${escape(name)}</b> has an update.`,
      ],
      { href: link, label: 'Yes, email me updates' },
      "If it wasn't you, ignore this email - nothing more will be sent.",
    ),
  }
}

// To Eric, when someone confirms: who, which game, and how many that game has now.
function ownerEmail(sub, game, count) {
  const { name } = GAMES[game]
  const total = `${count} confirmed for ${name}`
  return {
    from: MAIL_FROM,
    to: [MAIL_TO],
    subject: `New ${name} update sign-up`,
    text: `${sub.email} signed up for ${name} update emails and confirmed.

${total} now.`,
    html: htmlEmail(
      `New ${escape(name)} sign-up`,
      [
        `<b>${escape(sub.email)}</b> signed up for ${escape(name)} update emails and confirmed.`,
        `${total} now.`,
      ],
      null,
      'From the update-email sign-up on ecec.dev/games.',
    ),
  }
}

function releaseEmail(sub, game, version, notes) {
  const { name } = GAMES[game]
  const unsubscribe = `${SITE}/api/updates/unsubscribe?t=${sub.token}`
  const download = `${SITE}/${game}/download`
  return {
    from: MAIL_FROM,
    to: [sub.email],
    reply_to: REPLY_TO,
    subject: `${name} ${version} is out`,
    headers: {
      'List-Unsubscribe': `<${unsubscribe}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    text: `${name} ${version} is out!\n\n${notes}\n\nIf ${name} is already installed, it updates itself the next time it starts. To get it: ${download}\n\nUnsubscribe: ${unsubscribe}`,
    html: htmlEmail(
      `${escape(name)} ${escape(version)} is out!`,
      [
        escape(notes).replace(/\n/g, '<br>'),
        `Already have it? It updates itself the next time it starts.`,
      ],
      { href: download, label: `Play ${escape(name)}` },
      `You get these because you signed up at ecec.dev/games/${game}. <a href="${unsubscribe}" style="color:#6b6780">Unsubscribe</a>.`,
    ),
  }
}

// --- Watching for releases ---------------------------------------------------------------------

// Same rule as the game pages (src/lib/releases.ts): the paragraph starting "Download **" is the
// install instructions release.sh always adds; anything before it is what changed, for players.
const playerNotes = (body) =>
  (body ?? '')
    .split(/\r?\n\s*\r?\n/)
    .filter((p) => !p.trim().startsWith('Download **'))
    .join('\n\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .trim()

async function checkReleases() {
  for (const [game, { repo }] of Object.entries(GAMES)) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/eclancy/${repo}/releases/latest`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'ecec-updates',
            ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
          },
        },
      )
      if (!response.ok) continue
      const release = await response.json()
      const entry = db.games[game]
      if (release.tag_name === entry.lastTag) continue

      const first = entry.lastTag === null
      entry.lastTag = release.tag_name
      await save() // remembered before sending: an email may be missed, but never sent twice
      if (first) continue

      const notes = playerNotes(release.body)
      const confirmed = entry.subscribers.filter((s) => s.confirmed)
      if (!notes || !confirmed.length) {
        console.log(
          `${game} ${release.tag_name}: ${notes ? 'no subscribers' : 'no notes'}, no email`,
        )
        continue
      }
      const version = release.tag_name.replace(/^v/, '')
      await send(confirmed.map((s) => releaseEmail(s, game, version, notes)))
      console.log(`${game} ${release.tag_name}: emailed ${confirmed.length}`)
    } catch (err) {
      console.error(`${game}: release check failed: ${err.message}`)
    }
  }
}

// --- HTTP ----------------------------------------------------------------------------------------

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/
const recent = new Map() // visitor -> sign-up times, for a light per-visitor limit

function tooMany(visitor) {
  const now = Date.now()
  const times = (recent.get(visitor) ?? []).filter((t) => now - t < 3_600_000)
  times.push(now)
  recent.set(visitor, times)
  return times.length > 8
}

async function readBody(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 4096) throw new Error('too big')
  }
  return raw
}

function page(res, status, title, message, extra = '') {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="robots" content="noindex"></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0a1a;color:#eceaf7;font-family:system-ui,Segoe UI,sans-serif;padding:20px">
<main style="max-width:440px;text-align:center"><h1 style="font-size:24px">${escape(title)}</h1><p style="color:#bdb8d6;line-height:1.5">${message}</p>${extra}
<p><a href="/" style="color:#c4b5fd">Back to ecec.dev</a></p></main></body></html>`)
}

const json = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://local')
  const route = url.pathname.replace(/\/+$/, '')
  const token = url.searchParams.get('t') ?? ''

  if (req.method === 'POST' && route === '/api/updates/subscribe') {
    let body
    try {
      body = JSON.parse(await readBody(req))
    } catch {
      return json(res, 400, { ok: false, error: 'Something went wrong. Try again?' })
    }
    const game = String(body.game ?? '')
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase()
    if (body.website) return json(res, 200, { ok: true }) // the hidden field only bots fill in
    if (!GAMES[game]) return json(res, 400, { ok: false, error: 'Unknown game.' })
    if (!EMAIL.test(email))
      return json(res, 400, {
        ok: false,
        error: 'That email address doesn’t look right.',
      })
    if (body.adult !== true)
      return json(res, 400, {
        ok: false,
        error: 'Sign-ups are for grown-ups (13 or older).',
      })
    if (tooMany(req.headers['x-real-ip'] || req.socket.remoteAddress)) {
      return json(res, 429, {
        ok: false,
        error: 'Too many sign-ups from here - try again in a while.',
      })
    }

    const entry = db.games[game]
    let sub = entry.subscribers.find((s) => s.email === email)
    // Already confirmed: say the same thing as a new sign-up, so the form never reveals who's on
    // the list, and send nothing.
    if (sub?.confirmed) return json(res, 200, { ok: true })
    if (!sub) {
      sub = {
        email,
        token: randomBytes(18).toString('base64url'),
        confirmed: false,
        created: new Date().toISOString(),
      }
      entry.subscribers.push(sub)
    }
    await save()
    try {
      await send([confirmEmail(email, game, sub.token)])
    } catch (err) {
      console.error(`confirm email failed: ${err.message}`)
      return json(res, 502, {
        ok: false,
        error: 'Couldn’t send the confirmation email. Try again later?',
      })
    }
    return json(res, 200, { ok: true })
  }

  if (req.method === 'GET' && route === '/api/updates/confirm') {
    const found = findByToken(token)
    if (!found)
      return page(
        res,
        404,
        'Link not found',
        'This link has expired or was already used to unsubscribe.',
      )
    if (!found.sub.confirmed) {
      found.sub.confirmed = true
      found.sub.confirmedAt = new Date().toISOString()
      await save()
      // Best effort: a failed note to Eric never stops the sign-up.
      const count = found.entry.subscribers.filter((s) => s.confirmed).length
      send([ownerEmail(found.sub, found.game, count)]).catch((err) =>
        console.error(`owner email failed: ${err.message}`),
      )
    }
    const { name } = GAMES[found.game]
    return page(
      res,
      200,
      `You're signed up!`,
      `You'll get an email when <b>${escape(name)}</b> has an update. Every email has an unsubscribe link.`,
      `<p><a href="/games/${found.game}" style="color:#c4b5fd">Back to ${escape(name)}</a></p>`,
    )
  }

  if (route === '/api/updates/unsubscribe') {
    const found = findByToken(token)
    if (req.method === 'POST') {
      if (found) {
        found.entry.subscribers = found.entry.subscribers.filter((s) => s !== found.sub)
        await save()
      }
      return page(
        res,
        200,
        'Unsubscribed',
        'You won’t get any more update emails for this game.',
      )
    }
    if (req.method === 'GET') {
      if (!found)
        return page(
          res,
          200,
          'Already unsubscribed',
          'This address isn’t getting update emails.',
        )
      const { name } = GAMES[found.game]
      return page(
        res,
        200,
        `Stop ${name} emails?`,
        `You'll stop getting update emails for <b>${escape(name)}</b>.`,
        `<form method="post" action="/api/updates/unsubscribe?t=${encodeURIComponent(token)}"><button style="font:inherit;font-weight:700;padding:10px 18px;border-radius:10px;border:0;background:#7c3aed;color:#fff;cursor:pointer">Unsubscribe</button></form>`,
      )
    }
  }

  json(res, 404, { ok: false })
}

await fs.mkdir(DATA, { recursive: true })
await load()
await checkReleases()
setInterval(checkReleases, POLL_MS)

http
  .createServer((req, res) =>
    handle(req, res).catch((err) => {
      console.error(err)
      if (!res.headersSent)
        json(res, 500, { ok: false, error: 'Something went wrong. Try again?' })
    }),
  )
  .listen(PORT, () =>
    console.log(
      `updates on :${PORT}, ${RESEND_API_KEY ? 'emailing' : 'dry run (no RESEND_API_KEY)'}, checking releases every ${POLL_MS / 60_000} min`,
    ),
  )
