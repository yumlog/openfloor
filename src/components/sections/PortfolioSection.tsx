import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH } from '@/config/slides'
import { PORTFOLIO_SLIDES } from './portfolio/projects'

/* ---------------------------------------------------------------------------
   Portfolio (슬라이드 3). 빨강 배경 + 흰 PORTFOLIO 텍스트.
   진입 후 progress가 REVEAL_TRIGGER를 넘으면 단일 시간 기반 reveal(0→1)이 재생되고,
   그 하나의 클럭에서 [텍스트 갈라짐 + 페이드]와 [첫 슬라이드 중앙 scale]을 겹쳐 구동한다.
   → 스크롤 속도와 무관하게 "텍스트가 아직 보이는 동안 슬라이드가 커지기 시작"이 보장됨.
   2·3번 슬라이드는 기존처럼 스크롤 연속으로 아래→위 상승(RISE_BANDS).
   풀블리드라 body로 포털.
--------------------------------------------------------------------------- */

export const PORTFOLIO_STEPS = 4

/* reveal: progress가 이 값을 넘으면 시간 기반 0→1 재생(휠 양 무관). */
const REVEAL_ON = 0.05 // 올라갈 때(정방향): 이 값 넘으면 reveal 재생(갈라짐 시작)
const REVEAL_OFF = 0.5 // 내려올 때(역방향): 이 값 아래로 내려오면 reveal 되감기(모임 시작) — 빠져나가기 전에 다 모이도록 일찍 트리거
/** reveal 재생 시간(s). 자동진행 입력 잠금(useSlideController)이 이 값을 참조하므로 export. */
export const REVEAL_DURATION = 2.55
const TIME_EASE = [0.65, 0, 0.35, 1] as const

/* reveal 구간 매핑(겹침이 핵심). */
const TEXT_SPLIT_RANGE: [number, number] = [0, 0.6] // 텍스트가 위/아래로 벌어지는 구간
const TEXT_FADE_RANGE: [number, number] = [0.35, 0.75] // 텍스트가 사라지는 구간(늦게 시작)
const SLIDE_SCALE_RANGE: [number, number] = [0.25, 0.85] // 첫 슬라이드 확대(텍스트 보일 때 시작)

/* 후속 슬라이드(2·3): 스크롤 연속 상승(기존 그대로). */
const RISE_BANDS: [number, number][] = [
  [0.55, 0.775],
  [0.775, 1],
]

interface PortfolioSectionProps {
  active: boolean
  progress: MotionValue<number>
}

export function PortfolioSection({ active, progress }: PortfolioSectionProps) {
  const frame = useFrameSize()
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // 단일 시간 기반 reveal 클럭. progress가 트리거를 넘으면 0→1, 되돌아가면 1→0.
  const reveal = useMotionValue(0)
  const [on, setOn] = useState(false)
  useEffect(() => {
    let prev = progress.get()
    const apply = (p: number) => {
      const rising = p >= prev
      prev = p
      setOn((cur) => {
        if (!cur && rising && p >= REVEAL_ON) return true
        if (cur && !rising && p <= REVEAL_OFF) return false
        return cur
      })
    }
    apply(progress.get())
    const unsub = progress.on('change', apply)
    return () => unsub()
  }, [progress])
  useEffect(() => {
    const c = animate(reveal, on ? 1 : 0, {
      duration: REVEAL_DURATION,
      ease: TIME_EASE,
    })
    return () => c.stop()
  }, [on, reveal])

  // 정방향 진입(혹은 manifesto에서 역진입) 시 reveal 자동 재생 — 추가 스크롤 없이
  // [텍스트 갈라짐 + 첫 슬라이드]가 자동 진행. (역방향 모임은 히스테리시스 falling<=REVEAL_OFF에서 끔.)
  useEffect(() => {
    if (active) setOn(true)
  }, [active])

  return (
    <>
      <section id="portfolio" className="h-[100dvh] w-full" />

      {createPortal(
        <motion.div
          className="pointer-events-none fixed inset-0 z-[40] overflow-hidden"
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{
            duration: active ? 0.15 : 0.4,
            ease: 'easeOut',
            delay: active ? 0 : 0.4,
          }}
        >
          {/* 솔리드 빨강 배경. */}
          <div className="absolute inset-0 bg-[#FB3640]" />

          <PortfolioText reveal={reveal} ratio={ratio} frameH={frame.h} />

          {/* 첫 슬라이드: reveal 클럭으로 중앙 확대(텍스트와 겹침). */}
          <PortfolioScaleSlide src={PORTFOLIO_SLIDES[0]} z={10} reveal={reveal} />

          {/* 후속 슬라이드: 스크롤 연속 상승. */}
          {PORTFOLIO_SLIDES.slice(1).map((src, i) => (
            <PortfolioRiseSlide
              key={src}
              src={src}
              band={RISE_BANDS[i]}
              z={10 * (i + 2)}
              progress={progress}
            />
          ))}
        </motion.div>,
        document.body
      )}
    </>
  )
}

/** 거대한 흰 PORTFOLIO. reveal로 위/아래 반쪽이 갈라지고(SPLIT) 늦게 페이드(FADE). */
function PortfolioText({
  reveal,
  ratio,
  frameH,
}: {
  reveal: MotionValue<number>
  ratio: number
  frameH: number
}) {
  const split = useTransform(reveal, TEXT_SPLIT_RANGE, [0, 1], { clamp: true })
  const topY = useTransform(split, (v) => -v * frameH * 0.7)
  const bottomY = useTransform(split, (v) => v * frameH * 0.7)
  const opacity = useTransform(reveal, TEXT_FADE_RANGE, [1, 0], { clamp: true })

  const base = {
    fontFamily: 'var(--font-montserrat)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.04em',
    color: '#ffffff',
    fontSize: 224 * ratio,
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <motion.div
          aria-hidden
          style={{ ...base, y: bottomY, opacity, clipPath: 'inset(50% 0 0 0)' }}
        >
          PORTFOLIO
        </motion.div>
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ ...base, y: topY, opacity, clipPath: 'inset(0 0 50% 0)' }}
        >
          PORTFOLIO
        </motion.div>
      </div>
    </div>
  )
}

/** 첫 슬라이드: reveal의 SLIDE_SCALE_RANGE 구간에서 중앙 scale 0→1(텍스트 보일 때 시작). */
function PortfolioScaleSlide({
  src,
  z,
  reveal,
}: {
  src: string
  z: number
  reveal: MotionValue<number>
}) {
  const scale = useTransform(reveal, SLIDE_SCALE_RANGE, [0, 1], { clamp: true })
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ scale, zIndex: z }}
    />
  )
}

/** 후속 슬라이드: 자기 band 구간에서 아래(100%)→0으로 스크롤 연속 상승. */
function PortfolioRiseSlide({
  src,
  band,
  z,
  progress,
}: {
  src: string
  band: [number, number]
  z: number
  progress: MotionValue<number>
}) {
  const y = useTransform(progress, band, ['100%', '0%'], { clamp: true })
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ y, zIndex: z }}
    />
  )
}
