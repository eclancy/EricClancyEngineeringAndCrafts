import { useId } from 'react'
import type { SVGProps } from 'react'

const FIELD_PATH =
  'M22 0 H78 A22 22 0 0 1 100 22 V78 A22 22 0 0 1 78 100 H22 A22 22 0 0 1 0 78 V22 A22 22 0 0 1 22 0 Z ' +
  'M26 26 H74 V37 H37 V63 H74 V74 H26 Z M42 44.5 H70 V55.5 H42 Z'
const GLYPH_PATH = 'M26 26 H74 V37 H37 V63 H74 V74 H26 Z'

export type EcecMarkVariant = 'gradient' | 'solid' | 'glyph'

interface EcecMarkProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number
  variant?: EcecMarkVariant
  title?: string | null
}

export function EcecMark({
  size = 40,
  variant = 'gradient',
  title = 'ECEC',
  ...rest
}: EcecMarkProps) {
  const gradientId = `ecec-grad-${useId().replace(/:/g, '')}`
  const a11y =
    title === null
      ? { 'aria-hidden': true, focusable: false }
      : { role: 'img', 'aria-label': title }

  if (variant === 'glyph') {
    return (
      <svg viewBox="26 26 48 48" width={size} height={size} xmlns="http://www.w3.org/2000/svg" {...a11y} {...rest}>
        <path fill="currentColor" d={GLYPH_PATH} />
        <rect fill="currentColor" x={42} y={44.5} width={28} height={11} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg" {...a11y} {...rest}>
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8E51FF" />
            <stop offset="0.5" stopColor="#AD46FF" />
            <stop offset="1" stopColor="#E12AFB" />
          </linearGradient>
        </defs>
      )}
      <path fill={variant === 'gradient' ? `url(#${gradientId})` : 'currentColor'} fillRule="evenodd" d={FIELD_PATH} />
    </svg>
  )
}