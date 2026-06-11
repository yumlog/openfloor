import { createPortal } from 'react-dom'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH } from '@/config/slides'
import { PORTFOLIO_SLIDES } from './portfolio/projects'

/* ---------------------------------------------------------------------------
   Portfolio (슬라이드 3, 다크). 스크롤 트랩으로 0..1 progress를 구동:
     0         흰 "PORTFOLIO" + 빨강 배경 — philosophy 확대 끝 상태와 동일
               (슬라이드 2→3 스냅이 안 보이게 이어받음).
     0→0.08    빨강 배경이 걷히며 다크(#171717) 드러남.
     0.05→.15  텍스트 흰색 → 적색(#FB3640).
     .13→.25   텍스트가 가로 중앙에서 갈라져 위/아래로 화면 밖 이탈.
     ~0.5      slide-oliveyoung-1 풀커버.
     ~0.75     slide-oliveyoung-2 가 덮음.
     ~1        slide-oliveyoung-3 가 덮음.
   끝에서 더 밀면 manifesto로 advance. 풀블리드라 body로 포털.
--------------------------------------------------------------------------- */

/** 트랩 스텝 수: (리컬러+분리) + 슬라이드 3장. */
export const PORTFOLIO_STEPS = 4

const SPLIT_START = 0.16
const SPLIT_END = 0.27
const SLIDE_BANDS: [number, number][] = [
  [0.27, 0.5],
  [0.5, 0.75],
  [0.75, 1],
]

interface PortfolioSectionProps {
  active: boolean
  progress: MotionValue<number>
}

export function PortfolioSection({ active, progress }: PortfolioSectionProps) {
  const frame = useFrameSize()
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // 빨강 배경(philosophy 확대에서 이어받음) → 다크로 페이드.
  const redOverlay = useTransform(progress, [0, 0.06], [1, 0], { clamp: true })

  return (
    <>
      {/* 트랙 슬롯(빈 100dvh). 배경은 Frame 크로스페이드(#171717)가 칠한다. */}
      <section id="portfolio" className="h-[100dvh] w-full" />

      {createPortal(
        <motion.div
          className="pointer-events-none fixed inset-0 z-[40] overflow-hidden"
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: active ? 0 : 0.4 }}
        >
          {/* 빨강 배경 → 다크. */}
          <motion.div
            className="absolute inset-0 bg-[#FB3640]"
            style={{ opacity: redOverlay }}
          />

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

/** 거대한 PORTFOLIO 텍스트. 흰→적 리컬러 후 위/아래로 갈라져 이탈. */
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
  const color = useTransform(progress, [0.04, 0.11], ['#ffffff', '#FB3640'])

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
