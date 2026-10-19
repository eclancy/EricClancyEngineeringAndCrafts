import type { ReactNode } from 'react'
import type { PuppetBone, PuppetPart, PuppetRig } from './rigs'
import type { Bone, Pose } from './poses'

const BACK = new Set(['ArmBack_Upper', 'LegBack_Upper'])

interface PuppetProps {
  rig: PuppetRig
  pose: Pose
  /** How tall the whole drawing stands, in the parent SVG's units. */
  height: number
  /** Draw the shared skeleton over the drawing. */
  bones?: boolean
}

// One fighter as the game builds it: every part of the drawing hung on its bone with its joint at
// the bone's origin, so turning the bone swings the part about its joint. The group's origin is
// the point between the feet, on the ground.
export function Puppet({ rig, pose, height, bones = false }: PuppetProps) {
  const s = height / (rig.height + rig.legLength)
  const hipY = -rig.legLength + pose.hip[1] * 0.01 * rig.legLength
  const hipX = pose.hip[0] * 0.01 * rig.legLength
  const children = (name: string | null) => rig.bones.filter((b) => b.parent === name)

  const image = (part: PuppetPart, shade = 1, key?: string) => (
    <image
      key={key}
      href={part.src}
      x={-part.px}
      y={-part.py}
      width={part.w}
      height={part.h}
      style={shade < 1 ? { filter: `brightness(${shade})` } : undefined}
    />
  )

  const render = (bone: PuppetBone): ReactNode => {
    const kids = children(bone.name)
    const extras = rig.extras.filter((e) => e.bone === bone.name)
    const rot = pose.rot[bone.name as Bone] ?? 0
    const back = kids.filter((k) => BACK.has(k.name))
    const front = kids.filter((k) => !BACK.has(k.name))
    return (
      <g key={bone.name} transform={`translate(${bone.x} ${bone.y}) rotate(${rot})`}>
        {back.map(render)}
        {extras
          .filter((e) => e.behind)
          .map((e, i) => (
            <g key={`b${i}`} transform={`translate(${e.x} ${e.y})`}>
              {image(e.part)}
            </g>
          ))}
        {bone.part && image(bone.part, bone.shade)}
        {extras
          .filter((e) => e.onPart && !e.behind)
          .map((e, i) => (
            <g key={`o${i}`} transform={`translate(${e.x} ${e.y})`}>
              {image(e.part)}
            </g>
          ))}
        {front.map(render)}
        {extras
          .filter((e) => !e.onPart && !e.behind)
          .map((e, i) => (
            <g key={`e${i}`} transform={`translate(${e.x} ${e.y})`}>
              {image(e.part, bone.shade)}
            </g>
          ))}
        {bones && (
          <g className="df-bone">
            {kids.map((k) => (
              <line key={k.name} x1={0} y1={0} x2={k.x} y2={k.y} />
            ))}
            {kids.length === 0 && bone.part && (
              <line x1={0} y1={0} x2={0} y2={bone.part.h - bone.part.py} />
            )}
            <circle r={5 / s} />
          </g>
        )}
      </g>
    )
  }

  return (
    <g transform={`scale(${s})`}>
      <g transform={`translate(${hipX} ${hipY})`}>{children(null).map(render)}</g>
    </g>
  )
}
