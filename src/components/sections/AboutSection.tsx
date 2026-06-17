import { Fragment, useEffect, useRef } from 'react'
import { animate, motion, type Variants } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { SLIDES } from '@/config/slides'

const def = SLIDES[1]

/* 진입 애니메이션 타이밍. 상단 블록이 먼저; 통계 행은 세 컬럼을 좌 -> 우로
   캐스케이드하고, 각 컬럼 안에선 라벨 -> 숫자 -> 캡션 순. */
const INTRO_DELAY = 0.5
// 카운트업은 매 프레임 setState로 리렌더하므로, 슬라이드 스냅(~1.05s)이 끝난
// 정적 상태에서 시작하도록 지연을 둬 전환 프레임과 겹쳐 튀지 않게 한다.
const STATS_BASE_DELAY = 0.9
const STATS_STAGGER = 0.12
/** 통계 컬럼 `i`의 시작 지연(좌 -> 우 캐스케이드). */
const columnDelay = (i: number) => STATS_BASE_DELAY + i * STATS_STAGGER

/** 구분선이 컬럼과 함께 중심에서 바깥으로 자란다(scaleY). */
const GROW: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: { scaleY: 1, opacity: 1 },
}

// 헤드라인 — reveal sweep이 고르도록 미리 분할(각 줄은 한 줄에 들어가야 함;
// 마스크는 줄 박스 단위로 크기가 정해진다).
const HEADLINE_LINES = [
  '닫힌 공간에서는 만들어질 수 없는 것이',
  '있는데, 그것이 바로 시너지입니다.',
]

const INTRO =
  '우리는 개인의 역량보다, 서로의 역량이 연결되는 구조를 더 중요하게 생각합니다.\nAI 시대에는 개인 생산성보다 컨텍스트 공유, 의사결정 연결, 구조적 협업이 더 중요해집니다.\nOpenfloor는 그 구조를 만드는 회사입니다.'

interface StatDef {
  label: string
  target: number
  suffix: string
  caption: string
}

const STATS: StatDef[] = [
  { label: 'Partners', target: 6, suffix: '+', caption: '년간 파트너십' },
  {
    label: 'Full-Cycle Execution',
    target: 100,
    suffix: '%',
    caption: '풀사이클 수행',
  },
  {
    label: 'In-House R&D Solutions',
    target: 5,
    suffix: '',
    caption: '자체 R&D 솔루션',
  },
]

interface AboutSectionProps {
  /** About이 활성 슬라이드인 동안 true — reveal + 카운트업 재생을 구동. */
  active: boolean
}

/**
 * 슬라이드 1, 다크. 중앙 비디오의 about 상태가 우상단(배경 레이어)에 있어,
 * 좌측 정렬·미리 줄바꿈된 콘텐츠가 너비 제한 없이 그것을 피한다. 상단 블록은
 * 슬라이드 위에서 124px(내비 포함); 3열 통계 행은 아래에서 124px. reveal +
 * 카운트업은 `active`로 진입할 때마다 다시 재생된다.
 */
export function AboutSection({ active }: AboutSectionProps) {
  return (
    <section
      id={def.id}
      className="relative flex h-dvh w-full flex-col justify-between overflow-hidden"
    >
      {/* 상단 블록(좌). 내비 포함 슬라이드 위에서 124px.
          라벨이 먼저, 헤드라인 reveal, 소개문이 뒤따른다. */}
      <Container className="pt-[clamp(71px,8.61vw,124px)] max-md:pt-22">
        <motion.p
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(0)}
          className="text-accent text-[clamp(12px,1.39vw,20px)] leading-[1.4] font-bold tracking-[-0.04em] max-md:text-[15px]"
        >
          ABOUT US
        </motion.p>

        <RevealText
          as="h2"
          active={active}
          lines={HEADLINE_LINES}
          className="text-title-on-dark my-[clamp(12px,1.11vw,16px)] text-[clamp(26px,3.06vw,44px)] leading-normal font-bold tracking-normal max-md:text-[22px]"
        />

        <motion.p
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(INTRO_DELAY)}
          className="text-text-on-dark text-[clamp(12px,1.11vw,16px)] leading-normal font-normal whitespace-pre-line max-md:text-[14px]"
        >
          {INTRO}
        </motion.p>
      </Container>

      {/* 통계 행(하단). 슬라이드 아래에서 124px; 전체 프레임을 차지하는 동일
          너비(flex-1) 좌측 정렬 3컬럼, 양쪽 130px 간격의 1px 세로선으로 구분.
          모바일: 세로로 쌓고 세로선 제거. */}
      <Container className="pb-[clamp(71px,8.61vw,124px)] max-md:pb-12">
        <div className="flex items-start gap-[clamp(74px,9.03vw,130px)] max-md:flex-col max-md:gap-4">
          {STATS.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 && (
                <motion.div
                  aria-hidden
                  variants={GROW}
                  initial="hidden"
                  animate={active ? 'show' : 'hidden'}
                  transition={entryTransition(columnDelay(i))}
                  className="bg-text-on-dark/50 h-[clamp(108px,13.19vw,190px)] w-px shrink-0 origin-center max-md:hidden"
                />
              )}
              <StatItem stat={stat} active={active} index={i} />
            </Fragment>
          ))}
        </div>
      </Container>
    </section>
  )
}

interface StatItemProps {
  stat: StatDef
  active: boolean
  /** 컬럼 위치 — 좌 -> 우 캐스케이드 지연을 구동. */
  index: number
}

function StatItem({ stat, active, index }: StatItemProps) {
  const base = columnDelay(index)
  // 카운트업을 DOM ref에 직접 써 React 리렌더를 없앤다 — 매 프레임 setState가
  // 크리스탈 frameloop 재개와 부딪히지 않도록. 숫자는 컬럼에 맞춰 등장.
  const numRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = numRef.current
    if (!el) return
    if (!active) {
      el.textContent = '0'
      return
    }
    const controls = animate(0, stat.target, {
      duration: 1.3,
      delay: base + 0.05,
      ease: 'easeOut',
      onUpdate: (v) => {
        el.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [active, stat.target, base])

  return (
    <div className="flex flex-col items-start md:min-w-0 md:flex-1">
      <span className="font-num text-title-on-dark text-[80px] leading-[1.2] font-bold tracking-normal tabular-nums max-md:text-[32px]">
        <span ref={numRef}>0</span>
        {stat.suffix}
      </span>
      <motion.span
        variants={RISE}
        initial="hidden"
        animate={active ? 'show' : 'hidden'}
        transition={entryTransition(base)}
        className="text-title-on-dark mt-4 text-[20px] leading-[1.4] font-normal tracking-[-0.04em] max-md:mt-2 max-md:text-[16px]"
      >
        {stat.label}
      </motion.span>
      <motion.span
        variants={RISE}
        initial="hidden"
        animate={active ? 'show' : 'hidden'}
        transition={entryTransition(base + 0.12)}
        className="text-text-on-dark mt-1 text-[16px] leading-[1.4] font-normal tracking-[-0.04em] max-md:text-[14px]"
      >
        {stat.caption}
      </motion.span>
    </div>
  )
}
