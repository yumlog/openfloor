import { useEffect, useState, type CSSProperties } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { SLIDES, DESIGN_WIDTH } from '@/config/slides'
import { useFrameSize } from '@/hooks/useFrameSize'

const def = SLIDES[1]

const INTRO_DELAY = 0.5

const HEADLINE_LINES = [
  '닫힌 공간에서는 만들어질 수 없는 것이 있는데,',
  '그것이 바로 시너지입니다.',
]

const INTRO =
  '우리는 개인의 역량 자체보다, 서로의 역량이 연결되는 방식에 집중합니다.\n개인의 역량을 팀의 실행력으로 전환하기 위한 구조.\nOPENFLOOR는 그 구조를 만듭니다.'

interface CardDef {
  img: string
  /** 이미지 실제 크기(영역 아님). iw/ih=모바일 썸네일 기준, dw/dh=데스크탑 표시 크기. */
  iw: number
  ih: number
  dw: number
  dh: number
  num: string
  title: string
}

const CARDS: CardDef[] = [
  {
    img: '/images/sample-1.png',
    iw: 182,
    ih: 180,
    dw: 140,
    dh: 140,
    num: '+6',
    title: '년간 파트너십',
  },
  {
    img: '/images/sample-2.png',
    iw: 163,
    ih: 140,
    dw: 140,
    dh: 120,
    num: '100%',
    title: '풀사이클 수행',
  },
  {
    img: '/images/sample-3.png',
    iw: 188,
    ih: 120,
    dw: 188,
    dh: 120,
    num: '5',
    title: '자체 R&D 솔루션',
  },
]

/* ── 카드 포커스 인터랙션 ──────────────────────────────────────────────
   기본(compact): 타이틀 좌상단 + 아이콘이 이미지영역(276) 중앙.
   진입 시 한 장씩 scanning(가로로 커짐 663:304)으로 포커스되고, 포커스가 다음으로
   넘어가면 직전 카드는 revealed(아이콘이 위 이미지영역(206)으로 + 타이틀·숫자 하단)
   로 정착. 3장 끝나면 전부 revealed(3등분), 이후 호버하면 focus(= 커짐).
   ※ 카드 움직임의 빨간선(테두리)·빨간 그림자(글로우)·이징(EASE)은 그대로 유지. */
type Variant = 'compact' | 'scanning' | 'revealed' | 'focus'

const EASE = 'cubic-bezier(0.77,0,0.175,1)'
const TRANS = `all 0.6s ${EASE}`
const GLOW = '0 14px 46px -12px rgba(251,54,64,0.42)' // 빨간 그림자(유지)
const ACCENT_LINE = 'rgba(251,54,64,0.55)' // 빨간선(유지)
const CARD_BG = 'rgba(255,255,255,0.06)'

// 디자인 기준 px(1440). 카드 높이는 두 상태(header/stat)가 같은 ~402px가 되도록 구성.
const CARD_H = 402

interface AboutSectionProps {
  /** About이 활성 슬라이드인 동안 true — reveal + 카드 포커스 시퀀스를 구동. */
  active: boolean
}

export function AboutSection({ active }: AboutSectionProps) {
  return (
    <section
      id={def.id}
      className="relative flex h-dvh w-full flex-col justify-between overflow-hidden"
    >
      <Container className="pt-[clamp(57px,6.94vw,100px)] max-md:pt-22">
        <motion.p
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(0)}
          className="text-accent text-[clamp(12px,1.39vw,20px)] leading-[1.4] font-bold tracking-[-0.04em] max-md:text-[14px]"
        >
          ABOUT US
        </motion.p>

        <RevealText
          as="h2"
          active={active}
          lines={HEADLINE_LINES}
          className="text-title-on-dark my-[clamp(12px,1.11vw,16px)] text-[clamp(26px,3.06vw,44px)] leading-normal font-bold tracking-[-0.02em] break-keep max-md:text-[20px] max-md:tracking-[-0.015em]"
        />

        <motion.p
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(INTRO_DELAY)}
          className="text-text-on-dark text-[clamp(12px,1.11vw,16px)] leading-[1.6] font-normal whitespace-pre-line max-md:text-[12px] max-md:text-pretty max-md:break-keep max-md:whitespace-normal"
        >
          {INTRO}
        </motion.p>
      </Container>

      <Container className="pb-[clamp(57px,6.94vw,100px)] max-md:pb-12">
        {/* 데스크탑: 인터랙티브 카드 */}
        <div className="max-md:hidden">
          <AboutCards active={active} />
        </div>
        {/* 모바일: 정적 스택 */}
        <MobileAboutCards active={active} />
      </Container>
    </section>
  )
}

