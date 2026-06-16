import { createPortal } from 'react-dom'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH } from '@/config/slides'
import {
  PORTFOLIO_PROJECTS,
  type PortfolioProject,
} from './portfolio/projects'

/* ---------------------------------------------------------------------------
   Portfolio (슬라이드 3). 빨강 배경 + 흰 PORTFOLIO 텍스트.
   reveal은 trap progress로 직접 구동한다(0→REVEAL_END에서 0→1). 정방향 진입은
   컨트롤러가 progress를 자동 전진시켜 재생(그동안 입력 잠금)하고, 역방향/재진입도
   progress만 따르므로 별도 클럭/히스테리시스가 필요 없다. 그 하나의 reveal01에서
   [텍스트 갈라짐 + 페이드]와 [첫 슬라이드 중앙 scale]을 겹쳐 구동한다.
   2·3번 슬라이드는 REVEAL_END 위 구간에서 스크롤 연속으로 아래→위 상승(RISE_BANDS).
   풀블리드라 body로 포털.
--------------------------------------------------------------------------- */

export const PORTFOLIO_STEPS = 4

/** reveal이 완료되는 progress 지점. 컨트롤러가 정방향 진입 시 progress를 0→여기로 전진. */
export const REVEAL_END = 0.3
/** reveal 자동 전진 시간(s). 컨트롤러가 이 값으로 progress를 전진시킨다. */
export const REVEAL_DURATION = 2.55
/** 진입 후 텍스트가 합쳐진 채 멈춰 있는 시간(s) — 컨트롤러가 자동 전진 delay로 참조. */
export const REVEAL_HOLD = 1.0
/** reveal 자동 전진 이징(컨트롤러가 참조). */
export const TIME_EASE = [0.65, 0, 0.35, 1] as const

/* reveal 구간 매핑(겹침이 핵심). */
const TEXT_SPLIT_RANGE: [number, number] = [0, 0.6] // 텍스트가 위/아래로 벌어지는 구간
const TEXT_FADE_RANGE: [number, number] = [0.35, 0.75] // 텍스트가 사라지는 구간(늦게 시작)
// reveal 구간: 확대 시작 · 오버슈트 피크 · 안착
const SLIDE_SCALE_IN: number[] = [0.25, 0.78, 0.9]
// scale: 0 → 살짝 넘김(1.045) → 1.0 안착
const SLIDE_SCALE_OUT: number[] = [0, 1.045, 1.0]

/* 후속 슬라이드: 첫 장 제외한 N-1개를 [REVEAL_END, 1]에 균등 분할해 스크롤
   연속 상승(데드존 제거). 슬라이드 개수가 바뀌면 자동으로 재분할된다. */
const FOLLOW = PORTFOLIO_PROJECTS.length - 1
const RISE_BANDS: [number, number][] = Array.from({ length: FOLLOW }, (_, i) => {
  const span = (1 - REVEAL_END) / FOLLOW
  return [REVEAL_END + i * span, REVEAL_END + (i + 1) * span]
})

interface PortfolioSectionProps {
  active: boolean
  progress: MotionValue<number>
}

