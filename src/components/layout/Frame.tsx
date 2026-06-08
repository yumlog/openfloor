import type { ReactNode } from 'react'
import { motion, type MotionValue } from 'motion/react'

interface FrameProps {
  /** Animated background color, shared by the full-bleed layer and the frame. */
  background: MotionValue<string>
  children: ReactNode
}

/**
 * The design frame. Two layers carry the SAME animated background:
 *
 *  1. a full-viewport bleed layer — so on screens wider than 1440 the side
 *     margins pick up the current slide color, and
 *  2. the 1440-capped, centered frame itself — so the central video's
 *     mix-blend-mode has an in-stacking-context backdrop to blend against
 *     (without this the blend swap reads as a hard white flash).
 *
 * Full-bleed elements (section backgrounds) belong outside this width cap;
 * only content is constrained to the frame.
 */
export function Frame({ background, children }: FrameProps) {
  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background }}
      />
      <motion.div
        className="max-w-frame fixed inset-y-0 left-1/2 z-10 w-full -translate-x-1/2 overflow-hidden"
        style={{ background }}
      >
        {children}
      </motion.div>
    </>
  )
}
