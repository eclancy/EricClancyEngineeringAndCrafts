// The four wizards and their spells, as the game has them (WizardWars repo: data/wizards,
// data/abilities). Descriptions are the game's own; `effect` picks the little animation the
// spellbook plays for each.
import fireArt from '../../../assets/projects/wizard-wars/fire-wizard.png'
import frostArt from '../../../assets/projects/wizard-wars/frost-wizard.png'
import earthArt from '../../../assets/projects/wizard-wars/earth-wizard.png'
import electricityArt from '../../../assets/projects/wizard-wars/electricity-wizard.png'

export type Effect =
  | 'bolt'
  | 'flame-ring'
  | 'flamethrower'
  | 'meteor'
  | 'ice-patch'
  | 'ice-wave'
  | 'deep-freeze'
  | 'mud-patch'
  | 'rock-wall'
  | 'tremor'
  | 'rod'
  | 'speed'
  | 'chain'

export interface Spell {
  name: string
  text: string
  effect: Effect
  /** What floats up from the practice dummy (or the caster) when it lands. */
  pop: string
  /** Pops above the caster instead of the dummy. */
  self?: boolean
}

export interface Wizard {
  id: 'fire' | 'frost' | 'earth' | 'electricity'
  name: string
  element: string
  art: string
  motto: string
  /** Spells in slot order: basic, second, third, fourth. */
  spells: [Spell, Spell, Spell, Spell]
  ultimate: { name: string; text: string; clip: string; clipLabel: string }
}

/** The pad button and player-one key for each slot, basic → ultimate. */
export const slots = [
  { pad: 'RT', key: '1', label: 'Basic, free' },
  { pad: 'LT', key: '2', label: 'Second' },
  { pad: 'RB', key: '3', label: 'Third' },
  { pad: 'LB', key: '4', label: 'Fourth' },
  { pad: 'X', key: '5', label: 'Ultimate' },
] as const

export const wizards: Wizard[] = [
  {
    id: 'fire',
    name: 'Fire Wizard',
    element: 'Fire',
    art: fireArt,
    motto:
      'Sets the floor alight and keeps it that way. Burning foes keep taking damage.',
    spells: [
      {
        name: 'Fireball',
        text: 'A fast bolt of fire. Free to cast.',
        effect: 'bolt',
        pop: '−20',
      },
      {
        name: 'Ring of Fire',
        text: 'Twelve flames burst up in a ring at the target. Anyone touching one catches fire.',
        effect: 'flame-ring',
        pop: 'Burning!',
      },
      {
        name: 'Flamethrower',
        text: 'Hold to breathe fire. Drains energy while held and slows you a little.',
        effect: 'flamethrower',
        pop: '−3 −3 −3',
      },
      {
        name: 'Meteor Strike',
        text: 'Calls one meteor down on the target. It burns everyone it hits and leaves the ground on fire.',
        effect: 'meteor',
        pop: '−35',
      },
    ],
    ultimate: {
      name: 'Meteor Storm',
      text: 'Meteors rain across the whole arena. They never hit you or your team.',
      clip: 'meteor-storm',
      clipLabel:
        'The Fire Wizard calls Meteor Storm on the Scorched Canyon: the sky reddens and meteors pound the arena',
    },
  },
  {
    id: 'frost',
    name: 'Frost Wizard',
    element: 'Frost',
    art: frostArt,
    motto: 'Turns the arena into a skating rink, then freezes whoever slides past.',
    spells: [
      {
        name: 'Icicle',
        text: 'A fast shard of ice. Free to cast.',
        effect: 'bolt',
        pop: '−20',
      },
      {
        name: 'Ice Patch',
        text: 'Freezes the ground at the target. Anyone moving on it slides and cannot steer.',
        effect: 'ice-patch',
        pop: 'Wheee!',
      },
      {
        name: 'Ice Wave',
        text: 'A fan of ice sweeps outward and freezes anyone it touches solid.',
        effect: 'ice-wave',
        pop: 'Frozen!',
      },
      {
        name: 'Deep Freeze',
        text: 'Frost gathers on the target, then freezes everyone caught there solid.',
        effect: 'deep-freeze',
        pop: '−10 Frozen!',
      },
    ],
    ultimate: {
      name: 'Absolute Zero',
      text: 'Enemies near you are slowed and their energy stops recharging.',
      clip: 'absolute-zero',
      clipLabel:
        'The Frost Wizard casts Absolute Zero on the Frost Tundra: a sheet of frost with a crystal rim spreads around him',
    },
  },
  {
    id: 'earth',
    name: 'Earth Wizard',
    element: 'Earth',
    art: earthArt,
    motto: 'Bogs everyone down. His mud puts out fire, and his rock walls stop shots.',
    spells: [
      {
        name: 'Mudball',
        text: 'A heavy ball of mud. Free to cast.',
        effect: 'bolt',
        pop: '−20',
      },
      {
        name: 'Mud Patch',
        text: 'Turns the ground to mud. Anyone in it is slowed, and fire goes out.',
        effect: 'mud-patch',
        pop: 'Slowed!',
      },
      {
        name: 'Rock Wall',
        text: 'Raises a wall that blocks movement and stops projectiles.',
        effect: 'rock-wall',
        pop: 'Blocked!',
        self: true,
      },
      {
        name: 'Tremor',
        text: 'Stamp the ground: enemies close to you are hurt and staggered.',
        effect: 'tremor',
        pop: '−12 Staggered!',
      },
    ],
    ultimate: {
      name: 'Earthquake',
      text: 'The ground shakes around you, slowing enemies for as long as they stay close.',
      clip: 'earthquake',
      clipLabel:
        'The Earth Wizard casts Earthquake in the Woodland: the floor darkens and the ground splits around him',
    },
  },
  {
    id: 'electricity',
    name: 'Electricity Wizard',
    element: 'Electricity',
    art: electricityArt,
    motto:
      'Never stands still. Plants rods, zips away, and lets the lightning do the rest.',
    spells: [
      {
        name: 'Electricity Ball',
        text: 'A crackling ball of lightning. Free to cast.',
        effect: 'bolt',
        pop: '−20',
      },
      {
        name: 'Lightning Rod',
        text: 'Plants a rod that shocks everyone nearby, you included, every half second.',
        effect: 'rod',
        pop: 'Zap! Zap!',
      },
      {
        name: 'Speed Up',
        text: 'Run half again as fast for a few seconds.',
        effect: 'speed',
        pop: '+50% speed',
        self: true,
      },
      {
        name: 'Chain Lightning',
        text: 'Lightning leaps from enemy to enemy, up to three of them.',
        effect: 'chain',
        pop: '−18 ×3',
      },
    ],
    ultimate: {
      name: 'Overcharge',
      text: 'Sprays lightning in every direction and scatters short-lived rods around you.',
      clip: 'overcharge',
      clipLabel:
        'The Electricity Wizard casts Overcharge on the Storm Plateau and crackles with purple lightning',
    },
  },
]

export const clipPath = (name: string) => `/games/wizard-wars/clips/${name}`
