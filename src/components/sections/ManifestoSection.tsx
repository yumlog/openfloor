import { motion, useTransform, type MotionValue } from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'

/* ---------------------------------------------------------------------------
   Manifesto — slide 5, dark (#171717). The nine lines are wrapped around a 3D
   cylinder ("drum"); scrolling rolls them upward. The scroll engine "traps"
   this slide (see useSlideController's `trap`), feeding a 0..1 `progress` motion
   value that this section converts to a roll position; only once the drum
   reaches an end does a further gesture leave the slide.

   Two scales coexist: the TYPE is width-driven (88px at ≥1440, shrinking only on
   narrower frames, via the `ratio`-scaled canvas like Philosophy / Portfolio);
   the DRUM (radius + angular step) is HEIGHT-driven and computed at runtime so
   the cylinder fills 100dvh. Holding the line-box height fixed while the radius
   grows with the viewport simply flattens the curve and reveals more lines.
--------------------------------------------------------------------------- */

const def = SLIDES[5]

const LINES = [
  '우리는 결과물만',
  '전달하는 회사가',
  '아닙니다',
  '함께 문제를',
  '정의하고,',
  '올바른 방향을',
  '만들며,',
  '지속 가능한 결과를',
  '책임집니다.',
]

const DEG = Math.PI / 180

// Type stays width-driven: 88px at ≥1440, shrinking only on narrower frames.
// The drum's RADIUS / STEP_ANG, by contrast, are derived from the viewport
// HEIGHT at runtime (see the component) so the cylinder fills 100dvh — the line
// box height below is held fixed, so a taller drum just flattens the curve and
// shows more lines.
const FONT_PX = 88
const LINE_H = FONT_PX * 1.4 // ≈ 123 — fixed design-px gap between adjacent lines

const CANVAS_W = DESIGN_WIDTH

// The angle (from the front face) at which a line sits on the top/bottom screen
// edge — i.e. the edge of the visible window. RADIUS is sized so this angle maps
// to H/2. Tune for curvature + where lines fade in/out.
const FADE_LIMIT = 72 // degrees

const LAST_INDEX = LINES.length - 1

// Gestures to traverse the drum. FIXED (not tied to the dynamic geometry) so the
// number of scrolls to pass the section never changes with viewport size.
export const MANIFESTO_STEPS = 10

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

interface DrumLineProps {
  /** Line position currently on the front face (can run negative / past the
   *  last line so the drum starts and ends blank). */
  rollPos: MotionValue<number>
  index: number
  text: string
  /** Degrees between adjacent lines (derived from viewport height). */
  stepAng: number
  /** Cylinder radius in design px (derived from viewport height). */
  radius: number
}

/**
 * A single line glued to the cylinder. Its angle is its offset from the front
 * face; it fades and shrinks as it rotates away and is hidden once it passes
 * ±90° (the back of the drum).
 */
function DrumLine({ rollPos, index, text, stepAng, radius }: DrumLineProps) {
  // (rollPos - index): as rollPos grows (scroll down) a line's angle increases,
  // so it rotates up and over the front face and the next line rises from below.
  const angle = useTransform(rollPos, (rp) => (rp - index) * stepAng)
  const opacity = useTransform(angle, (a) => clamp01(Math.cos(a * DEG)))
  const transform = useTransform(angle, (a) => {
    const c = clamp01(Math.cos(a * DEG))
    const scale = 0.82 + 0.18 * c
    return `rotateX(${a}deg) translateZ(${radius}px) scale(${scale})`
  })

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ transform, opacity, backfaceVisibility: 'hidden' }}
    >
      <span className="text-title-on-dark text-[88px] leading-[1.4] font-bold tracking-normal whitespace-nowrap">
        {text}
      </span>
    </motion.div>
  )
}

interface ManifestoSectionProps {
  /** True while Manifesto is the active slide. */
  active: boolean
  /** 0..1 roll progress driven by the scroll-trap in useSlideController. */
  progress: MotionValue<number>
}

export function ManifestoSection({ progress }: ManifestoSectionProps) {
  const frame = useFrameSize()
  // Font stays width-driven (88px at ≥1440).
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // The canvas is scaled by `ratio`, so a canvas this tall renders to exactly
  // 100dvh — H is the viewport height expressed in design px.
  const H = frame.h / ratio

  // Height-driven drum geometry. RADIUS puts a line at FADE_LIMIT on the screen
  // edge (so the visible arc spans the full height); STEP_ANG then follows from
  // the FIXED design line height — a taller drum just flattens the curve and
  // shows more lines. Recomputed on every resize.
  const radius = H / 2 / Math.sin(FADE_LIMIT * DEG)
  const stepAng = (2 * Math.asin(LINE_H / (2 * radius))) / DEG
  const w = FADE_LIMIT / stepAng
  const startOffset = -w
  const travel = LAST_INDEX + 2 * w

  // 0..1 progress → front-face line position. Starts on the bottom screen edge
  // (first line about to rise in) and ends on the top edge (last line just gone).
  const rollPos = useTransform(progress, (p) => p * travel + startOffset)

  return (
    <section
      id={def.id}
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      {/* Scaled design-px canvas — height set so it renders to 100dvh; width
          stays 1440 as the coordinate system (horizontal overflow is clipped). */}
      <div
        className="shrink-0"
        style={{
          width: CANVAS_W,
          height: H,
          transform: `scale(${ratio})`,
        }}
      >
        {/* Drum window: provides the perspective and clips lines rolling past
            the top/bottom. Kept flat (no preserve-3d) so the clip is valid. */}
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ perspective: '1100px' }}
        >
          {/* 3D stage holding the cylinder faces. */}
          <div
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {LINES.map((line, i) => (
              <DrumLine
                key={i}
                rollPos={rollPos}
                index={i}
                text={line}
                stepAng={stepAng}
                radius={radius}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
