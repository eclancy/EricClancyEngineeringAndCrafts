import { useState } from 'react'
import { profile } from '../data/linkedin'
import { AnimatedEmoji } from '../components/AnimatedEmoji'
import type { Skill } from '../data/linkedin'
import { colorAt } from '../lib/palette'

interface SkillCardProps {
  skill: Skill
  color: ReturnType<typeof colorAt>
}

function SkillCard({ skill, color }: SkillCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`group flex min-h-16 w-full cursor-pointer flex-col justify-center rounded-2xl border bg-slate-900/60 p-3 text-left font-medium transition hover:-translate-y-0.5 hover:bg-slate-800/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:min-h-20 sm:p-4 ${color.border}`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className={color.text}>{skill.title}</span>
          <span
            aria-hidden="true"
            className={`flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-600 text-xs text-slate-300 transition-transform group-hover:border-slate-400 ${
              open ? 'rotate-180' : ''
            }`}
          >
            ↓
          </span>
        </span>
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-out ${
            open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <p className="overflow-hidden text-sm font-normal text-slate-400">
            {skill.mantra}
          </p>
        </div>
      </button>
    </li>
  )
}

export function Expertise() {
  return (
    <section
      id="expertise"
      aria-labelledby="expertise-heading"
      className="border-t border-fuchsia-500/20 py-20"
    >
      <h2 id="expertise-heading" className="text-3xl font-bold text-slate-100">
        What I bring{' '}
        <AnimatedEmoji emoji="🛠️" animation="tools-pop" label="tools" />
      </h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {profile.skills.map((skill, index) => (
          <SkillCard key={skill.title} skill={skill} color={colorAt(index)} />
        ))}
      </ul>
    </section>
  )
}
