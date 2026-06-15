import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'
import {
  PhilosophyStack,
  CardFace,
  LAST_CARD_CENTER_FRAC,
  STACK_END,
} from './philosophy/PhilosophyStack'
import { PhilosophyMobile } from './philosophy/PhilosophyMobile'
import { PHILOSOPHY_CARDS } from './philosophy/cards'

const def = SLIDES[2]

/** philosophy 트랩 스텝 수(카드 쌓임 + 마지막 노치 확대). */
export const PHILOSOPHY_STEPS = 4

const HEADLINE_LINES = ['결과로 말하는 것이', '우리의 방식입니다.']
const LABEL_DELAY = 0
const HEADLINE_DELAY = 0.15

/** 쌓임 종료(STACK_END) 후 마지막 카드를 읽을 멈춤 구간(DWELL)을 두고 확대 트리거. */
const DWELL = 0.13
/** 이 progress를 "넘으면" 확대가 시간 기반으로 쭉 진행된다(휠 양 무관, 카드 쌓임과 동일 방식). */
const GROW_START = STACK_END + DWELL // 0.68
/** 확대 글라이드 시간(s). */
const GROW_DURATION = 0.85
const GROWN_CARD = PHILOSOPHY_CARDS[2] // 확대되는 마지막 카드(빨강)
const GCW = 800 // 확대 카드 design 너비
const GCH = 280 // 확대 카드 design 높이
const TITLE_GAP = 72 // 헤딩 ↔ 첫 카드 간격(design px)

interface PhilosophySectionProps {
  active: boolean
  /** philosophy 트랩 progress(0..1). */
  progress: MotionValue<number>
}

export function PhilosophySection({ active, progress }: PhilosophySectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // 확대 트리거: progress가 GROW_START를 "넘으면" 시간 기반으로 g:0→1 (쭉 커짐).
  // 휠을 얼마나 돌렸는지와 무관하게 한 번 넘으면 끝까지 진행(카드 쌓임과 동일).
  const [growing, setGrowing] = useState(false)
  useEffect(() => {
    const apply = (p: number) => setGrowing(p >= GROW_START)
    apply(progress.get())
    const unsub = progress.on('change', apply)
    return () => unsub()
  }, [progress])

  const g = useMotionValue(0)
  useEffect(() => {
    const controls = animate(g, growing ? 1 : 0, {
      duration: GROW_DURATION,
      delay: growing ? 0.1 : 0, // 패널이 먼저 뜨고(0.12s) 그 다음 확대.
      ease: growing ? [0.4, 0, 0.2, 1] : [0.4, 0, 1, 1],
    })
    return () => controls.stop()
  }, [growing, g])

  // 확대 진행(g)에 따라 타이틀+스택을 페이드아웃(시간 기반, 스크롤 속도 무관).
  const stageOpacity = useTransform(g, [0.3, 0.6], [1, 0], { clamp: true })

  // 빨강(마지막) 카드의 쌓인 화면 중심을 측정 — 확대 카드가 그 자리·그 크기에서 시작.
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [center, setCenter] = useState({ cx: frame.w / 2, cy: frame.h / 2 })
  useLayoutEffect(() => {
    if (isMobile) return
    const sec = sectionRef.current
    const stage = stageRef.current
    if (!sec || !stage) return
    const measure = () => {
      const sr = sec.getBoundingClientRect()
      const gr = stage.getBoundingClientRect()
      setCenter({
        cx: sr.left + sr.width / 2,
        cy: gr.top - sr.top + gr.height * LAST_CARD_CENTER_FRAC,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sec)
    ro.observe(stage)
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
      {/* 타이틀 + 스택 — 확대 진행에 따라 함께 페이드. */}
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

        {/* 데스크탑: 헤딩 아래 72px 고정 간격 + 상단 정렬(stage origin top과 맞물림).
            모바일: 중앙 정렬 reflow. */}
        <div
          className="flex flex-1 flex-col items-center max-md:justify-center"
          style={{ paddingTop: isMobile ? undefined : TITLE_GAP * ratio }}
        >
          {isMobile ? (
            <PhilosophyMobile active={active} />
          ) : (
            <PhilosophyStack
              active={active}
              ratio={ratio}
              progress={progress}
              stageRef={stageRef}
            />
          )}
        </div>
      </motion.div>

      {/* 확대 브릿지(데스크탑) — 풀블리드라 body로 포털. */}
      {!isMobile &&
        createPortal(
          <PhilosophyGrow
            growing={growing}
            g={g}
            active={active}
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
 * Philosophy → Portfolio 브릿지. progress가 GROW_START를 넘으면(growing) 시간 기반
 * g:0→1 로 빨강 카드가 측정 위치(cx,cy)에서 화면을 덮을 때까지 쭉 확대된다 — 휠 양과
 * 무관(카드 쌓임과 동일 방식). 본문/따옴표는 함께 커지다 페이드아웃, 그 뒤 흰 PORTFOLIO가
 * 떠오른다. 끝 상태(빨강 + 흰 PORTFOLIO)는 Portfolio progress 0 과 동일해 스냅이 안 보인다.
 */
function PhilosophyGrow({
  growing,
  g,
  active,
  ratio,
  cx,
  cy,
  frameH,
}: {
  growing: boolean
  g: MotionValue<number>
  active: boolean
  ratio: number
  cx: number
  cy: number
  frameH: number
}) {
  // 800×280 카드를 화면을 덮을 때까지 확대 — 가로/세로 중 더 필요한 쪽 기준.
  const coverScale = Math.max(
    (2 * Math.max(cy, frameH - cy) * 1.3) / GCH,
    (2 * cx * 1.3) / GCW
  )
  // g(시간 기반 0→1)로 확대/콘텐츠 페이드/타이틀 등장을 구동(스크롤 양엔 직접 안 묶임).
  const scale = useTransform(g, [0, 0.9], [ratio, coverScale], { clamp: true })
  const contentOpacity = useTransform(g, [0, 0.4], [1, 0], { clamp: true })
  const titleOpacity = useTransform(g, [0.9, 1], [0, 1], { clamp: true })
  // 확대 패널은 트리거 직전 빠르게 떠올라 쌓인 빨강 카드와 1:1로 겹친 뒤 커진다.
  const panelOpacity = useMotionValue(0)
  useEffect(() => {
    const c = animate(panelOpacity, growing ? 1 : 0, { duration: 0.12 })
    return () => c.stop()
  }, [growing, panelOpacity])

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[40] overflow-hidden"
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: active ? 0 : 0.3, ease: 'easeOut', delay: active ? 0 : 0.4 }}
    >
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
        <div style={{ width: GCW, height: GCH }}>
          <CardFace card={GROWN_CARD} contentOpacity={contentOpacity} />
        </div>
      </motion.div>

      {/* 흰 PORTFOLIO (빨강 위). */}
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
