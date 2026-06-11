import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'
import { PhilosophyDeck } from './philosophy/PhilosophyDeck'
import { PhilosophyMobile } from './philosophy/PhilosophyMobile'
import { PHILOSOPHY_CARDS } from './philosophy/cards'

const def = SLIDES[2]

/** philosophy 트랩 스텝 수(세움 + 카드 3장; 마지막 노치 .75→1 이 확대 구간). */
export const PHILOSOPHY_STEPS = 4

const HEADLINE_LINES = ['결과로 말하는 것이', '우리의 방식입니다.']
const LABEL_DELAY = 0
const HEADLINE_DELAY = 0.15

const GROW_START = 0.75
const GROWN_CARD = PHILOSOPHY_CARDS[2] // 확대되는 마지막 중앙 카드(c2)
const CARD_PX = 420 // 덱 중앙 카드 design 크기

interface PhilosophySectionProps {
  active: boolean
  /** philosophy 트랩 progress(0..1). */
  progress: MotionValue<number>
}

export function PhilosophySection({ active, progress }: PhilosophySectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // 확대 구간(.78~)에서 타이틀+덱을 페이드아웃해 빨간 카드에 무대를 넘긴다.
  const stageOpacity = useTransform(progress, [0.78, 0.92], [1, 0], {
    clamp: true,
  })

  // 덱 c2 카드의 화면 좌표를 측정 — 확대 카드가 "그 자리·그 크기"에서 시작하게.
  // cx = 섹션 가로 중앙(= 뷰포트 중앙), cy = 카드 세로 중심(섹션 기준 고정 오프셋
  // → active일 때 곧 뷰포트 y). 트랙 translate와 무관하게 상대 측정.
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [center, setCenter] = useState({ cx: frame.w / 2, cy: frame.h / 2 })
  useLayoutEffect(() => {
    if (isMobile) return
    const sec = sectionRef.current
    const canvas = canvasRef.current
    if (!sec || !canvas) return
    const measure = () => {
      const sr = sec.getBoundingClientRect()
      const cr = canvas.getBoundingClientRect()
      setCenter({
        cx: sr.left + sr.width / 2,
        cy: cr.top - sr.top + cr.height / 2,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sec)
    ro.observe(canvas)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [isMobile, frame.w, frame.h])

  return (
    <section
      ref={sectionRef}
      id={def.id}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
    >
      {/* 타이틀 + 덱 — 확대 구간에서 함께 페이드. */}
      <motion.div
        className="flex flex-1 flex-col"
        style={{ opacity: isMobile ? 1 : stageOpacity }}
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
            noChroma
            className="text-title-on-light mt-[clamp(7px,0.83vw,12px)] flex flex-col items-center text-[clamp(26px,3.06vw,44px)] leading-[1.4] font-bold tracking-normal max-md:text-[24px]"
          />
        </Container>

        <div className="flex flex-1 items-center justify-center pb-[clamp(73px,8.75vw,126px)] max-md:pb-[48px]">
          {isMobile ? (
            <PhilosophyMobile active={active} />
          ) : (
            <PhilosophyDeck
              active={active}
              ratio={ratio}
              progress={progress}
              canvasRef={canvasRef}
            />
          )}
        </div>
      </motion.div>

      {/* 확대 브릿지(데스크탑) — 풀블리드라 body로 포털. */}
      {!isMobile &&
        createPortal(
          <PhilosophyGrow
            active={active}
            progress={progress}
            ratio={ratio}
            cx={center.cx}
            cy={center.cy}
            frameH={frame.h}
          />,
          document.body
        )}
    </section>
  )
}

/**
 * Philosophy → Portfolio 브릿지. 측정한 덱 c2 위치(cx,cy)에서, 덱과 같은 크기
 * (scale=ratio)로 시작해 progress .75→1 동안 화면을 덮을 때까지 확대 — 실제
 * 중앙 카드가 그대로 커지는 것처럼 보인다. 본문/따옴표는 카드와 함께 커지다
 * 페이드아웃, 그 뒤 흰 PORTFOLIO가 떠오른다. 끝 상태(빨강 + 흰 PORTFOLIO)는
 * Portfolio progress 0 과 동일해 슬라이드 2→3 스냅이 안 보인다.
 */
function PhilosophyGrow({
  active,
  progress,
  ratio,
  cx,
  cy,
  frameH,
}: {
  active: boolean
  progress: MotionValue<number>
  ratio: number
  cx: number
  cy: number
  frameH: number
}) {
  const growT = useTransform(progress, [GROW_START, 1], [0, 1], { clamp: true })
  // (cx,cy)에서 가장 먼 모서리까지 덮는 배율(라운드 모서리 여유 1.3). 가로는
  // cx가 뷰포트 중앙이라 cx가 곧 가로 절반 거리.
  const coverScale =
    (2 * Math.max(cx, cy, frameH - cy) * 1.3) / CARD_PX
  const scale = useTransform(growT, [0, 1], [ratio, coverScale])
  // 스텝 중엔 숨김; .73~.75 에 덱 c2 위에서 페이드인(완전히 겹쳐 이음새 없음).
  const panelOpacity = useTransform(progress, [0.73, 0.75], [0, 1], {
    clamp: true,
  })
  const contentOpacity = useTransform(growT, [0, 0.5], [1, 0], { clamp: true })
  const titleOpacity = useTransform(growT, [0.55, 1], [0, 1], { clamp: true })

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[40] overflow-hidden"
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: active ? 0 : 0.4 }}
    >
      {/* 측정한 덱 c2 위치(cx,cy)에서 시작해 확대되는 빨간 카드. */}
      <motion.div
        className="absolute"
        style={{
          left: cx,
          top: cy,
          x: '-50%',
          y: '-50%',
          scale,
          opacity: panelOpacity,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[24px] bg-[#FB3640]"
          style={{ width: CARD_PX, height: CARD_PX }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 px-[44px] py-[48px]"
            style={{ opacity: contentOpacity }}
          >
            <p className="text-title-on-dark text-[24px] leading-[1.4] font-medium tracking-[-0.05em] text-pretty break-keep">
              {GROWN_CARD.body}
            </p>
          </motion.div>
          <motion.img
            src="/images/card.svg"
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute right-[40px] bottom-[44px]"
            style={{ width: 128, height: 88, opacity: contentOpacity }}
          />
        </div>
      </motion.div>

      {/* 흰 PORTFOLIO. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: titleOpacity }}
      >
        <span
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.04em',
            color: '#ffffff',
            fontSize: 224 * ratio,
            whiteSpace: 'nowrap',
          }}
        >
          PORTFOLIO
        </span>
      </motion.div>
    </motion.div>
  )
}
