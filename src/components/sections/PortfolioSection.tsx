import { createPortal } from 'react-dom'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH } from '@/config/slides'
import { PORTFOLIO_SLIDES } from './portfolio/projects'

/* ---------------------------------------------------------------------------
   Portfolio (슬라이드 3, 다크). 스크롤 트랩으로 0..1 progress를 구동:
     0      거대한 "PORTFOLIO"(적색 #FB3640) 텍스트가 다크 위 중앙.
     ~0.25  텍스트가 가로 중앙에서 갈라져 위/아래로 화면 밖 이탈.
     ~0.5   slide-oliveyoung-1 이 아래에서 올라와 풀커버.
     ~0.75  slide-oliveyoung-2 가 그 위를 덮음.
     ~1     slide-oliveyoung-3 가 그 위를 덮음.
   끝에서 더 밀면 manifesto로 advance(컨트롤러가 처리). 풀블리드(1440 캡 밖)라
   기존 캐러셀과 같은 이유로 body에 포털한다.
--------------------------------------------------------------------------- */

/** 트랩 스텝 수: 분리 + 슬라이드 3장. */
export const PORTFOLIO_STEPS = 4

const SPLIT_END = 0.25
const SLIDE_BANDS: [number, number][] = [
  [0.25, 0.5],
  [0.5, 0.75],
  [0.75, 1],
]

interface PortfolioSectionProps {
  /** Portfolio가 활성 슬라이드인 동안 true — 포털 레이어 페이드. */
  active: boolean
  /** 스크롤 트랩이 구동하는 0..1 progress. */
  progress: MotionValue<number>
}

export function PortfolioSection({ active, progress }: PortfolioSectionProps) {
  const frame = useFrameSize()
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  return (
    <>
      {/* 트랙 슬롯(빈 100dvh). 배경은 Frame 크로스페이드(#171717)가 칠한다. */}
      <section id="portfolio" className="h-[100dvh] w-full" />

      {createPortal(
        <motion.div
          className="pointer-events-none fixed inset-0 z-[40] overflow-hidden"
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
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

/** 거대한 PORTFOLIO 텍스트. 위/아래 절반을 겹쳐 두고 split progress(0→1)에 따라
 *  위 절반은 위로, 아래 절반은 아래로 이탈 + 페이드. */
function PortfolioText({
  progress,
  ratio,
  frameH,
}: {
  progress: MotionValue<number>
  ratio: number
  frameH: number
}) {
  const t = useTransform(progress, [0, SPLIT_END], [0, 1], { clamp: true })
  const topY = useTransform(t, (v) => -v * frameH * 0.7)
  const bottomY = useTransform(t, (v) => v * frameH * 0.7)
  const opacity = useTransform(t, [0, 0.85], [1, 0])

  const base = {
    fontFamily: 'var(--font-montserrat)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.04em',
    color: '#FB3640',
    fontSize: 224 * ratio,
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {/* 아래 절반 — in-flow로 박스 크기를 정의. */}
        <motion.div
          aria-hidden
          style={{ ...base, y: bottomY, opacity, clipPath: 'inset(50% 0 0 0)' }}
        >
          PORTFOLIO
        </motion.div>
        {/* 위 절반 — 위에 겹침. */}
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