export function PortfolioSection({ active, progress }: PortfolioSectionProps) {
  const frame = useFrameSize()
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // reveal을 trap progress로 직접 구동(0→REVEAL_END에서 0→1). 정/역/재진입 모두
  // progress만 따르므로 클럭/히스테리시스가 불필요.
  const reveal01 = useTransform(progress, [0, REVEAL_END], [0, 1], { clamp: true })

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

          <PortfolioText reveal={reveal01} ratio={ratio} frameH={frame.h} />

          {/* 첫 슬라이드: reveal 클럭으로 중앙 확대(텍스트와 겹침). */}
          <PortfolioScaleSlide
            project={PORTFOLIO_PROJECTS[0]}
            index={0}
            total={PORTFOLIO_PROJECTS.length}
            ratio={ratio}
            z={10}
            reveal={reveal01}
          />

          {/* 후속 슬라이드: 스크롤 연속 상승. */}
          {PORTFOLIO_PROJECTS.slice(1).map((p, i) => (
            <PortfolioRiseSlide
              key={p.image}
              project={p}
              index={i + 1}
              total={PORTFOLIO_PROJECTS.length}
              ratio={ratio}
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

/** 슬라이드 한 장의 내용물: 배경 이미지 + 검정 dim + 텍스트 오버레이
    (브랜드/프로젝트/설명) + 우상단 로고 + 좌하단 Our Portfolio/페이지네이션.
    모든 design px는 PortfolioText와 동일하게 ratio로 스케일. */
function PortfolioSlideContent({
  project,
  index,
  total,
  ratio,
}: {
  project: PortfolioProject
  index: number
  total: number
  ratio: number
}) {
  return (
    <div className="absolute inset-0">
      {/* 배경 이미지 */}
      <img
        src={project.image}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* 검정 dim */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 콘텐츠 */}
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{
          paddingTop: 100 * ratio,
          paddingRight: 64 * ratio,
          paddingBottom: 72 * ratio,
          paddingLeft: 64 * ratio,
        }}
      >
        {/* 상단: 브랜드 / 프로젝트 / 설명 + 우상단 로고 */}
        <div className="relative">
          <img
            src={project.logo}
            alt={project.brand}
            draggable={false}
            className="absolute top-0 right-0 w-auto"
            style={{ height: 28 * ratio }}
          />
          <p
            style={{
              fontFamily: 'var(--font-pretendard)',
              fontSize: 24 * ratio,
              fontWeight: 400,
              lineHeight: 1.5,
              color: '#ffffff',
            }}
          >
            {project.brand}
          </p>
          <h3
            style={{
              fontFamily: 'var(--font-pretendard)',
              fontSize: 56 * ratio,
              fontWeight: 700,
              lineHeight: 1.4,
              color: '#ffffff',
              marginTop: 24 * ratio,
            }}
          >
            {project.project}
          </h3>
          <p
            className="whitespace-pre-line"
            style={{
              fontFamily: 'var(--font-pretendard)',
              fontSize: 24 * ratio,
              fontWeight: 400,
              lineHeight: 1.5,
              color: '#ffffff',
              marginTop: 24 * ratio,
              maxWidth: 720 * ratio,
            }}
          >
            {project.desc}
          </p>
        </div>

        {/* 하단: Our Portfolio + 페이지네이션 */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 20 * ratio,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#ffffff',
            }}
          >
            Our Portfolio
          </p>
          <div className="flex" style={{ gap: 20 * ratio, marginTop: 8 * ratio }}>
            {Array.from({ length: total }, (_, i) => {
              const current = i === index
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: 20 * ratio,
                    lineHeight: 1.4,
                    letterSpacing: '-0.04em',
                    fontWeight: current ? 700 : 400,
                    color: current ? '#ffffff' : '#d4d4d4',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 첫 슬라이드: reveal 구간에서 중앙 scale 0→1.045→1.0(살짝 부풀었다 톡 안착). */
function PortfolioScaleSlide({
  project,
  index,
  total,
  ratio,
  z,
  reveal,
}: {
  project: PortfolioProject
  index: number
  total: number
  ratio: number
  z: number
  reveal: MotionValue<number>
}) {
  const scale = useTransform(reveal, SLIDE_SCALE_IN, SLIDE_SCALE_OUT, {
    clamp: true,
  })
  return (
    <motion.div
      className="absolute inset-0"
      style={{ scale, zIndex: z }}
    >
      <PortfolioSlideContent
        project={project}
        index={index}
        total={total}
        ratio={ratio}
      />
    </motion.div>
  )
}

/** 후속 슬라이드: 자기 band 구간에서 아래(100%)→0으로 스크롤 연속 상승. */
function PortfolioRiseSlide({
  project,
  index,
  total,
  ratio,
  band,
  z,
  progress,
}: {
  project: PortfolioProject
  index: number
  total: number
  ratio: number
  band: [number, number]
  z: number
  progress: MotionValue<number>
}) {
  const y = useTransform(progress, band, ['100%', '0%'], { clamp: true })
  return (
    <motion.div className="absolute inset-0" style={{ y, zIndex: z }}>
      <PortfolioSlideContent
        project={project}
        index={index}
        total={total}
        ratio={ratio}
      />
    </motion.div>
  )
}
