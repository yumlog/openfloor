import { motion, useTransform, type MotionValue } from 'motion/react'
import { Container } from '@/components/layout/Container'

interface HeroGhostProps {
  /** The scroll-engine motion value — keeps this in lockstep with the hero. */
  slide: MotionValue<number>
  /** True while the hero is active — replays the ghost fade-in on re-entry. */
  active: boolean
}

/**
 * Oversized "UNDERSTAND DEEPER / BUILD TO LAST" ghost text. It lives in the
 * Frame layer BETWEEN the background and the CentralVideo (rendered before the
 * video, no z-index) so the video's lighten blend paints over it — the glass
 * object reads as occluding the text, matching the comp's depth.
 *
 * It is not inside the Slides track, so we reproduce the hero's motion here:
 * translate with the track (-slide * 100dvh) and fade out leaving slide 0, so it
 * behaves exactly like the rest of the hero content.
 */
export function HeroGhost({ slide, active }: HeroGhostProps) {
  const y = useTransform(slide, (v) => `${-v * 100}dvh`)
  const opacity = useTransform(slide, [0, 0.5], [1, 0])

  return (
    <motion.div
      aria-hidden
      style={{ y, opacity }}
      className="pointer-events-none absolute inset-0 flex h-[100dvh] flex-col justify-end"
    >
      <Container className="mb-[clamp(58px,6.94vw,100px)] max-md:mb-8">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
          className="text-ghost-on-dark text-[clamp(46px,8vw,115px)] leading-none font-bold tracking-[-0.04em] whitespace-nowrap max-md:text-[44px]"
        >
          <span className="block">UNDERSTAND DEEPER</span>
          <span className="block">BUILD TO LAST</span>
        </motion.h2>
      </Container>
    </motion.div>
  )
}
