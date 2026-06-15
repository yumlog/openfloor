import { createPortal } from 'react-dom'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH } from '@/config/slides'
import { PORTFOLIO_SLIDES } from './portfolio/projects'

/* ---------------------------------------------------------------------------
   Portfolio (슬라이드 3). 빨강 배경 + 흰 PORTFOLIO 텍스트가 트랩 progress(0..1)로
   반으로 갈라져 사라지고, 슬라이드가 풀커버로 올라온다(다크 리컬러 없음).
     progress 0    빨강 + 흰 PORTFOLIO (rest)
     ~0.04         글자 갈라지기 시작
     0.25~         slide-oliveyoung-1 → 2 → 3 풀커버 스택
   풀블리드라 body로 포털.
--------------------------------------------------------------------------- */

export const PORTFOLIO_STEPS = 4

const SPLIT_START = 0
const SPLIT_END = 0.55
const SLIDE_BANDS: [number, number][] = [
  [0.55, 0.7],
  [0.7, 0.85],
  [0.85, 1],
]

interface PortfolioSectionProps {
  active: boolean
  progress: MotionValue<number>
}

export function PortfolioSection({ active, progress }: PortfolioSectionProps) {
  const frame = useFrameSize()
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

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

          <PortfolioText progress={progress} ratio={ratio} frameH={frame.h} />

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

/** 거대한 흰 PORTFOLIO 텍스트. progress로 위/아래 반쪽이 갈라져 이탈. */
function PortfolioText({
  progress,
  ratio,
  frameH,
}: {
  progress: MotionValue<number>
  ratio: number
  frameH: number
}) {
  const t = useTransform(progress, [SPLIT_START, SPLIT_END], [0, 1], {
    clamp: true,
  })
  const topY = useTransform(t, (v) => -v * frameH * 0.7)
  const bottomY = useTransform(t, (v) => v * frameH * 0.7)
  const opacity = useTransform(t, [0, 0.85], [1, 0])

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
