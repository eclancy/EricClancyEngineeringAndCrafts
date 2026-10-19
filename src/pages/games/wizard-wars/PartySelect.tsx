import { useState } from 'react'
import { Glyph } from './Glyph'
import { wizards } from './wizards'

interface Seat {
  /** Index into wizards, or null for an empty seat. */
  wizard: number | null
}

// A paper model of the game's Character Select: press Start to join a seat, flip through the
// wizards nobody else has taken (one player per wizard, as in the game), and switch between
// Free-for-All and Teams. Seats alternate Green and Pink, as Teams.DefaultForSlot does.
export function PartySelect() {
  const [seats, setSeats] = useState<Seat[]>([
    { wizard: 0 },
    { wizard: null },
    { wizard: null },
    { wizard: null },
  ])
  const [teams, setTeams] = useState(false)

  const taken = (except: number) =>
    new Set(
      seats.flatMap((s, i) => (i !== except && s.wizard !== null ? [s.wizard] : [])),
    )

  const nextFree = (seat: number, from: number, step: number) => {
    const used = taken(seat)
    for (let k = 1; k <= wizards.length; k++) {
      const w = (from + step * k + wizards.length * 4) % wizards.length
      if (!used.has(w)) return w
    }
    return from
  }

  const update = (seat: number, wizard: number | null) =>
    setSeats((list) => list.map((s, i) => (i === seat ? { wizard } : s)))

  const joined = seats.filter((s) => s.wizard !== null).length
  const summary =
    joined === 0
      ? 'Nobody here yet. Press Start to join.'
      : joined === 1
        ? 'Just you? A computer wizard steps in, on Easy, Normal or Hard.'
        : teams
          ? `${joined} players, Green vs Pink. Friendly fire is off: nothing hurts a teammate.`
          : `${joined} players, Free-for-All: last wizard standing wins the round.`

  return (
    <div className="ww-party">
      <div className="ww-mode" role="group" aria-label="Match type">
        <button
          type="button"
          aria-pressed={!teams}
          onClick={() => setTeams(false)}
          className="ww-mode-btn"
        >
          Free-for-All
        </button>
        <button
          type="button"
          aria-pressed={teams}
          onClick={() => setTeams(true)}
          className="ww-mode-btn"
        >
          Teams
        </button>
      </div>

      <ul className="ww-seats">
        {seats.map((seat, i) => {
          const w = seat.wizard === null ? null : wizards[seat.wizard]
          const team = i % 2 === 0 ? 'green' : 'pink'
          return (
            <li
              key={i}
              className="ww-seat"
              data-el={w?.id}
              data-team={teams && w ? team : undefined}
            >
              <span className="ww-seat-tag">P{i + 1}</span>
              {w === null ? (
                <button
                  type="button"
                  className="ww-join"
                  onClick={() => update(i, nextFree(i, -1, 1))}
                >
                  <span className="ww-join-start" aria-hidden="true">
                    START
                  </span>
                  <span>
                    Press Start to join<span className="ww-sr"> as player {i + 1}</span>
                  </span>
                </button>
              ) : (
                <>
                  <img
                    src={w.art}
                    alt=""
                    width={500}
                    height={485}
                    className="ww-seat-art"
                  />
                  <p className="ww-seat-name">
                    <Glyph id={w.id} />
                    {w.name}
                  </p>
                  {teams && (
                    <p className="ww-seat-team">
                      {team === 'green' ? 'Green' : 'Pink'} team
                    </p>
                  )}
                  <div className="ww-seat-actions">
                    <button
                      type="button"
                      className="ww-seat-btn"
                      aria-label={`Player ${i + 1}: previous wizard`}
                      onClick={() => update(i, nextFree(i, seat.wizard!, -1))}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className="ww-seat-btn"
                      aria-label={`Player ${i + 1}: next wizard`}
                      onClick={() => update(i, nextFree(i, seat.wizard!, 1))}
                    >
                      ▶
                    </button>
                    <button
                      type="button"
                      className="ww-seat-btn ww-seat-btn--leave"
                      aria-label={`Player ${i + 1}: leave`}
                      onClick={() => update(i, null)}
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ul>
      <p className="ww-party-summary" aria-live="polite">
        {summary}
      </p>
    </div>
  )
}