function AboutCards({ active }: { active: boolean }) {
  const frame = useFrameSize()
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  const [phases, setPhases] = useState<Variant[]>([
    'compact',
    'compact',
    'compact',
  ])
  const [seqDone, setSeqDone] = useState(false)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    if (!active) {
      setPhases(['compact', 'compact', 'compact'])
      setSeqDone(false)
      setHover(null)
      return
    }
    setPhases(['compact', 'compact', 'compact'])
    setSeqDone(false)
    setHover(null)
    const t: number[] = []
    t.push(
      window.setTimeout(
        () => setPhases(['scanning', 'compact', 'compact']),
        450
      )
    )
    t.push(
      window.setTimeout(
        () => setPhases(['revealed', 'scanning', 'compact']),
        1650
      )
    )
    t.push(
      window.setTimeout(
        () => setPhases(['revealed', 'revealed', 'scanning']),
        2850
      )
    )
    t.push(
      window.setTimeout(() => {
        setPhases(['revealed', 'revealed', 'revealed'])
        setSeqDone(true)
      }, 4050)
    )
    return () => t.forEach(clearTimeout)
  }, [active])

  const variantOf = (i: number): Variant =>
    seqDone && hover === i ? 'focus' : phases[i]

  const variants = CARDS.map((_, i) => variantOf(i))
  const anyEnlarged = variants.some((v) => v === 'scanning' || v === 'focus')

  return (
    <div
      className="flex items-stretch"
      style={{ gap: 20 * ratio }}
      onMouseLeave={() => setHover(null)}
    >
      {CARDS.map((card, i) => {
        const v = variants[i]
        const enlarged = v === 'scanning' || v === 'focus'
        // 작은 304 : 큰 663. 비활성(3등분)도 같은 grow 합(1271)을 유지하도록 평균값을 써야
        // 첫 카드 확대가 나머지 전환과 동일한 속도가 된다(합이 3→1271로 변하면 폭 보간이
        // 앞쪽으로 쏠려 첫 카드만 가파르게 보임).
        const grow = anyEnlarged
          ? enlarged
            ? 663
            : 304
          : (663 + 304 + 304) / 3
        return (
          <AboutCard
            key={card.title}
            card={card}
            variant={v}
            grow={grow}
            ratio={ratio}
            active={active}
            onEnter={() => seqDone && setHover(i)}
          />
        )
      })}
    </div>
  )
}

interface AboutCardProps {
  card: CardDef
  variant: Variant
  grow: number
  ratio: number
  active: boolean
  onEnter: () => void
}

function AboutCard({
  card,
  variant,
  grow,
  ratio,
  active,
  onEnter,
}: AboutCardProps) {
  const px = (n: number) => n * ratio
  const isStat = variant === 'revealed'
  const isEnlarged = variant === 'scanning' || variant === 'focus'

  const cardStyle: CSSProperties = {
    flexGrow: grow,
    flexBasis: 0,
    minWidth: 0,
    height: px(CARD_H),
    background: CARD_BG,
    borderRadius: px(32),
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: isEnlarged ? ACCENT_LINE : 'transparent', // 빨간선
    boxShadow: isEnlarged ? GLOW : 'none', // 빨간 그림자
    transform: isEnlarged ? 'translateY(-6px)' : 'translateY(0)',
    transition: TRANS,
    willChange: 'flex-grow, transform',
  }

  // 아이콘 중앙 y: header 모드는 이미지영역(276) 중앙(=232), stat 모드는 영역(206) 중앙(=135).
  const iconStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: isStat ? px(135) : px(232),
    transform: 'translate(-50%,-50%)',
    width: px(card.dw),
    height: px(card.dh),
    pointerEvents: 'none',
    transition: TRANS,
  }

  // 타이틀: header(24/700/-2%, 좌상단 top32) ↔ stat(20/400/-4%, 하단 top262)
  const titleStyle: CSSProperties = {
    position: 'absolute',
    left: px(40),
    top: isStat ? px(262) : px(32),
    fontSize: px(isStat ? 20 : 24),
    fontWeight: isStat ? 400 : 700,
    lineHeight: 1.4,
    letterSpacing: isStat ? '-0.04em' : '-0.02em',
    color: '#fff',
    whiteSpace: 'nowrap',
    transition: TRANS,
  }

  // 숫자: 60/700/120%, 타이틀 아래 top298. header에선 숨김.
  const numStyle: CSSProperties = {
    position: 'absolute',
    left: px(40),
    top: px(298),
    fontSize: px(60),
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#fff',
    opacity: isStat ? 1 : 0,
    transition: TRANS,
  }

  return (
    <div onMouseEnter={onEnter} style={cardStyle} className="relative">
      <div style={iconStyle}>
        <img
          src={card.img}
          alt={card.title}
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      <span className="font-pretendard" style={titleStyle}>
        {card.title}
      </span>
      <CountUpNumber
        raw={card.num}
        show={isStat}
        active={active}
        style={numStyle}
        className="font-num tabular-nums"
      />
    </div>
  )
}

