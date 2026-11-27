import type { PuppetExtra, PuppetRig } from './rigs'
import type { Bone, Pose } from './poses'

// Standing on flat feet, after the game's FighterRig.StandOnFeet and SolveLeg. A standing clip's
// leg angles are standing ones and its hips drop, so posed as written the legs stay straight and
// the feet sink through the floor: a crouch looked like a lean. The game instead keeps each shin
// as drawn, sets its sole on the floor, and turns the thigh to reach the knee - knee forward - as
// low as the hips say. A leg with no foot that is longer than the other stays straight and leans
// until its end touches the floor. The body slides to keep the feet where they stand at rest,
// and everything is set on the ground.

type V = [number, number]

const turn = ([x, y]: V, a: number): V => [
  x * Math.cos(a) - y * Math.sin(a),
  x * Math.sin(a) + y * Math.cos(a),
]
const clamp1 = (x: number) => Math.min(1, Math.max(-1, x))
const DEG = 180 / Math.PI

/** Whether an extra part is a foot cut separately, like DoomBot's boots. */
export const isFoot = (e: PuppetExtra) =>
  (e.part.src.split('/').pop() ?? '').startsWith('Foot')

interface Leg {
  upper: Bone
  lower: Bone
  /** The hip joint, from the hip bone. */
  joint: V
  /** The knee, from the hip joint, with the thigh unturned. */
  knee: V
  /** The bottom of the shin drawing, from the knee. */
  sole: V
  /** Whether the shin ends in a foot rather than just stopping. */
  foot: boolean
  /** -1 for the back leg, 1 for the front. */
  way: number
  /** A foot cut separately (DoomBot's boots): the ankle from the knee, and how far below it the
   * foot reaches. */
  ankle: V | null
  depth: number
}

function leg(rig: PuppetRig, side: 'Back' | 'Front'): Leg | null {
  const find = (name: string) => rig.bones.find((b) => b.name === name)
  const hip = find('Hip')
  const upper = find(`Leg${side}_Upper`)
  const lower = find(`Leg${side}_Lower`)
  if (!upper || !lower?.part) return null
  const p = lower.part
  const boot = rig.extras.find((e) => e.bone === lower.name && isFoot(e))
  return {
    upper: upper.name as Bone,
    lower: lower.name as Bone,
    joint: [(hip?.x ?? 0) + upper.x, (hip?.y ?? 0) + upper.y],
    knee: [lower.x, lower.y],
    sole: [p.w / 2 - p.px, p.h - p.py],
    // As the game reads a foot off the drawing: anything under twice as wide as the leg is not one.
    foot: upper.part ? p.w >= upper.part.w * 2 : true,
    way: side === 'Back' ? -1 : 1,
    ankle: boot ? [boot.x, boot.y] : null,
    depth: boot ? boot.part.h - boot.part.py : 0,
  }
}

const reach = (l: Leg) => l.joint[1] + Math.hypot(...l.knee) + l.sole[1]

function solve(l: Leg, at: V, floor: number, longer: boolean) {
  const joint: V = [at[0] + l.joint[0], at[1] + l.joint[1]]
  if (longer && !l.foot) {
    const whole: V = [l.knee[0] + l.sole[0], l.knee[1] + l.sole[1]]
    const spread = Math.acos(
      clamp1((floor - joint[1]) / Math.max(1, Math.hypot(...whole))),
    )
    const tilt = Math.atan2(whole[0], whole[1])
    const a = tilt - spread
    const b = tilt + spread
    const angle = (turn(whole, a)[0] - turn(whole, b)[0]) * l.way > 0 ? a : b
    return { thigh: angle, shin: angle, footX: joint[0] + turn(whole, angle)[0] }
  }
  const length = Math.hypot(...l.knee)
  const spread = Math.acos(clamp1((floor - l.sole[1] - joint[1]) / Math.max(1, length)))
  const lean = Math.atan2(l.knee[0], l.knee[1])
  let thigh = lean - spread
  const other = lean + spread
  if (turn(l.knee, other)[0] > turn(l.knee, thigh)[0]) thigh = other
  return { thigh, shin: 0, footX: joint[0] + turn(l.knee, thigh)[0] + l.sole[0] }
}

