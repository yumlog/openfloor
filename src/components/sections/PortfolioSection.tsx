import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'
import { PROJECTS } from './portfolio/projects'
import { PortfolioCarousel } from './portfolio/PortfolioCarousel'
import { PortfolioModal } from './portfolio/PortfolioModal'
import { PortfolioMobile } from './portfolio/PortfolioMobile'

const def = SLIDES[4]

// Single line — the reveal sweep is sized per line box.
const HEADLINE_LINES = ['함께 만들어온 결과']

const LABEL_DELAY = 0
const HEADLINE_DELAY = 0.15

interface PortfolioSectionProps {
  /** True while Portfolio is the active slide — drives reveal + wheel replay. */
  active: boolean
}

/**
 * Slide 4, light (#fafafa). Centered title (label + reveal headline) at the top;
 * below it an arc-wheel carousel of project cards with the centered brand name
 * beneath. Clicking a card centers it and opens a detail modal (portaled to the
 * body so the transformed slide track doesn't trap its fixed overlay). Mobile
 * swaps to a simple vertical list. Top margin 100px (nav included).
 */
export function PortfolioSection({ active }: PortfolioSectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)
  const [modalIndex, setModalIndex] = useState<number | null>(null)

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
          PORTFOLIO
        </motion.p>

        <RevealText
          as="h2"
          active={active}
          lines={HEADLINE_LINES}
          baseDelay={HEADLINE_DELAY}
          className="text-title-on-light mt-[clamp(7px,0.83vw,12px)] flex flex-col items-center text-[clamp(26px,3.06vw,44px)] leading-[1.4] font-bold tracking-normal max-md:text-[24px]"
        />
      </Container>

      {isMobile ? (
        <PortfolioMobile projects={PROJECTS} active={active} />
      ) : (
        <PortfolioCarousel
          projects={PROJECTS}
          active={active}
          modalOpen={modalIndex !== null}
          ratio={ratio}
          onOpen={setModalIndex}
        />
      )}

      {createPortal(
        <AnimatePresence>
          {modalIndex !== null && (
            <PortfolioModal
              key="portfolio-modal"
              project={PROJECTS[modalIndex]}
              onClose={() => setModalIndex(null)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}
