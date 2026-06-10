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

// 한 줄 — reveal sweep이 줄 박스 단위로 크기를 갖는다.
const HEADLINE_LINES = ['함께 만들어온 결과']

const LABEL_DELAY = 0
const HEADLINE_DELAY = 0.15

/** 타이틀 블록(라벨 + reveal 헤드라인). 풀뷰포트 캐러셀 레이어에서 같은 상단
 *  공간을 확보하는 투명 스페이서로도 재사용. */
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
        noChroma
        className="text-title-on-light mt-[clamp(7px,0.83vw,12px)] flex flex-col items-center text-[clamp(26px,3.06vw,44px)] leading-[1.4] font-bold tracking-normal max-md:text-[24px]"
      />
    </Container>
  )
}

interface PortfolioSectionProps {
  /** Portfolio가 활성 슬라이드인 동안 true — reveal + 휠 재생을 구동. */
  active: boolean
}

/**
 * 슬라이드 4, 라이트(#fafafa). 타이틀은 1440 프레임 안에 머문다(좁아서 cap이
 * 무방). 하지만 아크 휠 캐러셀은 풀 뷰포트를 차지해야 하므로 — 1440보다 넓음 —
 * body 포털을 통해 프레임의 `overflow-hidden` cap을 벗어나는 고정 풀뷰포트
 * 레이어에 렌더된다(모달을 포털하는 것과 같은 이유). 레이어는 `active`로
 * 페이드되고 루트는 `pointer-events: none`을 유지해 다른 슬라이드 / 내비를 절대
 * 막지 않는다; active일 때만 휠 밴드가 이벤트를 다시 켠다. 레이어 안의 투명
 * 타이틀 클론이 상단 공간을 확보해 휠이 세로 위치를 유지한다. 모바일은 단순한
 * 프레임 내 세로 리스트를 유지.
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

      {/* 풀뷰포트 캐러셀 레이어(데스크탑) — 프레임 밖으로 포털. */}
      {!isMobile &&
        createPortal(
          <motion.div
            className="pointer-events-none fixed inset-0 z-[40] flex flex-col overflow-hidden"
            initial={false}
            animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 투명 타이틀 클론 — 같은 상단 공간을 확보해 휠이 세로 위치를
                유지하게(진짜 타이틀은 프레임 안에 있음). */}
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