/** 'num' 문자열을 접두/숫자/접미로 분해('+6'→{+,6,''}, '100%'→{'',100,%}). */
function parseNum(raw: string) {
  const m = raw.match(/^(\D*)(\d+)(\D*)$/)
  return {
    prefix: m?.[1] ?? '',
    target: m ? parseInt(m[2], 10) : 0,
    suffix: m?.[3] ?? '',
  }
}

/** 숫자 카운트업 — revealed로 나타날 때 0→목표(접두/접미 보존). 비활성 시 0으로 리셋해
    재진입 때 다시 카운트. 호버로 다시 보일 땐 이미 목표값이라 재카운트되지 않는다. */
function CountUpNumber({
  raw,
  show,
  active,
  style,
  className,
}: {
  raw: string
  show: boolean
  active: boolean
  style: CSSProperties
  className?: string
}) {
  const { prefix, target, suffix } = parseNum(raw)
  const mv = useMotionValue(0)
  // 큰 수는 단위를 키워 점프(3자리=10단위, 1~2자리=1단위) → 같은 시간 안에서 100도
  // 블러가 아니라 0·10·20…100으로 '확확' 오른다. 작은 수는 1단위로 또박또박.
  const step = Math.max(1, 10 ** (String(target).length - 2))
  const text = useTransform(
    mv,
    (v) => `${prefix}${Math.round(v / step) * step}${suffix}`
  )

  useEffect(() => {
    if (!active) mv.set(0)
  }, [active, mv])

  useEffect(() => {
    if (!show) return
    const controls = animate(mv, target, { duration: 0.6, ease: 'linear' })
    return () => controls.stop()
  }, [show, target, mv])

  return (
    <motion.span style={style} className={className}>
      {text}
    </motion.span>
  )
}

/** 모바일 정적 스택 — 가로 레이아웃(왼쪽 타이틀·숫자, 오른쪽 이미지)로 높이를 줄인다.
    진입(active)마다 화면 밖에서 좌/우 번갈아 슬라이드 인 + 페이드(1번 왼쪽→, 2번
    오른쪽←, 3번 왼쪽→). 섹션이 overflow-hidden이라 밖은 잘린다. */
function MobileAboutCards({ active }: { active: boolean }) {
  return (
    <div className="hidden flex-col gap-[13px] max-md:flex">
      {CARDS.map((card, i) => {
        const offset = i % 2 === 0 ? '-110%' : '110%'
        return (
          <motion.div
            key={card.title}
            initial={{ x: offset, opacity: 0 }}
            animate={
              active ? { x: '0%', opacity: 1 } : { x: offset, opacity: 0 }
            }
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: active ? 0.1 + i * 0.12 : 0,
            }}
            className="flex items-center justify-between gap-4 rounded-[16px] bg-white/6 px-[20px] py-[16px]"
          >
            <div className="min-w-0">
              <p className="text-[13px] leading-[1.4] font-normal tracking-[-0.04em] text-white">
                {card.title}
              </p>
              <p className="font-num mt-1 text-[29px] leading-[1.2] font-bold text-white tabular-nums">
                {card.num}
              </p>
            </div>
            <img
              src={card.img}
              alt={card.title}
              draggable={false}
              style={{ width: card.iw * 0.365, height: card.ih * 0.365 }}
              className="shrink-0 object-contain"
            />
          </motion.div>
        )
      })}
    </div>
  )
}
