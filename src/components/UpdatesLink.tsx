import './updates-signup.css'

// A small link near the top of a game page that jumps down to its update-email sign-up
// (UpdatesSignup, which carries the id). Takes its colour from where it sits.
export function UpdatesLink({ className = '' }: { className?: string }) {
  return (
    <a href="#get-updates" className={`updates-link ${className}`}>
      <span aria-hidden="true">🔔</span> Get update emails
    </a>
  )
}
