import type { ReactNode } from 'react'
import { motion, type MotionValue } from 'motion/react'

interface SlidesProps {
  /** Track translateY, e.g. `-slide * 100dvh`. */
  trackY: MotionValue<string>
  children: ReactNode
}

/**
 * Vertical slide track. Sections are stacked and the whole track is moved with
 * a single transform; each child section is one viewport tall (100dvh).
 */
export function Slides({ trackY, children }: SlidesProps) {
  return (
    <div className="relative z-20 h-full w-full overflow-hidden">
      <motion.div
        className="flex flex-col will-change-transform"
        style={{ y: trackY }}
      >
        {children}
      </motion.div>
    </div>
  )
}
