import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { SLIDES } from '@/config/slides'

const def = SLIDES[1]

const INTRO_DELAY = 0.5

const HEADLINE_LINES = [
  '닫힌 공간에서는 만들어질 수 없는 것이 있는데,',
  '그것이 바로 시너지입니다.',
]

const INTRO =
  '우리는 개인의 역량 자체보다, 서로의 역량이 연결되는 방식에 집중합니다.\n개인의 역량을 팀의 실행력으로 전환하기 위한 구조.\nOPENFLOOR는 그 구조를 만듭니다.'

interface CardDef {
  /** public/images 의 아이콘 그래픽. */
  img: string
  num: string
  title: string
  desc: string
}

const CARDS: CardDef[] = [
  {
    img: '/images/sample-1.png',
    num: '6+',
    title: '년간 파트너십',
    desc: 'Partners',
  },
  {
    img: '/images/sample-2.png',
    num: '100%',
    title: '풀사이클 수행',
    desc: 'Full-Cycle Execution',
  },
  {
    img: '/images/sample-3.png',
    num: '5',
    title: '자체 R&D 솔루션',
    desc: 'In-House R&D Solutions',
  },
]

/* ── 카드 포커스 인터랙션 ──────────────────────────────────────────────
   디폴트(compact): 아이콘 중앙, 작은 타이틀 좌상단.
   진입 시 자동으로 한 장씩 scanning(확대·아이콘 중앙 크게)으로 포커스되고,
   포커스가 다음으로 넘어가면 직전 카드는 revealed(아이콘 우상단 + 숫자·타이틀·
   설명 좌하단)로 정착. 3번까지 끝나면 전부 revealed로 남고, 이후 호버하면 해당
   카드가 focus(= 확대된 revealed)된다. (참조 이미지의 스캔 UI 모션을 따른다) */
type Variant = 'compact' | 'scanning' | 'revealed' | 'focus'

const EASE = 'cubic-bezier(0.77,0,0.175,1)'
const TRANS = `all 0.6s ${EASE}`
const GLOW = '0 14px 46px -12px rgba(251,54,64,0.42)'

// 카드 컨테이너 — flex-grow(가로 비중)·들림·테두리·배경·그림자.
const CARD_V: Record<Variant, CSSProperties> = {
  compact: { flexGrow: 1, transform: 'translateY(0)', borderColor: '#262626', background: '#1e1e1e', boxShadow: 'none' },
  scanning: { flexGrow: 2.4, transform: 'translateY(-6px)', borderColor: 'rgba(251,54,64,0.55)', background: '#242424', boxShadow: GLOW },
  revealed: { flexGrow: 1, transform: 'translateY(0)', borderColor: '#333333', background: '#1e1e1e', boxShadow: 'none' },
  focus: { flexGrow: 2.0, transform: 'translateY(-6px)', borderColor: 'rgba(251,54,64,0.55)', background: '#242424', boxShadow: GLOW },
}

// 아이콘 — 중앙(compact/scanning) ↔ 우상단(revealed/focus). left/top/transform/폭을
// 보간해 미끄러지듯 이동. calc(100% - …)로 우측 정렬해도 transition이 끊기지 않게.
const IMG_V: Record<Variant, CSSProperties> = {
  compact: { left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 96 },
  scanning: { left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 148 },
  revealed: { left: 'calc(100% - 22px)', top: '22px', transform: 'translate(-100%,0)', width: 58 },
  focus: { left: 'calc(100% - 24px)', top: '24px', transform: 'translate(-100%,0)', width: 74 },
}

const NUM_V: Record<Variant, CSSProperties> = {
  compact: { opacity: 0, fontSize: 36 },
  scanning: { opacity: 0, fontSize: 36 },
  revealed: { opacity: 1, fontSize: 36 },
  focus: { opacity: 1, fontSize: 44 },
}

// 타이틀 — compact/scanning은 좌상단(작게/희미→크게/흰색), revealed/focus는
// 좌하단으로 내려가 더 크게.
const TITLE_V: Record<Variant, CSSProperties> = {
  compact: { top: '20px', fontSize: 13, color: '#a3a3a3' },
  scanning: { top: '20px', fontSize: 18, color: '#fff' },
  revealed: { top: 'calc(100% - 76px)', fontSize: 20, color: '#fff' },
  focus: { top: 'calc(100% - 82px)', fontSize: 23, color: '#fff' },
}

