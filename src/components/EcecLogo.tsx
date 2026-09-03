import { EcecMark } from './EcecMark'
import type { EcecMarkVariant } from './EcecMark'

type EcecLogoLayout = 'horizontal' | 'horizontal-descriptor' | 'stacked'

interface EcecLogoProps {
  layout?: EcecLogoLayout
  size?: number
  variant?: EcecMarkVariant
  className?: string
  href?: string
}

export function EcecLogo({
  layout = 'horizontal',
  size = 40,
  variant = 'gradient',
  className = '',
  href,
}: EcecLogoProps) {
  const gap = Math.round(size * 0.11)
  const wordSize = Math.round(size * 0.82)
  const descriptorSize = Math.max(9, Math.round(size * 0.2))
  const wordmark = (
    <span
      className="font-extrabold leading-none text-slate-100"
      style={{ fontSize: wordSize }}
    >
      ECEC
    </span>
  )
  const descriptor = (
    <span
      className="leading-snug text-slate-400"
      style={{ fontSize: descriptorSize, letterSpacing: '0.08em' }}
    >
      Eric Clancy • Engineering &amp; Crafts
    </span>
  )

  const inner =
    layout === 'stacked' ? (
      <span className="inline-flex flex-col items-center text-center" style={{ gap }}>
        <EcecMark size={size} variant={variant} title={null} />
        <span className="inline-flex flex-col items-center" style={{ gap: gap * 0.4 }}>
          {wordmark}
          {descriptor}
        </span>
      </span>
    ) : layout === 'horizontal-descriptor' ? (
      <span className="inline-flex items-center" style={{ gap }}>
        <EcecMark size={size} variant={variant} title={null} />
        <span className="inline-flex flex-col" style={{ gap: gap * 0.35 }}>
          {wordmark}
          {descriptor}
        </span>
      </span>
    ) : (
      <span className="inline-flex items-center" style={{ gap }}>
        <EcecMark size={size} variant={variant} title={null} />
        {wordmark}
      </span>
    )

  return href ? (
    <a
      href={href}
      aria-label="ECEC — Eric Clancy Engineering & Crafts"
      className={className}
    >
      {inner}
    </a>
  ) : (
    <span className={className}>{inner}</span>
  )
}
