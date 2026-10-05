// DrawFight fighter intake: receives the form at ecec.dev/draw, saves each submission as a
// folder of photos plus the answers, and emails a copy to Eric.
//
// Runs as its own container next to the site (see docker-compose.yml). The site's nginx
// forwards /api/draw here. Submissions live in /data, a folder on the server outside the
// deployed app, so a deploy never touches them. DrawFight's tools/intake/pull_submissions.sh
// copies them down for Claude Code to rig.
//
// Deliberately small: no framework, one dependency (busboy, for the file upload).

import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import Busboy from 'busboy'

const PORT = 3000
const DATA = process.env.DATA_DIR || '/data'
const MAIL_TO = process.env.MAIL_TO || 'eric@ecec.dev'
const MAIL_FROM = process.env.MAIL_FROM || 'DrawFight <drawfight@ecec.dev>'
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''

const MAX_FILES = 8
const MAX_FILE_BYTES = 12 * 1024 * 1024
const MAX_FIELD_CHARS = 2000
const IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
}

// The questions on the form, in order, with the headings the answers are filed under.
const QUESTIONS = [
  ['name', 'Fighter name'],
  ['artist', 'Drawn by'],
  ['what', 'What are they?'],
  ['amazing', 'AMAZING at'],
  ['terrible', 'TERRIBLE at'],
  ['coolest', 'Coolest move (neutral special)'],
  ['reach', 'Move for reaching someone far away (side special)'],
  ['recover', 'Move for getting back onto the stage (up special)'],
  ['protect', 'Move that protects them (down special)'],
  ['extra', 'Anything else'],
]

// A few submissions an hour from one address is plenty for a person and useless to a bot.
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000
const recent = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const times = (recent.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.set(ip, times)
  if (times.length >= RATE_LIMIT) return true
  times.push(now)
  return false
}

function slug(text) {
  return (
    String(text || 'fighter')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'fighter'
  )
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function parse(req) {
  return new Promise((resolve, reject) => {
    const fields = {}
    const files = []
    let failed = null
    let bb
    try {
      bb = Busboy({
        headers: req.headers,
        limits: {
          files: MAX_FILES,
          fileSize: MAX_FILE_BYTES,
          fields: 30,
          fieldSize: MAX_FIELD_CHARS * 4,
        },
      })
    } catch (err) {
      reject(err)
      return
    }
    bb.on('field', (name, value) => {
      fields[name] = String(value).slice(0, MAX_FIELD_CHARS).trim()
    })
    bb.on('file', (name, stream, info) => {
      const ext = IMAGE_TYPES[info.mimeType]
      if (!ext) {
        failed = failed || 'Only photos can be sent (JPG, PNG, WEBP or HEIC).'
        stream.resume()
        return
      }
      const chunks = []
      stream.on('data', (c) => chunks.push(c))
      stream.on('limit', () => {
        failed = failed || 'One of the photos is too big. Each one has to be under 12 MB.'
      })
      stream.on('end', () =>
        files.push({
          ext,
          mime: info.mimeType,
          original: info.filename,
          data: Buffer.concat(chunks),
        }),
      )
    })
    bb.on('filesLimit', () => {
      failed = failed || `Please send ${MAX_FILES} photos or fewer.`
    })
    bb.on('close', () =>
      failed ? reject(new Error(failed)) : resolve({ fields, files }),
    )
    bb.on('error', reject)
    req.pipe(bb)
  })
}

function sheet(fields, id) {
  const lines = [
    `# ${fields.name || 'Unnamed fighter'}`,
    '',
    `Submitted ${new Date().toISOString()} (${id})`,
    '',
  ]
  for (const [key, label] of QUESTIONS) {
    if (key === 'name') continue
    lines.push(`## ${label}`, '', fields[key] || '(left blank)', '')
  }
  return lines.join('\n')
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  )
}

