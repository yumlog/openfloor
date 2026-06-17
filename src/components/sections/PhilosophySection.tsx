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
import { PHILOSOPHY_CARDS } from './philosophy/cards'

const def = SLIDES[2]
const PORTFOLIO_INDEX = SLIDES.findIndex((sl) => sl.id === 'portfolio')

/** philosophy 트랩 스텝 수(카드 쌓임 + 마지막 노치 확대). */
export const PHILOSOPHY_STEPS = 4

const HEADLINE_LINES = ['결과로 말하는 것이', '우리의 방식입니다.']
const LABEL_DELAY = 0
const HEADLINE_DELAY = 0.15

/** 쌓임 종료(STACK_END) 후 읽을 멈춤 구간(DWELL)을 두고 확대 트리거. */
const DWELL = 0.1
/** 이 progress를 "넘으면" 확대가 시간 기반으로 쭉 진행된다(휠 양 무관). 확대 커밋 판정에
    쓰도록 useSlideController가 import 한다. */
export const GROW_START = STACK_END + DWELL // 0.65
/** 확대 글라이드 시간(s). 역방향 축소 중 입력 잠금(useSlideController)이 참조하므로 export. */
export const GROW_DURATION = 1.0
/** 확대 카드가 화면을 '딱 덮는' g 지점. 이 시점에 곧장 portfolio로 넘겨, g=1까지
    가는 동안 깔리는 '정지 빨강' 꼬리를 텍스트 페이드인으로 대체한다. */
const COVER_AT = 0.92
const GROWN_CARD = PHILOSOPHY_CARDS[2] // 확대되는 마지막 카드(빨강)
const GCW = 800 // 확대 카드 design 너비
const GCH = 280 // 확대 카드 design 높이
const TITLE_GAP = 72 // 헤딩 ↔ 첫 카드 간격(design px)

interface PhilosophySectionProps {
  active: boolean
  /** philosophy 트랩 progress(0..1). */
  progress: MotionValue<number>
  /** 전역 슬라이드 위치(2≈philosophy, 3≈portfolio) — 확대 오버레이가 전환 seam을
      양방향으로 덮게 하는 데 쓴다. */
  slide: MotionValue<number>
  /** 프로그램 스냅 — 확대 완료 시 죽은 스크롤 없이 portfolio로 자동 전환하는 데 쓴다. */
  goTo: (next: number) => void
}

