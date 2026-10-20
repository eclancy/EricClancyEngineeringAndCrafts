// DrawPets' meeting point: introduces two devices whose kids are swapping pets side by side, then
// steps away. See .ai/sharing.md in eclancy/DrawPets.
//
// One phone shows a swap code (a QR code) holding a room name: 128 random bits made on that
// phone, so only someone who scanned it in person can know it. Both devices then pass the short
// "here's how to reach me" notes WebRTC needs (an offer, an answer, a few network candidates)
// through the room, connect straight to each other, and the pets go over that direct, encrypted
// link. The pets never come here.
//
// What this keeps: nothing. Rooms live in memory for three minutes at most. No log line ever
// names a room, a message or an address. There is no relay: if the two devices cannot reach each
// other directly, the swap does not happen.
//
//   POST /api/meet/send   {"room", "side", "key", "message"}   one message (at most 8 KB)
//   POST /api/meet/wait   {"room", "side", "key", "after"}     the other side's messages after
//                                                              the nth, waiting up to 20 s
//
// Everything is in the request body, never the URL, so no web server log anywhere in front of
// this (the host's nginx included) ever records a room. <side> is "a" (the phone that showed the
// code) or "b" (the one that scanned it). <key> is a random string each device makes for itself:
// the first device to use a side claims it, and nobody else can read or write that side after.
//
// Runs as its own container next to the site (docker-compose.yml). The site's nginx forwards
// /api/meet here, rate-limited. Deliberately small: no framework, no dependencies.

import http from 'node:http'

const PORT = 3001
const ROOM_LIFE_MS = 3 * 60 * 1000
const WAIT_MS = 20 * 1000
const MAX_ROOMS = 2000
const MAX_MESSAGES = 24 // per side: an offer or answer plus a handful of candidates
const MAX_MESSAGE_BYTES = 8 * 1024
const MAX_BODY_BYTES = 10 * 1024
const ROOM_RE = /^[A-Za-z0-9_-]{22,64}$/
const KEY_RE = /^[A-Za-z0-9_-]{16,64}$/

/** room name -> { made, sides: { a: {key, messages[]}, b: {...} }, waiting: Set<waiter> } */
const rooms = new Map()

function other(side) {
  return side === 'a' ? 'b' : 'a'
}

function send(res, code, body) {
  const text = body === undefined ? '' : JSON.stringify(body)
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })
  res.end(text)
}

function sweep() {
  const now = Date.now()
  for (const [name, room] of rooms) {
    if (now - room.made > ROOM_LIFE_MS) {
      for (const w of room.waiting) w.done()
      rooms.delete(name)
    }
  }
}
setInterval(sweep, 10 * 1000).unref()

function roomFor(name, create) {
  let room = rooms.get(name)
  if (!room && create) {
    if (rooms.size >= MAX_ROOMS) sweep()
    if (rooms.size >= MAX_ROOMS) return null
    room = { made: Date.now(), sides: { a: null, b: null }, waiting: new Set() }
    rooms.set(name, room)
  }
  return room
}

/** The side, claimed by this key - or false if someone else already holds it. */
function claim(room, side, key) {
  const s = room.sides[side]
  if (!s) {
    room.sides[side] = { key, messages: [] }
    return true
  }
  return s.key === key
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('too big'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function handle(req, res) {
  const path = new URL(req.url, 'http://meet').pathname
  if (path === '/api/meet/health') return send(res, 200, { ok: true })
  if (req.method !== 'POST' || (path !== '/api/meet/send' && path !== '/api/meet/wait')) {
    return send(res, 404, { error: 'not here' })
  }
  let body
  try {
    body = JSON.parse(await readBody(req))
  } catch {
    return send(res, 400, { error: 'bad request' })
  }
  const name = typeof body.room === 'string' ? body.room : ''
  const side = body.side
  const key = typeof body.key === 'string' ? body.key : ''
  if (!ROOM_RE.test(name) || (side !== 'a' && side !== 'b') || !KEY_RE.test(key)) {
    return send(res, 400, { error: 'bad request' })
  }

  if (path === '/api/meet/send') {
    const text = typeof body.message === 'string' ? body.message : ''
    if (text.length === 0) return send(res, 400, { error: 'empty' })
    if (Buffer.byteLength(text) > MAX_MESSAGE_BYTES)
      return send(res, 413, { error: 'too big' })
    const room = roomFor(name, true)
    if (!room) return send(res, 503, { error: 'busy' })
    if (!claim(room, side, key)) return send(res, 403, { error: 'taken' })
    const mine = room.sides[side]
    if (mine.messages.length >= MAX_MESSAGES) return send(res, 429, { error: 'full' })
    mine.messages.push(text)
    for (const w of [...room.waiting]) w.check()
    return send(res, 204)
  }

  {
    const after = Math.max(
      0,
      Math.min(MAX_MESSAGES, Number.isInteger(body.after) ? body.after : 0),
    )
    const room = roomFor(name, true)
    if (!room) return send(res, 503, { error: 'busy' })
    if (!claim(room, side, key)) return send(res, 403, { error: 'taken' })
    // Answer at once if there is something new; otherwise wait for it (or WAIT_MS).
    const waiter = {
      finished: false,
      check() {
        const theirs = room.sides[other(side)]
        const fresh = theirs ? theirs.messages.slice(after) : []
        if (fresh.length > 0) this.done(fresh)
      },
      done(fresh = []) {
        if (this.finished) return
        this.finished = true
        clearTimeout(this.timer)
        room.waiting.delete(this)
        send(res, 200, { messages: fresh, next: after + fresh.length })
      },
    }
    waiter.timer = setTimeout(() => waiter.done(), WAIT_MS)
    room.waiting.add(waiter)
    req.on('close', () => {
      if (!waiter.finished) {
        waiter.finished = true
        clearTimeout(waiter.timer)
        room.waiting.delete(waiter)
      }
    })
    waiter.check()
  }
}

http
  .createServer((req, res) => {
    handle(req, res).catch(() => {
      if (!res.headersSent) send(res, 500, { error: 'oops' })
    })
  })
  .listen(PORT, () => console.log(`DrawPets meet listening on ${PORT}`))
