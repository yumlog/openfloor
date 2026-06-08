import { Fragment } from 'react'
import { motion, type Variants } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { useCountUp } from '@/hooks/useCountUp'
import { RISE, entryTransition } from '@/lib/motion'
import { SLIDES } from '@/config/slides'

const def = SLIDES[1]

/* Entry-animation timing. The top block leads; the stat row cascades the three
   columns left -> right, and inside each column label -> number -> caption. */
const INTRO_DELAY = 0.5
const STATS_BASE_DELAY = 0.35
const STATS_STAGGER = 0.12
/** Start delay for stat column `i` (left -> right cascade). */
const columnDelay = (i: number) => STATS_BASE_DELAY + i * STATS_STAGGER

/** Divider grows in (scaleY) outward from its center alongside its column. */
const GROW: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: { scaleY: 1, opacity: 1 },
}

// Headline — pre-split so the reveal sweep stays even (each line must fit on
// one line; the mask is sized per line box).
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
  /** True while About is the active slide — drives reveal + count-up replay. */
  active: boolean
}

/**
 * Slide 1, dark. The central video's about-state sits in the upper-right
 * (background layer), so the left-aligned, pre-broken content clears it without
 * needing a width cap. Top block sits 124px from the slide top (nav included);
 * the three-up stat row sits 124px from the bottom. Reveal + count-up replay on
 * every entry via `active`.
 */
export function AboutSection({ active }: AboutSectionProps) {
  return (
    <section
      id={def.id}
      className="relative flex h-[100dvh] w-full flex-col justify-between overflow-hidden"
    >
      {/* Top block (left). 124px from the slide top, including the nav.
          Label leads, headline reveals, intro follows. */}
      <Container className="pt-[clamp(71px,8.61vw,124px)] max-md:pt-[88px]">
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
          className="text-title-on-dark my-[clamp(12px,1.11vw,16px)] text-[clamp(26px,3.06vw,44px)] leading-[1.5] font-bold tracking-normal max-md:text-[22px]"
        />

        <motion.p
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(INTRO_DELAY)}
          className="text-text-on-dark text-[clamp(12px,1.11vw,16px)] leading-[1.5] font-normal whitespace-pre-line max-md:text-[14px]"
        >
          {INTRO}
        </motion.p>
      </Container>

      {/* Stat row (bottom). 124px from the slide bottom; three equal-width
          (flex-1) left-aligned columns spanning the full frame, separated by 1px
          verticals with 130px clearance each side. Mobile: stack vertically,
          drop the verticals. */}
      <Container className="pb-[clamp(71px,8.61vw,124px)] max-md:pb-[48px]">
        <div className="flex items-start gap-[clamp(74px,9.03vw,130px)] max-md:flex-col max-md:gap-6">
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
  /** Column position — drives the left -> right cascade delay. */
  index: number
}

function StatItem({ stat, active, index }: StatItemProps) {
  const base = columnDelay(index)
  // Number falls in line with its column; label leads it, caption trails.
  const value = useCountUp(stat.target, active, base + 0.05)

  return (
    <div className="flex flex-col items-start md:min-w-0 md:flex-1">
      <motion.span
        variants={RISE}
        initial="hidden"
        animate={active ? 'show' : 'hidden'}
        transition={entryTransition(base)}
        className="text-accent/80 text-[clamp(12px,1.11vw,16px)] leading-[1.4] font-medium tracking-[-0.04em] max-md:text-[14px]"
      >
        {stat.label}
      </motion.span>
      <span className="font-num text-title-on-dark mt-[clamp(12px,1.39vw,20px)] mb-[clamp(12px,1.11vw,16px)] text-[clamp(46px,5.56vw,80px)] leading-[1.2] font-bold tracking-normal tabular-nums max-md:my-2 max-md:text-[40px]">
        {value}
        {stat.suffix}
      </span>
      <motion.span
        variants={RISE}
        initial="hidden"
        animate={active ? 'show' : 'hidden'}
        transition={entryTransition(base + 0.12)}
        className="text-title-on-dark text-[clamp(16px,1.94vw,28px)] leading-[1.4] font-medium tracking-[-0.04em] max-md:text-[20px]"
      >
        {stat.caption}
      </motion.span>
    </div>
  )
}