async function email(fields, files, id) {
  if (!RESEND_API_KEY) return 'skipped (no RESEND_API_KEY)'
  const rows = QUESTIONS.filter(([k]) => k !== 'name')
    .map(
      ([k, label]) =>
        `<h3 style="margin:18px 0 4px;font-family:sans-serif">${escapeHtml(label)}</h3>` +
        `<p style="margin:0;font-family:sans-serif;white-space:pre-wrap">${escapeHtml(fields[k] || '(left blank)')}</p>`,
    )
    .join('')
  const html =
    `<h2 style="font-family:sans-serif">New DrawFight fighter: ${escapeHtml(fields.name || 'Unnamed')}</h2>` +
    rows +
    `<p style="font-family:sans-serif;color:#666;margin-top:24px">${files.length} photo(s) attached. Saved on the server as <code>${id}</code>; in Claude Code, ask to check for new fighters.</p>`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [MAIL_TO],
      subject: `New DrawFight fighter: ${fields.name || 'Unnamed'}${fields.artist ? ` (by ${fields.artist})` : ''}`,
      html,
      attachments: files.map((f, i) => ({
        filename: `photo-${i + 1}${f.ext}`,
        content: f.data.toString('base64'),
      })),
    }),
  })
  // Resend's id for the email goes in the log: "sent" only means Resend took it, and the id is
  // what finds it on resend.com/emails to see whether it was delivered or bounced.
  if (!response.ok)
    return `failed (${response.status}: ${(await response.text()).slice(0, 200)})`
  const { id: resendId } = await response.json().catch(() => ({}))
  return `sent to ${MAIL_TO} (resend id ${resendId || 'unknown'})`
}

async function handle(req, res) {
  if (req.method === 'GET' && req.url === '/api/draw/health')
    return send(res, 200, { ok: true })
  if (req.method !== 'POST' || !req.url.startsWith('/api/draw'))
    return send(res, 404, { error: 'Not found' })

  const ip = String(req.headers['x-real-ip'] || req.socket.remoteAddress || '')
  if (rateLimited(ip))
    return send(res, 429, {
      error: 'That is a lot of fighters! Please wait a while before sending another.',
    })

  let parsed
  try {
    parsed = await parse(req)
  } catch (err) {
    return send(res, 400, {
      error: err.message || 'Something went wrong reading the form.',
    })
  }
  const { fields, files } = parsed

  // The hidden "website" field is invisible to people; only bots fill it in. Pretend it worked.
  if (fields.website) return send(res, 200, { ok: true })
  if (!fields.name) return send(res, 400, { error: 'Your fighter needs a name.' })
  if (files.length === 0)
    return send(res, 400, { error: 'Add at least one photo of the drawing.' })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const id = `${stamp}-${slug(fields.name)}-${crypto.randomBytes(3).toString('hex')}`
  const dir = path.join(DATA, id)
  await fs.mkdir(dir, { recursive: true })
  await Promise.all(
    files.map((f, i) => fs.writeFile(path.join(dir, `photo-${i + 1}${f.ext}`), f.data)),
  )
  const answers = Object.fromEntries(QUESTIONS.map(([k]) => [k, fields[k] || '']))
  await fs.writeFile(
    path.join(dir, 'answers.json'),
    JSON.stringify({ id, submitted: new Date().toISOString(), ...answers }, null, 2),
  )
  await fs.writeFile(path.join(dir, 'sheet.md'), sheet(fields, id))

  let mail
  try {
    mail = await email(fields, files, id)
  } catch (err) {
    mail = `failed (${err.message})`
  }
  console.log(`saved ${id}: ${files.length} photo(s), email ${mail}`)
  return send(res, 200, { ok: true })
}

http
  .createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error(err)
      send(res, 500, { error: 'Something went wrong on our end. Please try again.' })
    })
  })
  .listen(PORT, () =>
    console.log(
      `drawfight intake on :${PORT}, saving to ${DATA}, email ${RESEND_API_KEY ? 'on' : 'off'}`,
    ),
  )
