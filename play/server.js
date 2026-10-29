// DrawFight's online play relay: lets up to four copies of the game play together through a short
// room code. See .ai/online.md in eclancy/DrawFight.
//
// One game "hosts" and gets a five-letter code; the others "join" with it. From then on every
// binary message one game sends is passed to every other game in the room, with one byte in front
// saying who sent it. The games run in lockstep - each sends what its players pressed, frame by
// frame - so this only ever carries a few bytes a frame per game, and never decides anything.
//
// What this keeps: nothing. Rooms live in memory while someone is in them. No log line ever names
// a room, a code or an address. The games say nothing about who is playing.
//
//   GET /api/play/health                         {"ok": true}
//   WebSocket /api/play/ws, then as text:
//     {"op":"host","game":"drawfight","version":"0.16.0"}  -> {"op":"room","code":"KQZMW","you":0}
//     {"op":"join","code":"KQZMW","game":"drawfight","version":"0.16.0"}
//                                    -> {"op":"joined","you":1,"members":[0,1]}  (or {"op":"error",...})
//     {"op":"lock"}                  (the host, starting) no one else can join
//   and to everyone else in the room, as text:
//     {"op":"member","id":2}  {"op":"left","id":2}  {"op":"closed"} (the host went)
//   Binary from a game goes to the rest of its room as [sender id][the message].
//
// Runs as its own container next to the site (docker-compose.yml). The site's nginx forwards
// /api/play here.

import http from 'node:http'
import crypto from 'node:crypto'
import { WebSocketServer } from 'ws'

const PORT = 3003
const MAX_ROOMS = 500
const MAX_MEMBERS = 4
const MAX_MESSAGE_BYTES = 64 * 1024
// A game sends about a hundred bytes a frame; this is many times that, and stops a flood.
const MAX_BYTES_PER_SECOND = 48 * 1024
const ROOM_IDLE_MS = 20 * 60 * 1000
const PING_MS = 20 * 1000
const JOIN_TRIES_PER_MINUTE = 20
// No I or O: they look like 1 and 0, and a code is read out loud or off a screen.
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const CODE_RE = /^[A-Z]{5}$/
const VERSION_RE = /^[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}$/

/** code -> { version, members: Map<id, ws>, locked, touched } */
const rooms = new Map()
/** address -> { minute, tries } - join attempts, so codes cannot be guessed by trying them all */
const tries = new Map()

function makeCode() {
  for (let attempt = 0; attempt < 50; attempt++) {
    let code = ''
    for (let i = 0; i < 5; i++) code += LETTERS[crypto.randomInt(LETTERS.length)]
    if (!rooms.has(code)) return code
  }
  return null
}

function say(ws, message) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message))
}

function tellOthers(room, from, message) {
  for (const [id, other] of room.members) if (id !== from) say(other, message)
}

function tooManyTries(address) {
  const minute = Math.floor(Date.now() / 60000)
  let entry = tries.get(address)
  if (!entry || entry.minute !== minute) {
    entry = { minute, tries: 0 }
    tries.set(address, entry)
  }
  entry.tries++
  return entry.tries > JOIN_TRIES_PER_MINUTE
}

function leave(ws) {
  const room = ws.room
  if (!room) return
  ws.room = null
  room.members.delete(ws.id)
  if (ws.id === 0) {
    // The host has gone: the game is over for everyone.
    for (const other of room.members.values()) {
      say(other, { op: 'closed' })
      other.room = null
      other.close()
    }
    rooms.delete(room.code)
    return
  }
  tellOthers(room, ws.id, { op: 'left', id: ws.id })
  if (room.members.size === 0) rooms.delete(room.code)
}

