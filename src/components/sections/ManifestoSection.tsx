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
   the DRUM (radius + angular step) is HEIGHT-driven and computed at runtime to
   fill the band the drum rolls in. Lines sit on the cylinder via translate3d +
   rotateX with NO manual scale — PERSPECTIVE does the foreshortening, so the
   bulge reads naturally and the front line stays at exactly 88px.
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

// Type stays width-driven: 88px at ≥1440, shrinking only on narrower frames. The
// drum is CURVATURE-FIRST: a fixed angular step (STEP_ANG) and a low perspective
// set how convex it reads, and RADIUS follows from the FIXED line height so the
// front line stays exact 88px. Geometry is viewport-independent — the band just
// clips it — so the bulge holds at every height.
const FONT_PX = 88
const LINE_H = FONT_PX * 1.4 // ≈ 123 — fixed design-px gap between adjacent lines

const CANVAS_W = DESIGN_WIDTH
// Perspective applied to the drum window (design px). Lower = more convex bulge
// / stronger foreshortening; tune together with STEP_ANG.
const PERSPECTIVE = 800
// Top/bottom margin (design px) — the drum rolls inside the band between them,
// vertically centred, leaving these as empty margins.
const MARGIN = 100

// Degrees of tilt between adjacent lines — the primary curvature knob. Bigger =
// lines wrap around the cylinder faster = more convex (and fewer lines visible).
const STEP_ANG = 24
// Radius that makes adjacent lines sit one line-height apart head-on. The front
// line is pulled to z=0, so changing the radius never resizes it (stays 88px).
const RADIUS = LINE_H / (2 * Math.sin((STEP_ANG / 2) * DEG))
// Angle from the front face at which a line reaches the edge of the band — the
// "how many lines / how big" dial. LOWER = fewer, bigger lines (the drum is then
// scaled up more to fill the band).
const FADE_LIMIT = 50 // degrees
const COS_FADE = Math.cos(FADE_LIMIT * DEG)

// Projected half-height (design px, at base scale) of a line sitting at
// FADE_LIMIT: with the front line pulled to z=0 it lands at y=R·sinθ,
// z=-R·(1-cosθ), so its on-screen y is R·sinθ·P / (P + R·(1-cosθ)). The drum is
// scaled at runtime so this extent fills the band (see `fillScale`).
const NATURAL_HALF_H =
  (RADIUS * Math.sin(FADE_LIMIT * DEG) * PERSPECTIVE) /
  (PERSPECTIVE + RADIUS * (1 - COS_FADE))
const NATURAL_H = 2 * NATURAL_HALF_H

const LAST_INDEX = LINES.length - 1
// Roll span (in line-steps). progress 0 seats the first line on the bottom fade
// edge, progress 1 the last line on the top edge. W is that edge in line-steps.
const W = FADE_LIMIT / STEP_ANG
const START_OFFSET = -W
const TRAVEL = LAST_INDEX + 2 * W

// Gestures to traverse the drum. FIXED (not tied to the dynamic geometry) so the
// number of scrolls to pass the section never changes with viewport size. Higher
// = smaller roll per gesture = smoother (at the cost of more scrolls to pass).
export const MANIFESTO_STEPS = 14

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
 * face; it fades as it rotates away and is hidden once it passes ±90° (the back
 * of the drum). The line is content-sized (not a full-stage box) and placed
 * directly on the cylinder surface with translate3d + rotateX — there is no
 * manual scale, so PERSPECTIVE alone does the sizing: the front line (angle 0)
 * lands at y=z=0 (exact 88px) and lines turning away move back (z<0) and shrink
 * by perspective for a natural convex bulge.
 */
function DrumLine({ rollPos, index, text }: DrumLineProps) {
  // (rollPos - index): as rollPos grows (scroll down) a line's angle increases,
  // so it rotates up and over the front face and the next line rises from below.
  const angle = useTransform(rollPos, (rp) => (rp - index) * STEP_ANG)
  // Remap cos so the centre stays solid but the line reaches 0 exactly at the
  // band edge (FADE_LIMIT) — no faint half-visible lines past the margin.
  const opacity = useTransform(angle, (a) =>
    clamp01((Math.cos(a * DEG) - COS_FADE) / (1 - COS_FADE))
  )
  // Skip painting lines turned past the side of the drum (already opacity 0).
  const visibility = useTransform(angle, (a) =>
    Math.abs(a) < 90 ? 'visible' : 'hidden'
  )
  const transform = useTransform(angle, (a) => {
    const y = -RADIUS * Math.sin(a * DEG)
    const z = RADIUS * (Math.cos(a * DEG) - 1)
    return `translate(-50%, -50%) translate3d(0px, ${y}px, ${z}px) rotateX(${a}deg)`
  })

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 will-change-transform"
      style={{ transform, opacity, visibility, backfaceVisibility: 'hidden' }}
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
  // The drum rolls inside the band left after the top/bottom margins.
  const hBand = H - 2 * MARGIN
  // Zoom the (curvature-fixed) drum so its ±FADE_LIMIT extent fills the band —
  // big, solid lines instead of a small drum floating in the band.
  const fillScale = hBand / NATURAL_H

  // 0..1 progress → front-face line position. Starts on the bottom fade edge
  // (first line about to rise in) and ends on the top edge (last line just gone).
  const rollPos = useTransform(progress, (p) => p * TRAVEL + START_OFFSET)

  return (
    <section
      id={def.id}
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      {/* Scaled design-px canvas — height set so it renders to 100dvh; width
          stays 1440 as the coordinate system (horizontal overflow is clipped). */}
      <div
        className="relative shrink-0"
        style={{
          width: CANVAS_W,
          height: H,
          transform: `scale(${ratio})`,
        }}
      >
        {/* Band: the clip window between the top/bottom margins. Flat (no
            transform / perspective) so its overflow clip stays valid. */}
        <div
          className="absolute right-0 left-0 overflow-hidden"
          style={{ top: MARGIN, bottom: MARGIN }}
        >
          {/* Scaler: holds the perspective and zooms the whole projected drum by
              `fillScale` so the ±FADE_LIMIT extent fills the band. Scaling lives
              OUTSIDE the clip (on this inner layer) so the band size is fixed. */}
          <div
            className="absolute inset-0"
            style={{
              perspective: `${PERSPECTIVE}px`,
              transform: `scale(${fillScale})`,
            }}
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
      </div>
    </section>
  )
}