export function PhilosophySection({
  active,
  progress,
  slide,
  goTo,
}: PhilosophySectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)
  // 모바일 스택 캔버스 스케일(375 기준). 좁은 폰에서 카드가 넘치지 않게 축소.
  const mobileScale = Math.min(1, frame.w / 375)

  // 확대 트리거: progress가 GROW_START를 "넘으면" 시간 기반으로 g:0→1 (쭉 커짐).
  // active와 무관하게 progress를 추적한다 → 포트폴리오로 나가도 philosophy progress는
  // 끝(≈1)에 머무르므로 growing=true·g=1(덮인 상태)이 유지되고, 되돌아올 때 빨강이
  // 즉시 덮은 채로 시작해 축소된다.
  const [growing, setGrowing] = useState(false)
  useEffect(() => {
    const apply = (p: number) => setGrowing(!isMobile && p >= GROW_START)
    apply(progress.get())
    const unsub = progress.on('change', apply)
    return () => unsub()
  }, [progress, isMobile])

  const g = useMotionValue(0)
  useEffect(() => {
    const controls = animate(g, growing ? 1 : 0, {
      duration: GROW_DURATION,
      // 역방향(축소)만: 시작 전 빨강을 SEAM_DURATION(0.4)만큼 유지 → 정방향 grow가
      // 만드는 "빨강만" 구간을 역방향에도 대칭으로 만든다(텍스트 사라진 뒤 잠깐 빨강).
      // 0.4로 두면 컨트롤러 역방향 잠금(seam 0.4 + GROW_DURATION)과 딱 맞물린다.
      delay: growing ? 0 : 0.4,
      ease: growing ? [0.22, 1, 0.36, 1] : [0.4, 0, 1, 1],
    })
    // 화면을 덮는 순간(COVER_AT) 곧장 portfolio로 넘긴다 — g=1까지 기다리며 '정지 빨강'이
    // 깔리지 않게. 그 시점부터 Portfolio 텍스트가 빨강 위로 페이드인(+정체)된다.
    // (g=1까지의 오버슈트는 그대로 깔린 채 진행.) 한 번만 발동.
    let handed = false
    const unsub = g.on('change', (v) => {
      if (growing && !handed && v >= COVER_AT && slide.get() < PORTFOLIO_INDEX) {
        handed = true
        goTo(PORTFOLIO_INDEX)
      }
    })
    return () => {
      controls.stop()
      unsub()
    }
  }, [growing, g, goTo, slide])

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
      className="relative flex h-dvh w-full flex-col overflow-hidden"
    >
      {/* 타이틀 + 스택 — 확대 진행에 따라 함께 페이드. */}
      <motion.div
        className="flex flex-1 flex-col"
        style={{ opacity: isMobile ? 1 : stageOpacity }}
      >
        <Container className="pt-[clamp(58px,6.94vw,100px)] max-md:pt-22">
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
            className="text-title-on-dark mt-[clamp(7px,0.83vw,12px)] flex flex-col items-center text-[clamp(26px,3.06vw,44px)] leading-[1.4] font-bold tracking-normal max-md:text-[24px]"
          />
        </Container>

        {/* 데스크탑: 헤딩 아래 72px 고정 간격 + 상단 정렬. 모바일: 중앙 정렬 reflow. */}
        <div
          className="flex flex-1 flex-col items-center max-md:justify-center"
          style={{ paddingTop: isMobile ? undefined : TITLE_GAP * ratio }}
        >
          <PhilosophyStack
            active={active}
            ratio={isMobile ? mobileScale : ratio}
            progress={progress}
            stageRef={stageRef}
            isMobile={isMobile}
          />
        </div>
      </motion.div>

      {/* 확대 브릿지(데스크탑) — 풀블리드라 body로 포털. */}
      {!isMobile &&
        createPortal(
          <PhilosophyGrow
            g={g}
            slide={slide}
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
 * g:0→1 로 빨강 카드가 화면을 덮을 때까지 쭉 확대된다(휠 양 무관). 본문/따옴표는 함께
 * 커지다 페이드아웃, 그 뒤 portfolio로 넘어간다.
 *
 * 오버레이 가시성은 `active`가 아니라 `slide`로 게이트한다 — philosophy↔portfolio
 * 슬라이드 전환 구간(2↔3) 내내 빨강이 덮어, 정/역방향 모두 흰 배경 노출 없이 seam을
 * 잇는다(빨강 배경이 깔린 slide≈3 쪽에서만 페이드). g는 progress 추적으로 parked 1을
 * 유지하므로 역방향엔 덮인 채 들어와 스크롤 백에 따라 축소된다.
 */
function PhilosophyGrow({
  g,
  slide,
  ratio,
  cx,
  cy,
  frameH,
}: {
  g: MotionValue<number>
  slide: MotionValue<number>
  ratio: number
  cx: number
  cy: number
  frameH: number
}) {
  // 카드가 화면을 '딱 덮는' 스케일(여유 배율 없이).
  const exactCover = Math.max(
    (2 * Math.max(cy, frameH - cy)) / GCH,
    (2 * cx) / GCW
  )
  // 최종(g=1)은 1.3배 여유까지 — 커버리지 마진 유지(가장자리 안 샘).
  const coverScale = exactCover * 1.3
  // g 0→COVER_AT: 작음→딱 덮음(눈에 보이는 확대). g COVER_AT→1: 1.3배 여유로
  // 빠르게 오버슈트(이미 덮여 있어 안 보임).
  const scale = useTransform(
    g,
    [0, COVER_AT, 1],
    [ratio, exactCover, coverScale],
    { clamp: true }
  )
  const contentOpacity = useTransform(g, [0, 0.4], [1, 0], { clamp: true })

  // 오버레이 가시성 — philosophy(2)~전환 구간에서 1, portfolio(3) 직전(빨강 배경)에서만
  // 페이드. 양방향 seam을 덮는다.
  const overlayOpacity = useTransform(slide, [1.8, 2, 2.97, 3], [0, 1, 1, 0], {
    clamp: true,
  })

  // 확대 패널(빨강 카드) 투명도는 g(스케일 진행)에 묶는다 — 역방향 축소(g 1→0)에도
  // 끝까지 보이다 g≈0에서만 사라져 흰 배경이 새지 않는다.
  const panelOpacity = useTransform(g, [0, 0.05], [0, 1], { clamp: true })

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      style={{ opacity: overlayOpacity }}
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
    </motion.div>
  )
}
