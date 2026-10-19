import dfTitleScreen from '../assets/projects/drawfight/title-screen.jpg'
import dfPoses from '../assets/projects/drawfight/poses.jpg'
import dfRooftops from '../assets/projects/drawfight/rooftops.jpg'
import dfLaser from '../assets/projects/drawfight/laser.jpg'
import dfBigShow from '../assets/projects/drawfight/big-show.jpg'
import dfCharacterSelect from '../assets/projects/drawfight/character-select.jpg'
import dpCuddle from '../assets/projects/drawpets/cuddle.jpg'
import dpHome from '../assets/projects/drawpets/home.jpg'
import dpDrawHead from '../assets/projects/drawpets/draw-head.jpg'
import dpHomeAtNight from '../assets/projects/drawpets/home-at-night.jpg'
import dpBathDay from '../assets/projects/drawpets/bath-day.jpg'
import wsTitleScreen from '../assets/projects/wizard-survivors/title-screen.jpg'
import wsForestSpells from '../assets/projects/wizard-survivors/forest-spells.jpg'
import wsBossElderbark from '../assets/projects/wizard-survivors/boss-elderbark.jpg'
import wsSketchbook from '../assets/projects/wizard-survivors/sketchbook.jpg'
import wsLevelUp from '../assets/projects/wizard-survivors/level-up.jpg'
import wwTitleScreen from '../assets/projects/wizard-wars/title-screen.jpg'
import wwWoodlandBattle from '../assets/projects/wizard-wars/woodland-battle.jpg'
import wwMeteorStorm from '../assets/projects/wizard-wars/meteor-storm.jpg'
import wwFrostTundra from '../assets/projects/wizard-wars/frost-tundra.jpg'
import wwCharacterSelect from '../assets/projects/wizard-wars/character-select.jpg'
import emLogo from '../assets/projects/erics-miniatures/logo.png'
import emTerrain from '../assets/projects/erics-miniatures/terrain.jpg'
import emEscapeRealityFeature from '../assets/projects/erics-miniatures/escape-reality-feature.jpg'

export interface ProjectImage {
  src: string
  alt: string
  fit?: 'contain'
}

export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  tech: string[]
  repoUrl?: string
  liveUrl?: string
  /** Label for the liveUrl button. Defaults to 'Live demo'. */
  liveLabel?: string
  /** Optional headline actions, rendered as standout buttons above the others. */
  callsToAction?: { href: string; label: string; emoji?: string }[]
  images?: ProjectImage[]
  /** Set for a downloadable game: it gets a page at /games/<id>, a download page at
   *  /<id>/download, and an update check at /<id>/version.json (see nginx.conf). */
  game?: GameInfo
}

export interface GameInfo {
  /** The eclancy/<repo> GitHub repo whose Releases hold the builds. */
  repo: string
  /** e.g. '1–4 players, local' */
  players: string
  /** Longer than the card's description; one string per paragraph. */
  about: string[]
  /** Defaults to 'Windows'. */
  platform?: string
  /** Not downloadable yet: no download button or release history, a "Coming soon" note instead. */
  comingSoon?: boolean
  /** A second headline action for the game page: a big button under Download, and a band
   *  explaining it below the intro. */
  feature?: {
    title: string
    text: string
    href: string
    label: string
    emoji: string
    more?: { href: string; label: string }
  }
}

export const gamePath = (project: Project) => `/games/${project.id}`
export const downloadPath = (project: Project) => `/${project.id}/download`

