import { motion, type MotionValue } from 'motion/react'

interface CentralVideoProps {
  scale: MotionValue<number>
  x: MotionValue<number>
  y: MotionValue<number>
  opacity: MotionValue<number>
}

/**
 * The hero -> about centerpiece clip. Base position is the frame center; the
 * scroll engine drives scale/x/y/opacity (see App).
 *
 * Source has no alpha — it's composited onto the slide background with
 * mix-blend-mode (CSS .central-video, toggled via body.is-dark). For the blend
 * to actually reach the Frame's painted background, the blend element must NOT
 * be walled off in its own stacking context: the wrapper has no z-index (so it
 * doesn't isolate), the scroll transform lives on a separate inner div, and the
 * blend element itself carries only opacity. Mirrors the old working structure.
 */
export function CentralVideo({ scale, x, y, opacity }: CentralVideoProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="central-video h-[690px] w-[690px]"
        style={{ opacity }}
      >
        <motion.div className="h-full w-full" style={{ scale, x, y }}>
          <video
            src="/bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="central-video__el h-full w-full object-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
