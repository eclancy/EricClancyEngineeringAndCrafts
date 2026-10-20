import { useId, useState, type FormEvent } from 'react'
import './updates-signup.css'

interface UpdatesSignupProps {
  /** The game's id, as in src/data/projects.ts and updates/server.js. */
  game: string
  name: string
  /** A class on the form, for the page to style it (see updates-signup.css for the knobs). */
  className?: string
}

type Status =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'sent' }
  | { state: 'error'; message: string }

// "Email me when <game> updates." Grown-ups only - these pages are visited by kids - so it asks
// for 13 or older, and the server sends a confirm link before anything else. The server
// (updates/server.js) only emails for releases that come with notes.
export function UpdatesSignup({ game, name, className = '' }: UpdatesSignupProps) {
  const id = useId()
  const [status, setStatus] = useState<Status>({ state: 'idle' })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setStatus({ state: 'sending' })
    try {
      const response = await fetch('/api/updates/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game,
          email: form.get('email'),
          adult: form.get('adult') === 'on',
          website: form.get('website'),
        }),
      })
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
      }
      if (response.ok && body.ok) setStatus({ state: 'sent' })
      else
        setStatus({
          state: 'error',
          message: body.error ?? 'Something went wrong. Try again?',
        })
    } catch {
      setStatus({ state: 'error', message: 'Couldn’t reach the server. Try again?' })
    }
  }

  if (status.state === 'sent') {
    return (
      <div className={`updates-signup ${className}`} role="status">
        <p className="updates-signup__title">Check your inbox!</p>
        <p className="updates-signup__fine">
          We sent a link to confirm. Once you click it, you&apos;ll get an email when{' '}
          {name} has an update.
        </p>
      </div>
    )
  }

  return (
    <form className={`updates-signup ${className}`} onSubmit={submit}>
      <p className="updates-signup__title">Get an email when {name} updates</p>
      <p className="updates-signup__fine">
        For grown-ups. Only for new versions worth telling you about, and every email has
        an unsubscribe link.
      </p>
      <div className="updates-signup__row">
        <label htmlFor={`${id}-email`} className="updates-signup__sr">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="updates-signup__input"
        />
        <button
          type="submit"
          className="updates-signup__button"
          disabled={status.state === 'sending'}
        >
          {status.state === 'sending' ? 'Sending…' : 'Email me updates'}
        </button>
      </div>
      <label className="updates-signup__check">
        <input type="checkbox" name="adult" required />
        I&apos;m 13 or older
      </label>
      {/* Left empty by people; bots that fill in every field get a quiet "ok" and no email. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="updates-signup__trap"
      />
      <p className="updates-signup__status" aria-live="polite">
        {status.state === 'error' ? status.message : ''}
      </p>
    </form>
  )
}