// Standing on separate feet, after the game's StandOnAnkles: each ankle stays where it is when
// he stands straight - under its hip - and the thigh and shin bend between hip and ankle, knee
// forward, as low as the pose puts the hips. The feet stay level on the floor.
function standOnAnkles(legs: Leg[], hip: V) {
  const floor = Math.min(
    ...legs.map((l) => l.joint[1] + l.knee[1] + l.ankle![1] + l.depth),
  )
  return {
    floor,
    turns: legs.map((l) => {
      const ankle = l.ankle!
      const joint: V = [hip[0] + l.joint[0], hip[1] + l.joint[1]]
      const target: V = [l.joint[0] + l.knee[0] + ankle[0], floor - l.depth]
      const l1 = Math.hypot(...l.knee)
      const l2 = Math.hypot(...ankle)
      const d: V = [target[0] - joint[0], target[1] - joint[1]]
      const far = Math.min(
        Math.max(Math.hypot(...d), Math.abs(l1 - l2) + 0.5),
        l1 + l2 - 0.01,
      )
      const bend = Math.acos(clamp1((l1 * l1 + far * far - l2 * l2) / (2 * l1 * far)))
      const toward = Math.atan2(d[1], d[0])
      // Knee forward: of the two ways the leg can bend, the one with the knee further ahead.
      const dir =
        Math.cos(toward + bend) > Math.cos(toward - bend) ? toward + bend : toward - bend
      const kneeAt: V = [joint[0] + Math.cos(dir) * l1, joint[1] + Math.sin(dir) * l1]
      const thigh = dir - Math.atan2(l.knee[1], l.knee[0])
      const shin =
        Math.atan2(target[1] - kneeAt[1], target[0] - kneeAt[0]) -
        Math.atan2(ankle[1], ankle[0])
      return { thigh, shin }
    }),
  }
}

/** A pose as drawn: where the hip goes, in the drawing's pixels from the point on the ground
 * between the feet, and every bone's turn. */
export interface Placed {
  hip: V
  rot: Pose['rot']
  /** Turns for feet cut separately, hung on these bones, to keep them level. */
  feet: Partial<Record<Bone, number>>
}

export function standOnFeet(rig: PuppetRig, pose: Pose): Placed {
  const hip: V = [pose.hip[0] * 0.01 * rig.legLength, pose.hip[1] * 0.01 * rig.legLength]
  const posed: Placed = { hip: [hip[0], hip[1] - rig.legLength], rot: pose.rot, feet: {} }
  const blend = pose.stand ?? 0
  const back = leg(rig, 'Back')
  const front = leg(rig, 'Front')
  if (blend <= 0 || !back || !front) return posed

  const rot = { ...pose.rot }
  const set = (bone: Bone, deg: number) => {
    const from = rot[bone] ?? 0
    rot[bone] = from + (deg - from) * blend
  }
  const place = (stood: V): V => [
    posed.hip[0] + (stood[0] - posed.hip[0]) * blend,
    posed.hip[1] + (stood[1] - posed.hip[1]) * blend,
  ]

  if (back.ankle && front.ankle) {
    const { floor, turns } = standOnAnkles([back, front], hip)
    const feet: Placed['feet'] = {}
    ;[back, front].forEach((l, i) => {
      set(l.upper, turns[i].thigh * DEG)
      set(l.lower, (turns[i].shin - turns[i].thigh) * DEG)
      feet[l.lower] = -((rot[l.upper] ?? 0) + (rot[l.lower] ?? 0)) * blend
    })
    return { hip: place([hip[0], hip[1] - floor]), rot, feet }
  }

  // The floor is as far down as the shorter leg reaches standing straight; the longer one bends.
  const floor = Math.min(reach(back), reach(front))
  const spare = rig.legLength * 0.03
  const backLong = reach(back) > floor + spare
  const frontLong = reach(front) > floor + spare

  const rest: V = [0, 0]
  const b = solve(back, hip, floor, backLong)
  const f = solve(front, hip, floor, frontLong)
  const b0 = solve(back, rest, floor, backLong)
  const f0 = solve(front, rest, floor, frontLong)
  // The turns do not depend on where the hip is across, so sliding it leaves them as they are.
  const at: V = [hip[0] + (b0.footX + f0.footX - b.footX - f.footX) * 0.5, hip[1]]

  for (const [l, s] of [
    [back, b],
    [front, f],
  ] as const) {
    set(l.upper, s.thigh * DEG)
    set(l.lower, (s.shin - s.thigh) * DEG)
  }
  return { hip: place([at[0], at[1] - floor]), rot, feet: {} }
}
