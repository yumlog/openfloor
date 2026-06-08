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

/** Title block (label + reveal headline). Reused as an invisible spacer in the
 *  full-viewport carousel layer to reserve the same top space. */
function PortfolioTitle({ active }: { active: boolean }) {
  return (
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
  )
}

interface PortfolioSectionProps {
  /** True while Portfolio is the active slide — drives reveal + wheel replay. */
  active: boolean
}

/**
 * Slide 4, light (#fafafa). The title stays inside the 1440 frame (it's narrow,
 * so the cap is fine). The arc-wheel carousel, however, must span the FULL
 * viewport — wider than 1440 — so it's rendered through a body portal into a
 * fixed full-viewport layer that escapes the frame's `overflow-hidden` cap (the
 * same reason the modal is portaled). The layer fades with `active` and stays
 * `pointer-events: none` at the root so it never blocks other slides / the nav;
 * only the wheel band re-enables events while active. An invisible title clone
 * in the layer reserves the top space so the wheel keeps its vertical position.
 * Mobile keeps the simple in-frame vertical list.
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
      <PortfolioTitle active={active} />

      {isMobile && <PortfolioMobile projects={PROJECTS} active={active} />}

      {/* Full-viewport carousel layer (desktop) — portaled out of the frame. */}
      {!isMobile &&
        createPortal(
          <motion.div
            className="pointer-events-none fixed inset-0 z-[40] flex flex-col overflow-hidden"
            initial={false}
            animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Invisible title clone — reserves the same top space so the wheel
                holds its vertical position (the real title is in the frame). */}
            <div aria-hidden className="invisible shrink-0">
              <PortfolioTitle active={false} />
            </div>

            <PortfolioCarousel
              projects={PROJECTS}
              active={active}
              modalOpen={modalIndex !== null}
              ratio={ratio}
              onOpen={setModalIndex}
            />
          </motion.div>,
          document.body
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
