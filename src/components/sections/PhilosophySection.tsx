import { motion } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'
import { PhilosophyDeck } from './philosophy/PhilosophyDeck'
import { PhilosophyMobile } from './philosophy/PhilosophyMobile'

const def = SLIDES[2]

// Headline pre-split so the reveal sweep is sized per line box (no wrapping).
const HEADLINE_LINES = ['결과로 말하는 것이', '우리의 방식입니다.']

const LABEL_DELAY = 0
const HEADLINE_DELAY = 0.15

interface PhilosophySectionProps {
  /** True while Philosophy is the active slide — drives reveal + deck reset. */
  active: boolean
}

/**
 * Slide 2, light. Title (label + reveal headline) centered at the top; below it
 * the interactive card deck. The deck (PhilosophyDeck) is a fixed 1440-design
 * canvas scaled by `ratio` so it shrinks proportionally; mobile swaps to a
 * purpose-built vertical stack. Top margin 100px (nav included), bottom 126px.
 *
 * The shared RevealText runs its "light variant" purely via the text color
 * (#111 here vs white on dark) — the white halo + cyan/red chroma live in CSS
 * and are colour-independent, so no keyframe change is needed.
 */
export function PhilosophySection({ active }: PhilosophySectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  return (
    <section
      id={def.id}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
    >
      <Container className="pt-[clamp(58px,6.94vw,100px)] max-md:pt-[88px]">
        <motion.p
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(LABEL_DELAY)}
          className="text-accent text-center text-[clamp(12px,1.39vw,20px)] leading-[1.4] font-bold tracking-[-0.04em] max-md:text-[15px]"
        >
          OUR PHILOSOPHY
        </motion.p>

        <RevealText
          as="h2"
          active={active}
          lines={HEADLINE_LINES}
          baseDelay={HEADLINE_DELAY}
          className="text-title-on-light mt-[clamp(7px,0.83vw,12px)] flex flex-col items-center text-[clamp(26px,3.06vw,44px)] leading-[1.4] font-bold tracking-normal max-md:text-[24px]"
        />
      </Container>

      {/* Card area, centered in the space between the title and the bottom
          margin (126px). */}
      <div className="flex flex-1 items-center justify-center pb-[clamp(73px,8.75vw,126px)] max-md:pb-[48px]">
        {isMobile ? (
          <PhilosophyMobile active={active} />
        ) : (
          <PhilosophyDeck active={active} ratio={ratio} />
        )}
      </div>
    </section>
  )
}
