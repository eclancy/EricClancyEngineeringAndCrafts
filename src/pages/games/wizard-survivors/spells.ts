// The game's thirty spells, as its SpellData resources describe them. Icons are the game's own
// generated art, copied to public/games/wizard-survivors/spells/<id>.png.

export type Element =
  | 'Fire'
  | 'Ice'
  | 'Arcane'
  | 'Darkness'
  | 'Light'
  | 'Grass'
  | 'Earth'
  | 'Wind'
  | 'Lightning'
  | 'Poison'
  | 'Metal'
  | 'Water'

export interface Spell {
  id: string
  name: string
  elements: Element[]
  text: string
}

// The light end of each element's ramp in the game's palette (.ai/art-direction.md, section 3).
export const elementColour: Record<Element, string> = {
  Fire: '#FFC848',
  Ice: '#7FDCF8',
  Arcane: '#C08CFF',
  Darkness: '#B48CE8',
  Light: '#FFF0A8',
  Grass: '#9BD455',
  Earth: '#E8C48C',
  Wind: '#B4EEE0',
  Lightning: '#FFF06A',
  Poison: '#B4E04A',
  Metal: '#C4D4E8',
  Water: '#6FB8F0',
}

export const elements = Object.keys(elementColour) as Element[]

export const spells: Spell[] = [
  {
    id: 'magic_missile',
    name: 'Magic Missile',
    elements: ['Arcane', 'Lightning'],
    text: 'Fires a fast projectile at nearby enemies.',
  },
  {
    id: 'arcane_explosion',
    name: 'Arcane Explosion',
    elements: ['Arcane'],
    text: 'Charges on every other spell you cast, then detonates around you.',
  },
  {
    id: 'spiritual_weapon',
    name: 'Spiritual Weapon',
    elements: ['Arcane', 'Light'],
    text: 'Summons spectral blades that strike enemies at intervals.',
  },
  {
    id: 'fireball',
    name: 'Fireball',
    elements: ['Fire'],
    text: 'Heaves a slow, heavy fireball that detonates in a wide blast.',
  },
  {
    id: 'cinderbreath',
    name: 'Cinderbreath',
    elements: ['Fire'],
    text: 'Throws fire tongue by tongue into a wide arc, then recharges.',
  },
  {
    id: 'scorching_ray',
    name: 'Scorching Ray',
    elements: ['Fire', 'Arcane'],
    text: 'Fires several scorching bolts at the nearest enemies at once.',
  },
  {
    id: 'meteor_swarm',
    name: 'Meteor Swarm',
    elements: ['Fire', 'Earth'],
    text: 'Calls down a telegraphed swarm of meteors that erupt across the field.',
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    elements: ['Light', 'Fire'],
    text: 'A blinding flare that burns nearby enemies and dazzles them, so they hit softer.',
  },
  {
    id: 'kindled_ward',
    name: 'Kindled Ward',
    elements: ['Light'],
    text: 'Kindles a mote of light that drifts at whatever is nearest and burns it out.',
  },
  {
    id: 'frost_shard',
    name: 'Frost Shard',
    elements: ['Ice', 'Water'],
    text: 'Every enemy that dies shatters, spraying ice into whatever is beside it.',
  },
  {
    id: 'glacial_spike',
    name: 'Glacial Spike',
    elements: ['Earth', 'Ice'],
    text: 'Erupts spikes of ice from the ground, impaling enemies before they sink away.',
  },
  {
    id: 'cone_of_cold',
    name: 'Cone of Cold',
    elements: ['Ice'],
    text: 'A cone of freezing air that damages and slows everything caught in it.',
  },
  {
    id: 'riptide',
    name: 'Riptide',
    elements: ['Water'],
    text: 'A surge of water tears through everything in a line, dragging what it passes.',
  },
  {
    id: 'mirefoot',
    name: 'Mirefoot',
    elements: ['Water', 'Grass'],
    text: 'Bog wells up in your footprints, dragging at whatever follows you.',
  },
  {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    elements: ['Lightning'],
    text: 'A heavy bolt that jumps to a nearby enemy, losing almost no force on the way.',
  },
  {
    id: 'gale_blade',
    name: 'Gale Blade',
    elements: ['Wind', 'Lightning'],
    text: 'A spinning wind blade thrown out past the nearest enemy and back to your hand.',
  },
  {
    id: 'cyclone_slash',
    name: 'Cyclone Slash',
    elements: ['Wind'],
    text: 'A spinning blade of wind that repeatedly hits everything nearby.',
  },
  {
    id: 'hunters_draw',
    name: "Hunter's Draw",
    elements: ['Metal', 'Wind'],
    text: 'Draws while you run and looses when you plant your feet. A longer run, a harder shot.',
  },
  {
    id: 'iron_palisade',
    name: 'Iron Palisade',
    elements: ['Metal'],
    text: 'Drives a line of iron stakes up between you and the nearest pack.',
  },
  {
    id: 'molten_shard',
    name: 'Molten Shard',
    elements: ['Metal', 'Fire'],
    text: "A molten shard that burns through armour, melting part of each target's max health.",
  },
  {
    id: 'obsidian_spike',
    name: 'Obsidian Spike',
    elements: ['Earth'],
    text: 'Erupts a spike of black stone beneath the nearest enemy.',
  },
  {
    id: 'gravewell',
    name: 'Gravewell',
    elements: ['Earth', 'Darkness'],
    text: 'Opens a pit nearby that waits, then swallows whatever steps into it.',
  },
  {
    id: 'black_tentacles',
    name: 'Black Tentacles',
    elements: ['Poison', 'Earth'],
    text: 'A wide cursed zone that damages and slows enemies as they enter and while they stay.',
  },
  {
    id: 'hollow_star',
    name: 'Hollow Star',
    elements: ['Darkness'],
    text: 'A dark well in the thick of the swarm drags everything into one knot, then collapses.',
  },
  {
    id: 'shadow_bolt',
    name: 'Shadow Bolt',
    elements: ['Darkness', 'Poison'],
    text: 'Shadow lightning that arcs far and hits softly, leaving its targets poisoned and slowed.',
  },
  {
    id: 'void_lance',
    name: 'Void Lance',
    elements: ['Arcane', 'Darkness'],
    text: 'A short-lived lance of shadow that pulses through every enemy it touches.',
  },
  {
    id: 'contagion',
    name: 'Contagion',
    elements: ['Poison'],
    text: 'Infects one enemy with a plague that jumps to everything around it when it dies.',
  },
  {
    id: 'toxic_spore_burst',
    name: 'Toxic Spore Burst',
    elements: ['Poison', 'Grass'],
    text: 'Bursts a cloud of spores that poisons every enemy caught in it.',
  },
  {
    id: 'thorn_vine',
    name: 'Thorn Vine',
    elements: ['Grass', 'Poison'],
    text: 'Whips out a thorned vine that pierces and poisons enemies in a line.',
  },
  {
    id: 'bramble_seed',
    name: 'Bramble Seed',
    elements: ['Grass'],
    text: 'Plants a seed at your feet that grows into a wide patch of thorns.',
  },
]

export const spellById = (id: string) => spells.find((s) => s.id === id)!

export const iconSrc = (id: string) => `/games/wizard-survivors/spells/${id}.png`
