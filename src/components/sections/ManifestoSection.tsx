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

// Type stays width-driven: 88px at ≥1440, shrinking only on narrower frames.
// The drum's RADIUS / STEP_ANG, by contrast, are derived at runtime from the
// height of the band the drum rolls in (viewport minus top/bottom margins) — the
// line box height below is held fixed, so a taller band just flattens the curve
// and shows more lines.
const FONT_PX = 88
const LINE_H = FONT_PX * 1.4 // ≈ 123 — fixed design-px gap between adjacent lines

const CANVAS_W = DESIGN_WIDTH
// Perspective applied to the drum window (design px). Used both in the geometry
// (radius solve) and on the element itself, so they always agree. Lower = more
// convex bulge / stronger foreshortening; tune from here.
const PERSPECTIVE = 800
// Top/bottom margin (design px) — the drum rolls inside the band between them,
// vertically centred, leaving these as empty margins.
const MARGIN = 100

// The angle (from the front face) at which a line sits on the top/bottom edge of
// the band — i.e. the edge of the visible window. RADIUS is sized so this angle
// maps to band/2. Tune for curvature + where lines fade in/out.
const FADE_LIMIT = 72 // degrees

const LAST_INDEX = LINES.length - 1

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
  /** Degrees between adjacent lines (derived from viewport height). */
  stepAng: number
  /** Cylinder radius in design px (derived from viewport height). */
  radius: number
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
function DrumLine({ rollPos, index, text, stepAng, radius }: DrumLineProps) {
  // (rollPos - index): as rollPos grows (scroll down) a line's angle increases,
  // so it rotates up and over the front face and the next line rises from below.
  const angle = useTransform(rollPos, (rp) => (rp - index) * stepAng)
  const opacity = useTransform(angle, (a) => clamp01(Math.cos(a * DEG)))
  // Skip painting lines turned past the side of the drum (already opacity 0).
  const visibility = useTransform(angle, (a) =>
    Math.abs(a) < 90 ? 'visible' : 'hidden'
  )
  const transform = useTransform(angle, (a) => {
    const y = -radius * Math.sin(a * DEG)
    const z = radius * (Math.cos(a * DEG) - 1)
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

  // Height-driven drum geometry. RADIUS puts a line at FADE_LIMIT on the band
  // edge, accounting for perspective: with the front line pulled to z=0, a line
  // at angle θ sits at y = R·sinθ, z = -R·(1-cosθ), so its on-screen y is
  // R·sinθ·P / (P + R·(1-cosθ)). Setting that to hBand/2 at θ=FADE_LIMIT and
  // solving for R gives the formula below. STEP_ANG then follows from the FIXED
  // line height — a shorter band sharpens the curve and shows fewer lines.
  const a = Math.sin(FADE_LIMIT * DEG)
  const b = 1 - Math.cos(FADE_LIMIT * DEG)
  const radius = ((hBand / 2) * PERSPECTIVE) / (a * PERSPECTIVE - b * (hBand / 2))
  const stepAng = (2 * Math.asin(LINE_H / (2 * radius))) / DEG
  const w = FADE_LIMIT / stepAng
  const startOffset = -w
  const travel = LAST_INDEX + 2 * w

  // 0..1 progress → front-face line position. Starts on the bottom band edge
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
        className="relative shrink-0"
        style={{
          width: CANVAS_W,
          height: H,
          transform: `scale(${ratio})`,
        }}
      >
        {/* Drum window: the band between the top/bottom margins. Provides the
            perspective and clips lines rolling past the band edges. Kept flat
            (no preserve-3d) so the clip is valid. */}
        <div
          className="absolute right-0 left-0 overflow-hidden"
          style={{
            top: MARGIN,
            bottom: MARGIN,
            perspective: `${PERSPECTIVE}px`,
          }}
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