// Curated from each project's README / design docs. Refresh via the
// content-updater agent when a project's scope or stack changes.
export const projects: Project[] = [
  {
    id: 'drawfight',
    name: 'DrawFight',
    tagline: "A platform fighter where every character is a kid's drawing.",
    description:
      'Smash-style percent, knockback and stocks, with every fighter cut from a paper ' +
      'drawing and animated line for line.',
    tech: ['Godot 4.5', 'C#', '.NET 9'],
    repoUrl: 'https://github.com/eclancy/DrawFight',
    game: {
      repo: 'DrawFight',
      players: '1–2 players, local',
      feature: {
        title: 'Be in the game!',
        text:
          'Draw your own fighter on paper, snap a photo and send it in. Fighters sent in ' +
          'can end up in DrawFight: Triguy got in that way.',
        href: '/draw',
        label: 'Submit your fighter',
        emoji: '✏️',
        more: { href: '/draw/guide', label: 'Read the drawing guide first' },
      },
      about: [
        'You draw a character on paper. It gets cut into pieces, hung on a skeleton, and ' +
          "put in a fighting game. Then it runs, jumps, and knocks other people's drawings " +
          'off the screen.',
        'The drawing is never redrawn or cleaned up: the same pixels are rotated about their ' +
          'joints, so if a limb is lumpy, the limb is lumpy in the game. Every fighter rigs ' +
          'to one shared skeleton, so a new drawing is an afternoon of work, not a week.',
        'Smash-style percent, knockback and stocks, 17 moves per fighter, four stages, and ' +
          'thirty art-supply items, from a giant pencil to a glitter bomb. Play a friend with ' +
          'Xbox pads or the keyboard, or take on the computer.',
      ],
    },
    callsToAction: [
      {
        href: 'https://ecec.dev/drawfight/download',
        label: 'Download & play',
        emoji: '🎮',
      },
    ],
    images: [
      {
        src: dfTitleScreen,
        alt: 'DrawFight title screen on lined notebook paper: a punk rocker lunges at a construction worker',
      },
      {
        src: dfRooftops,
        alt: 'DoomBot, a hand-drawn red robot, punches Circy, a yellow smiley face on stick legs, on the City Rooftops stage',
      },
      {
        src: dfLaser,
        alt: 'Circy fires a giant hand-drawn laser across the Open Plains while Triguy leaps over it',
      },
      {
        src: dfBigShow,
        alt: "DoomBot's fiery blast launches a burning Triguy across the Big Show concert stage",
      },
      {
        src: dfCharacterSelect,
        alt: 'Character select: six fighters drawn on paper cards',
      },
      {
        src: dfPoses,
        alt: 'One DrawFight stick figure shown in ten animation poses',
      },
    ],
  },
  {
    id: 'drawpets',
    name: 'DrawPets',
    tagline: 'Draw a creature, then watch it come alive.',
    description:
      'A virtual pet you draw part by part, then feed, play with and give a home of its ' +
      'own.',
    tech: ['Godot 4.5', 'GDScript', 'Windows', 'Android'],
    game: {
      repo: 'DrawPets',
      players: '1 player',
      platform: 'Windows and Android',
      about: [
        'Kids choose what their creature has - heads, arms, legs, wings, a tail, anything - ' +
          'and draw each part on its own sheet, starting from a red dot that marks where it ' +
          'joins on. They drag the parts onto the body and it comes alive: every kind of ' +
          'part has its own way of moving, so whatever they invent walks, flaps, wags and ' +
          'blinks the first time.',
        'Then it is theirs to look after, a bit like Nintendogs. Pet it, feed it the food ' +
          'they drew for it, throw its favourite toy, take it on walks and give it a bath ' +
          'once a week. Toys and furniture behave by the words the kid picks for them - a ' +
          'bouncy ball gets fetched, a cozy bed is for napping. Pets never get sick, run ' +
          'away or die.',
        'Every picture in the game is a coloured-pencil or marker drawing, and there is no ' +
          'AI and no photos anywhere. A sibling of DrawFight, for Windows and for Android ' +
          'phones and tablets.',
      ],
    },
    images: [
      {
        src: dpCuddle,
        alt: 'A drawn creature alive in its meadow, hugging its teddy bear with a heart above it',
      },
      {
        src: dpDrawHead,
        alt: "Drawing a creature's head on its own sheet, starting from a red dot at the neck",
      },
      {
        src: dpHomeAtNight,
        alt: 'The pet asleep on its bed at night in a decorated yard with a trampoline and lamp',
      },
      {
        src: dpBathDay,
        alt: 'Bath day: the pet scrubbed with a soapy sponge in a bubbly tub',
      },
      {
        src: dpHome,
        alt: 'The DrawPets home screen, with the pet in its den and a Draw a new pet button',
      },
    ],
  },
  {
    id: 'wizard-survivors',
    name: 'Wizard Survivors',
    tagline: 'A roguelite auto-shooter in the Vampire Survivors mold.',
    description:
      'Build your wizard from 30 spells and survive the horde. Every sprite and sound is ' +
      'made by code.',
    tech: ['Godot 4.5', 'C#', '.NET 9'],
    repoUrl: 'https://github.com/eclancy/WizardSurvivors',
    game: {
      repo: 'WizardSurvivors',
      players: '1 player',
      about: [
        'You move; your spells fire themselves. Every run asks the same question: what did ' +
          'you pick, and where did you stand?',
        'Eight campaign chapters and nine bosses, with 30 spells, 7 wizards and 29 relics to ' +
          'build a run from. Every sprite and every sound was generated by code, pixel by ' +
          'pixel and sample by sample, with no painted art or recorded audio.',
        'One chapter, the Sketchbook, was drawn by my kids: its eight enemies, its boss and ' +
          'a friendly dog that cannot be hurt are their drawings, used exactly as drawn.',
      ],
    },
    callsToAction: [
      {
        href: 'https://ecec.dev/wizard-survivors/download',
        label: 'Download & play',
        emoji: '🎮',
      },
    ],
    images: [
      {
        src: wsTitleScreen,
        alt: 'Wizard Survivors title screen: a pixel-art wizard in a glowing golden circle in a moonlit forest',
      },
      {
        src: wsForestSpells,
        alt: 'A wizard in the Enchanted Forest fires crossing scorching rays as meteors and black tentacles burst among a few skeletons and a ghost',
      },
      {
        src: wsBossElderbark,
        alt: 'Boss fight with Elderbark, the Treant: a scorching ray and exploding meteors strike the giant tree',
      },
      {
        src: wsSketchbook,
        alt: 'The Sketchbook chapter: ice spikes and chain lightning among crayon monsters drawn by children on lined paper',
      },
      {
        src: wsLevelUp,
        alt: 'The level-up screen offering upgrades to Cone of Cold, Black Tentacles and Solar Flare',
      },
    ],
  },
  {
    id: 'wizard-wars',
    name: 'Wizard Wars',
    tagline: 'A wizard battle arena for up to four players.',
    description:
      'Fire, frost, earth or lightning: be the last wizard standing, or team up in Red ' +
      'vs Blue.',
    tech: ['Godot 4.5', 'C#', '.NET 9'],
    repoUrl: 'https://github.com/eclancy/WizardWars',
    game: {
      repo: 'WizardWars',
      players: '1–4 players, local',
      about: [
        'Pick a wizard of fire, frost, earth or electricity and fight to be the last one ' +
          'standing, or team up in Red vs Blue. Playing alone? You face a computer-controlled ' +
          'wizard.',
        'Each wizard has a free basic attack, two abilities and an ultimate that charges as ' +
          'you fight. Everyone joins from Character Select with a controller, and player one ' +
          'can use the keyboard.',
        'It started life as a Unity game and was rebuilt in Godot 4.5 with C#.',
      ],
    },
    callsToAction: [
      {
        href: 'https://ecec.dev/wizard-wars/download',
        label: 'Download & play',
        emoji: '🎮',
      },
    ],
    images: [
      {
        src: wwTitleScreen,
        alt: 'Wizard Wars title screen: four cartoon wizards rise from an open spellbook',
      },
      {
        src: wwWoodlandBattle,
        alt: 'Four wizards battle in the Woodland arena, one frozen in ice, one crackling with lightning',
      },
      {
        src: wwMeteorStorm,
        alt: 'A Meteor Storm ultimate explodes on the Storm Plateau beside lightning rods and an earthquake ring',
      },
      {
        src: wwFrostTundra,
        alt: 'A battle on the Frost Tundra stage with an ice patch, a mud patch and flames',
      },
      {
        src: wwCharacterSelect,
        alt: 'Character Select with four players joined and their wizards locked in',
      },
    ],
  },
  {
    id: 'erics-miniatures',
    name: "Eric's Miniatures",
    tagline: 'A showcase for hand-painted miniatures.',
    description:
      'Painted miniatures, custom terrain and other handmade art, on a site of its own.',
    tech: ['React', 'TypeScript', 'Material UI', 'SASS'],
    repoUrl: 'https://github.com/eclancy/EricsMiniatures',
    liveUrl: 'https://ericsminiatures.com',
    liveLabel: 'Visit site',
    images: [
      { src: emLogo, alt: "Eric's Miniatures logo", fit: 'contain' },
      {
        src: emEscapeRealityFeature,
        alt: "Eric's Miniatures Art That Escapes Reality feature",
      },
      { src: emTerrain, alt: "Eric's Miniatures Custom Built Terrain page" },
    ],
  },
]
