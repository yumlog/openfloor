import { motion, type MotionValue } from 'motion/react'

interface CentralVideoProps {
  scale: MotionValue<number>
  x: MotionValue<number>
  y: MotionValue<number>
  opacity: MotionValue<number>
}

/**
 * The hero -> about centerpiece clip. Base position is the frame center; the
 * scroll engine drives scale/x/y/opacity (see App). Blend mode is handled in
 * CSS (.central-video) and toggled via the body.is-dark class.
 *
 * Source has no alpha — it's composited onto the slide background with
 * mix-blend-mode, which is why Frame paints the same color on both layers.
 */
export function CentralVideo({ scale, x, y, opacity }: CentralVideoProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <motion.div
        className="central-video h-[690px] w-[690px]"
        style={{ scale, x, y, opacity }}
      >
        <video
          src="/bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      </motion.div>
    </div>
  )
}