function onText(ws, text) {
  let message
  try {
    message = JSON.parse(text)
  } catch {
    return ws.close(1003, 'bad message')
  }
  if (message.op === 'lock' && ws.room && ws.id === 0) {
    ws.room.locked = true
    return
  }
  if (ws.room) return
  if (message.game !== 'drawfight' || !VERSION_RE.test(String(message.version))) {
    say(ws, { op: 'error', why: 'bad' })
    return ws.close()
  }

  if (message.op === 'host') {
    if (rooms.size >= MAX_ROOMS) {
      say(ws, { op: 'error', why: 'busy' })
      return ws.close()
    }
    const code = makeCode()
    if (!code) {
      say(ws, { op: 'error', why: 'busy' })
      return ws.close()
    }
    const room = {
      code,
      version: message.version,
      members: new Map(),
      locked: false,
      touched: Date.now(),
    }
    rooms.set(code, room)
    ws.id = 0
    ws.room = room
    room.members.set(0, ws)
    return say(ws, { op: 'room', code, you: 0 })
  }

  if (message.op === 'join') {
    if (tooManyTries(ws.address)) {
      say(ws, { op: 'error', why: 'slow-down' })
      return ws.close()
    }
    const code = String(message.code || '').toUpperCase()
    const room = CODE_RE.test(code) ? rooms.get(code) : null
    const why = !room
      ? 'no-room'
      : room.version !== message.version
        ? 'version'
        : room.locked
          ? 'started'
          : room.members.size >= MAX_MEMBERS
            ? 'full'
            : null
    if (why) {
      say(ws, { op: 'error', why, version: room ? room.version : undefined })
      return ws.close()
    }
    let id = 1
    while (room.members.has(id)) id++
    ws.id = id
    ws.room = room
    room.members.set(id, ws)
    room.touched = Date.now()
    say(ws, { op: 'joined', you: id, members: [...room.members.keys()] })
    return tellOthers(room, id, { op: 'member', id })
  }

  ws.close(1003, 'bad message')
}

function onBinary(ws, data) {
  const room = ws.room
  if (!room) return ws.close(1003, 'not in a room')
  const now = Date.now()
  // A leaky bucket: a second's worth of bytes, refilled as time passes.
  ws.budget = Math.min(
    MAX_BYTES_PER_SECOND,
    ws.budget + ((now - ws.budgetAt) * MAX_BYTES_PER_SECOND) / 1000,
  )
  ws.budgetAt = now
  ws.budget -= data.length
  if (ws.budget < -MAX_BYTES_PER_SECOND) return ws.close(1008, 'too much')
  room.touched = now
  const out = Buffer.allocUnsafe(data.length + 1)
  out[0] = ws.id
  data.copy(out, 1)
  for (const [id, other] of room.members) {
    if (id !== ws.id && other.readyState === other.OPEN) other.send(out, { binary: true })
  }
}

const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_BYTES })

wss.on('connection', (ws, req) => {
  ws.address = String(req.headers['x-real-ip'] || req.socket.remoteAddress || '')
  ws.room = null
  ws.alive = true
  ws.budget = MAX_BYTES_PER_SECOND
  ws.budgetAt = Date.now()
  ws.on('pong', () => (ws.alive = true))
  ws.on('message', (data, isBinary) => {
    if (isBinary) onBinary(ws, data)
    else onText(ws, data.toString('utf8'))
  })
  ws.on('close', () => leave(ws))
  ws.on('error', () => leave(ws))
})

// Pings keep idle lobbies open through every proxy on the way, and find games that vanished.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) {
      ws.terminate()
      continue
    }
    ws.alive = false
    ws.ping()
  }
  const now = Date.now()
  for (const [code, room] of rooms) {
    if (now - room.touched > ROOM_IDLE_MS) {
      for (const ws of room.members.values()) ws.close()
      rooms.delete(code)
    }
  }
  const minute = Math.floor(now / 60000)
  for (const [address, entry] of tries) if (entry.minute !== minute) tries.delete(address)
}, PING_MS).unref()

const server = http.createServer((req, res) => {
  const path = new URL(req.url, 'http://play').pathname
  if (path === '/api/play/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    })
    return res.end(JSON.stringify({ ok: true, rooms: rooms.size }))
  }
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'not here' }))
})

server.on('upgrade', (req, socket, head) => {
  const path = new URL(req.url, 'http://play').pathname
  if (path !== '/api/play/ws') return socket.destroy()
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
})

server.listen(PORT, () => console.log(`DrawFight play relay listening on ${PORT}`))
