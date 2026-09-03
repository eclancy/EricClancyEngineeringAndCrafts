import { useState } from 'react'

interface AnimatedEmojiProps {
  emoji: string
  animation: 'wave' | 'mailbox-shake' | 'rocket' | 'tools-pop'
  label: string
}

export function AnimatedEmoji({ emoji, animation, label }: AnimatedEmojiProps) {
  const [active, setActive] = useState(false)

  const trigger = () => {
    setActive(false)
    requestAnimationFrame(() => setActive(true))
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Animate ${label}`}
      className={`ecec-emoji ecec-emoji-${animation}${active ? ' ecec-emoji-active' : ''}`}
      onClick={trigger}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          trigger()
        }
      }}
      onAnimationEnd={() => setActive(false)}
    >
      {emoji}
    </span>
  )
}