const DESC_HIDDEN: CSSProperties = { opacity: 0 }
const DESC_SHOWN: CSSProperties = { opacity: 1 }

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
      <Container className="pt-[clamp(71px,8.61vw,124px)] max-md:pt-22">
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

      <Container className="pb-[clamp(71px,8.61vw,124px)] max-md:pb-12">
        <AboutCards active={active} />
      </Container>
    </section>
  )
}

function AboutCards({ active }: { active: boolean }) {
  const [phases, setPhases] = useState<Variant[]>(['compact', 'compact', 'compact'])
  const [seqDone, setSeqDone] = useState(false)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    if (!active) {
      setPhases(['compact', 'compact', 'compact'])
      setSeqDone(false)
      setHover(null)
      return
    }
    // 모바일(호버 없음)에선 시퀀스 없이 전부 revealed로 정적 표시.
    if (window.matchMedia('(max-width: 767px)').matches) {
      setPhases(['revealed', 'revealed', 'revealed'])
      setSeqDone(false)
      setHover(null)
      return
    }
    setPhases(['compact', 'compact', 'compact'])
    setSeqDone(false)
    setHover(null)
    const t: number[] = []
    t.push(window.setTimeout(() => setPhases(['scanning', 'compact', 'compact']), 450))
    t.push(window.setTimeout(() => setPhases(['revealed', 'scanning', 'compact']), 1650))
    t.push(window.setTimeout(() => setPhases(['revealed', 'revealed', 'scanning']), 2850))
    t.push(
      window.setTimeout(() => {
        setPhases(['revealed', 'revealed', 'revealed'])
        setSeqDone(true)
      }, 4050),
    )
    return () => t.forEach(clearTimeout)
  }, [active])

  const variantOf = (i: number): Variant =>
    seqDone && hover === i ? 'focus' : phases[i]

  return (
    <div
      className="flex items-stretch gap-[14px] max-md:flex-col max-md:gap-3"
      onMouseLeave={() => setHover(null)}
    >
      {CARDS.map((card, i) => (
        <AboutCard
          key={card.title}
          card={card}
          variant={variantOf(i)}
          onEnter={() => seqDone && setHover(i)}
        />
      ))}
    </div>
  )
}

interface AboutCardProps {
  card: CardDef
  variant: Variant
  onEnter: () => void
}

function AboutCard({ card, variant, onEnter }: AboutCardProps) {
  const showDesc = variant === 'revealed' || variant === 'focus'
  return (
    <div
      onMouseEnter={onEnter}
      style={{
        ...CARD_V[variant],
        flexBasis: 0,
        transition: TRANS,
        willChange: 'flex-grow, transform',
      }}
      className="relative h-[clamp(220px,26vw,300px)] shrink overflow-hidden rounded-2xl border max-md:h-[176px] max-md:flex-none"
    >
      <img
        src={card.img}
        alt={card.title}
        draggable={false}
        style={{ position: 'absolute', height: 'auto', objectFit: 'contain', pointerEvents: 'none', transition: TRANS, ...IMG_V[variant] }}
      />
      <span
        className="font-num text-accent absolute left-[22px] leading-none font-extrabold tracking-[-0.02em] tabular-nums"
        style={{ top: 'calc(100% - 116px)', transition: TRANS, ...NUM_V[variant] }}
      >
        {card.num}
      </span>
      <span
        className="absolute left-[22px] font-semibold tracking-[-0.03em] whitespace-nowrap"
        style={{ transition: TRANS, ...TITLE_V[variant] }}
      >
        {card.title}
      </span>
      <span
        className="text-text-on-dark absolute right-[18px] left-[22px] text-[12.5px] leading-[1.45] tracking-[-0.02em] break-keep"
        style={{ top: 'calc(100% - 44px)', transition: TRANS, ...(showDesc ? DESC_SHOWN : DESC_HIDDEN) }}
      >
        {card.desc}
      </span>
    </div>
  )
}
