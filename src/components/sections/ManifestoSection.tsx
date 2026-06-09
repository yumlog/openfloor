import { motion, useTransform, type MotionValue } from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'

/* ---------------------------------------------------------------------------
   Manifesto — slide 5, dark (#171717). The nine lines are wrapped around a 3D
   cylinder ("drum"); scrolling rolls them upward, one line into the front face
   per gesture. The scroll engine "traps" this slide (see useSlideController's
   `trap`), feeding a 0..1 `progress` motion value that this section converts to
   a roll position; only once the drum reaches an end does a further gesture
   leave the slide.

   Everything is authored in design pixels (1440 reference) inside a canvas that
   the parent scales by `ratio`, matching Philosophy / Portfolio — so the
   literals here shrink fluidly with the frame, no per-value clamp.
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

// Drum geometry (design px). The radius is chosen so the front face's line
// spacing matches the line box height (88 * 1.4 ≈ 123) — i.e. neighbouring
// lines sit one line-height apart when viewed head-on.
const FONT_PX = 88
const LINE_H = FONT_PX * 1.4 // ≈ 123
const STEP_ANG = 22 // degrees between adjacent lines on the cylinder
const RADIUS = LINE_H / (2 * Math.sin((STEP_ANG * Math.PI) / 360)) // ≈ 323

const CANVAS_W = DESIGN_WIDTH
const CANVAS_H = 600

// Roll mapping. Past ~FADE_LIMIT° from the front face a line is faded + clipped
// to nothing, so that angle is the real edge of the visible window. We anchor
// the drum's start and end exactly on that edge — never scrolling through dead,
// invisible space. W is that edge expressed in line-steps.
const FADE_LIMIT = 66 // degrees
const W = FADE_LIMIT / STEP_ANG // ≈ 3 line-steps
const LAST_INDEX = LINES.length - 1

// progress 0: first line (i=0) rests on the bottom fade edge — invisible but one
// notch from rising in (no leading dead scroll). progress 1: last line
// (i=LAST_INDEX) rests on the top fade edge — just gone, so the next gesture
// leaves for contact (no trailing dead scroll). Lines enter from the bottom and
// wind upward as you scroll down.
const START_OFFSET = -W
const TRAVEL = LAST_INDEX + 2 * W // bottom edge of first line → top edge of last

// Gestures to traverse the drum. ~1.5 lines per notch so it isn't an exhausting
// number of scrolls; raise the divisor for more lines per gesture.
export const MANIFESTO_STEPS = Math.round(TRAVEL / 1.5)

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

interface DrumLineProps {
  /** Line position currently on the front face (can run negative / past the
   *  last line so the drum starts and ends blank). */
  rollPos: MotionValue<number>
  index: number
  text: string
}

/**
 * A single line glued to the cylinder. Its angle is its offset from the front
 * face; it fades and shrinks as it rotates away and is hidden once it passes
 * ±90° (the back of the drum).
 */
function DrumLine({ rollPos, index, text }: DrumLineProps) {
  // (rollPos - index): as rollPos grows (scroll down) a line's angle increases,
  // so it rotates up and over the front face and the next line rises from below.
  const angle = useTransform(rollPos, (rp) => (rp - index) * STEP_ANG)
  const opacity = useTransform(angle, (a) =>
    clamp01(Math.cos((a * Math.PI) / 180))
  )
  const transform = useTransform(angle, (a) => {
    const c = clamp01(Math.cos((a * Math.PI) / 180))
    const scale = 0.82 + 0.18 * c
    return `rotateX(${a}deg) translateZ(${RADIUS}px) scale(${scale})`
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
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // 0..1 progress → front-face line position. Starts below the first line
  // (blank) and ends past the last (rolled off the top).
  const rollPos = useTransform(progress, (p) => p * TRAVEL + START_OFFSET)

  return (
    <section
      id={def.id}
      className="bg-bg-dark relative flex h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      {/* Scaled design-px canvas. */}
      <div
        className="shrink-0"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
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
              <DrumLine key={i} rollPos={rollPos} index={i} text={line} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
