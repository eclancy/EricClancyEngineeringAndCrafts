// A few of DrawFight's shared animations, copied from the game's FighterAnimations.cs. Every
// fighter plays exactly these numbers: that is the whole point of one shared skeleton.
// Degrees per bone; positive swings a limb backward (fighters face right). `hip` is the game's
// hip offset (x, y), in hundredths of a leg length.

export type Bone =
  | 'Torso'
  | 'Head'
  | 'ArmFront_Upper'
  | 'ArmFront_Lower'
  | 'ArmBack_Upper'
  | 'ArmBack_Lower'
  | 'LegFront_Upper'
  | 'LegFront_Lower'
  | 'LegBack_Upper'
  | 'LegBack_Lower'

export interface Pose {
  hip: [number, number]
  rot: Partial<Record<Bone, number>>
}

export const BONES: Bone[] = [
  'Torso',
  'Head',
  'ArmFront_Upper',
  'ArmFront_Lower',
  'ArmBack_Upper',
  'ArmBack_Lower',
  'LegFront_Upper',
  'LegFront_Lower',
  'LegBack_Upper',
  'LegBack_Lower',
]

// The game's argument order: Torso, Head, AFU, AFL, ABU, ABL, LFU, LFL, LBU, LBL.
const p = (hx: number, hy: number, ...r: number[]): Pose => ({
  hip: [hx, hy],
  rot: Object.fromEntries(BONES.map((b, i) => [b, r[i] ?? 0])),
})

/** Keyframes at 60 Hz frame numbers; the last one loops back to the first. */
export type Clip = [number, Pose][]

export const clips = {
  idle: [
    [0, p(0, 1, -2, 2, -14, -24, 14, -18, -10, 10, 6, -6)],
    [46, p(0, 4, 5, -4, -5, -32, 7, -26, -10, 10, 6, -6)],
    [92, p(0, 1, -2, 2, -14, -24, 14, -18, -10, 10, 6, -6)],
  ],
  run: [
    [0, p(0, 4, -16, 8, 44, -46, -46, -60, -46, 10, 36, 50)],
    [6, p(0, -10, -18, 9, 16, -55, -16, -55, -4, 8, -30, 95)],
    [12, p(0, 4, -16, 8, -46, -60, 42, -46, 36, 50, -46, 10)],
    [18, p(0, -10, -18, 9, -16, -55, 16, -55, -30, 95, -4, 8)],
    [24, p(0, 4, -16, 8, 44, -46, -46, -60, -46, 10, 36, 50)],
  ],
  jump: [[0, p(0, -6, -4, -2, -92, -34, -64, -30, -66, 92, -10, 82)]],
  crouch: [[0, p(0, 12, -34, 22, -40, -70, 16, -50, -10, 10, 6, -6)]],
  hurt: [
    [0, p(-4, 2, 26, 16, 58, 34, 74, 40, -34, 26, 16, 30)],
    [14, p(-6, -2, 32, 10, 72, 22, 62, 52, -22, 38, 26, 18)],
    [28, p(-4, 2, 26, 16, 58, 34, 74, 40, -34, 26, 16, 30)],
  ],
  cheer: [[0, p(0, -8, 6, -14, 116, 10, -116, -10, -6, 4, 6, 4)]],
  strike: [[0, p(6, 0, -14, 8, -84, -12, 34, 24, -26, 10, 20, 14)]],
  uppercut: [[0, p(4, -6, -8, -10, -165, -15, 30, 20, -10, 6, 26, 30)]],
} satisfies Record<string, Clip>

export type ClipName = keyof typeof clips

// Every pose is written a quarter smaller than the game shows it (FighterRig.Drama).
const DRAMA = 1.25

/** The pose `clip` is in at `frame` (60 Hz), looping. */
export function sample(name: ClipName, frame: number): Pose {
  const clip: Clip = clips[name]
  if (clip.length === 1) return scale(clip[0][1])
  const length = clip[clip.length - 1][0]
  const t = ((frame % length) + length) % length
  let i = 0
  while (i < clip.length - 2 && clip[i + 1][0] <= t) i++
  const [f0, a] = clip[i]
  const [f1, b] = clip[i + 1]
  const k = (t - f0) / (f1 - f0)
  // Ease in and out between keys, as the game's tweens do.
  return scale(mix(a, b, k * k * (3 - 2 * k)))
}

export function mix(a: Pose, b: Pose, k: number): Pose {
  return {
    hip: [a.hip[0] + (b.hip[0] - a.hip[0]) * k, a.hip[1] + (b.hip[1] - a.hip[1]) * k],
    rot: Object.fromEntries(
      BONES.map((bone) => {
        const x = a.rot[bone] ?? 0
        return [bone, x + ((b.rot[bone] ?? 0) - x) * k]
      }),
    ),
  }
}

function scale(pose: Pose): Pose {
  return {
    hip: pose.hip,
    rot: Object.fromEntries(BONES.map((b) => [b, (pose.rot[b] ?? 0) * DRAMA])),
  }
}
