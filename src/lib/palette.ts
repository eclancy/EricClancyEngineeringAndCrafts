// Full literal class names so Tailwind's scanner picks them up (no dynamic
// template strings) — see https://tailwindcss.com/docs/detecting-classes-in-source-files
export const PALETTE = [
  {
    border: 'border-violet-500/60',
    text: 'text-violet-300',
    ring: 'focus-visible:outline-violet-400',
    chip: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  },
  {
    border: 'border-fuchsia-500/60',
    text: 'text-fuchsia-300',
    ring: 'focus-visible:outline-fuchsia-400',
    chip: 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300',
  },
  {
    border: 'border-cyan-500/60',
    text: 'text-cyan-300',
    ring: 'focus-visible:outline-cyan-400',
    chip: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  },
  {
    border: 'border-emerald-500/60',
    text: 'text-emerald-300',
    ring: 'focus-visible:outline-emerald-400',
    chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
  {
    border: 'border-amber-500/60',
    text: 'text-amber-300',
    ring: 'focus-visible:outline-amber-400',
    chip: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  {
    border: 'border-rose-500/60',
    text: 'text-rose-300',
    ring: 'focus-visible:outline-rose-400',
    chip: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  },
  {
    border: 'border-sky-500/60',
    text: 'text-sky-300',
    ring: 'focus-visible:outline-sky-400',
    chip: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  },
  {
    border: 'border-lime-500/60',
    text: 'text-lime-300',
    ring: 'focus-visible:outline-lime-400',
    chip: 'border-lime-500/40 bg-lime-500/10 text-lime-300',
  },
]

export function colorAt(index: number) {
  return PALETTE[index % PALETTE.length]
}
