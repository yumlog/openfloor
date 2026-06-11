import { createPortal } from 'react-dom'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH } from '@/config/slides'
import { PORTFOLIO_SLIDES } from './portfolio/projects'

/* ---------------------------------------------------------------------------
   Portfolio (슬라이드 3, 다크). 트랩 progress(0..1)로 분리 + 슬라이드 스택,
   전역 slide 값으로 philosophy→portfolio 핸드오프 리컬러를 구동:
     slide 2.55→2.95 (스냅 중): 흰 PORTFOLIO + 빨강 → 빨강 PORTFOLIO + 다크.
       → philosophy 확대 끝(흰+빨강 rest)과 다른 화면(빨강+다크)으로 착지해
         경계의 두 rest가 같은 화면으로 겹쳐 길게 느껴지지 않는다.
     progress 0   빨강 PORTFOLIO + 다크 (rest)
     ~0.04        글자 갈라지기 시작
     0.25~        slide-oliveyoung-1 → 2 → 3 풀커버 스택
   풀블리드라 body로 포털.
--------------------------------------------------------------------------- */

export const PORTFOLIO_STEPS = 4

const SPLIT_START = 0.04
const SPLIT_END = 0.25
const SLIDE_BANDS: [number, number][] = [
  [0.25, 0.5],
  [0.5, 0.75],
  [0.75, 1],
]

interface PortfolioSectionProps {
  active: boolean
  progress: MotionValue<number>
  /** 전역 슬라이드 값 — 스냅(2→3) 중 흰→빨강·빨강→다크 리컬러 구동. */
  slide: MotionValue<number>
}

export function PortfolioSection({
  active,
  progress,
  slide,
}: PortfolioSectionProps) {
  const frame = useFrameSize()
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // 스냅(2→3) 동안 빨강 배경 → 다크.
  const redOverlay = useTransform(slide, [2.55, 2.95], [1, 0], { clamp: true })

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
          {/* 솔리드 다크 배경. */}
          <div className="absolute inset-0 bg-[#171717]" />
          {/* 빨강 배경(스냅 중) → 다크. */}
          <motion.div
            className="absolute inset-0 bg-[#FB3640]"
            style={{ opacity: redOverlay }}
          />

          <PortfolioText
            progress={progress}
            slide={slide}
            ratio={ratio}
            frameH={frame.h}
          />

          {PORTFOLIO_SLIDES.map((src, i) => (
            <PortfolioSlide
              key={src}
              src={src}
              band={SLIDE_BANDS[i]}
              z={10 * (i + 1)}
              progress={progress}
            />
          ))}
        </motion.div>,
        document.body
      )}
    </>
  )
}

/** 거대한 PORTFOLIO 텍스트. 스냅 중 흰→빨강, 이후 progress로 갈라져 이탈. */
function PortfolioText({
  progress,
  slide,
  ratio,
  frameH,
}: {
  progress: MotionValue<number>
  slide: MotionValue<number>
  ratio: number
  frameH: number
}) {
  const t = useTransform(progress, [SPLIT_START, SPLIT_END], [0, 1], {
    clamp: true,
  })
  const topY = useTransform(t, (v) => -v * frameH * 0.7)
  const bottomY = useTransform(t, (v) => v * frameH * 0.7)
  const opacity = useTransform(t, [0, 0.85], [1, 0])
  const color = useTransform(slide, [2.55, 2.95], ['#ffffff', '#FB3640'], {
    clamp: true,
  })

  const base = {
    fontFamily: 'var(--font-montserrat)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.04em',
    fontSize: 224 * ratio,
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <motion.div
          aria-hidden
          style={{ ...base, color, y: bottomY, opacity, clipPath: 'inset(50% 0 0 0)' }}
        >
          PORTFOLIO
        </motion.div>
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ ...base, color, y: topY, opacity, clipPath: 'inset(0 0 50% 0)' }}
        >
          PORTFOLIO
        </motion.div>
      </div>
    </div>
  )
}

/** 풀커버 슬라이드. 자기 band 구간에서 아래(100%)→0으로 올라온다. */
function PortfolioSlide({
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
