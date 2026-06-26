import { useEffect, useLayoutEffect, useRef, useState, type Ref } from 'react'
import { motion, type MotionValue } from 'motion/react'
import { PHILOSOPHY_CARDS, type PhilosophyCard } from './cards'

/* ---------------------------------------------------------------------------
   Philosophy 스택. 카드가 위로 순차로 쌓인다.
     진입(progress 0): 카드가 세로 리스트로 펼쳐짐 — 첫 카드가 보이고 나머지는
                       아래에 대기.
     스크롤: progress가 카드별 임계값(THRESHOLDS)을 "넘는 순간" 그 카드가 시간
             기반(easeOut)으로 끝까지 스륵 올라붙는다. 휠 양과 무관하게 항상 완전히
             안착(중간에 멈추지 않음). 임계값을 벌려놔 하나씩.
   데스크탑: 고정 카드 높이(CARD_H). 마지막(빨강) 카드가 다 쌓이면 PhilosophyGrow
   (포털)가 확대를 이어받는다(LAST_CARD_CENTER_FRAC export로 그 중심을 측정).
   모바일: 카드별 내용 높이를 실측해 가변 높이(여백 0) + spread 위치 계산. stacked
   겹침 OFFSET은 일정. 확대 핸드오프 없음.
   모든 값 design px; 부모 stage가 scale(ratio), origin top.
--------------------------------------------------------------------------- */

const CARD_W = 800
const CARD_H = 280
const GAP = 20
const STACK_OFFSET = 140
const N = PHILOSOPHY_CARDS.length
const ENTRY_OFFSET = 26

export const STACK_END = 0.55
const STACK_THRESHOLDS = [0, 0.18, 0.42]
const STAGE_H = STACK_OFFSET * (N - 1) + CARD_H // 560
export const LAST_CARD_CENTER_FRAC =
  (STACK_OFFSET * (N - 1) + CARD_H / 2) / STAGE_H // 0.75

interface Dims {
  CW: number
  CH: number
  OFFSET: number
  GAP: number
  THRESHOLDS: number[]
}
const DESKTOP: Dims = {
  CW: CARD_W,
  CH: CARD_H,
  OFFSET: STACK_OFFSET,
  GAP,
  THRESHOLDS: STACK_THRESHOLDS,
}
const MOBILE: Dims = {
  CW: 340,
  CH: 340,
  OFFSET: 70,
  GAP: 16,
  THRESHOLDS: [0, 0.34, 0.68],
}
/** 모바일 가변 높이 = 측정한 내용 높이 + 아래 여백(위 패딩과 대칭). */
const MOBILE_BOTTOM_PAD = 32

/** 카드 내용(번호/이름 + 본문). CardFace와 숨김 측정이 공유한다. */
function CardContent({
  card,
  compact,
}: {
  card: PhilosophyCard
  compact?: boolean
}) {
  return (
    <div className={compact ? 'px-7 pt-8' : 'px-10 pt-12'}>
      <div
        className={
          compact
            ? 'text-title-on-dark flex items-baseline gap-3 text-[20px] leading-[1.4] font-normal tracking-[-0.015em]'
            : 'text-title-on-dark flex items-baseline gap-4 text-[24px] leading-[1.4] font-normal tracking-[-0.015em]'
        }
      >
        <span>{card.num}</span>
        <span>{card.name}</span>
      </div>
      <p
        className={
          compact
            ? 'text-title-on-dark mt-10 text-[18px] leading-[1.6] font-bold break-keep whitespace-pre-line'
            : 'text-title-on-dark mt-18.5 text-[24px] leading-[1.6] font-bold tracking-[-0.015em] break-keep whitespace-pre-line'
        }
      >
        {card.body}
      </p>
    </div>
  )
}

/** 카드 비주얼(스택·확대 공용). */
export function CardFace({
  card,
  contentOpacity,
  compact = false,
}: {
  card: PhilosophyCard
  contentOpacity?: MotionValue<number>
  compact?: boolean
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl"
      style={{ backgroundColor: card.bg }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ opacity: contentOpacity ?? 1 }}
      >
        <img
          src="/images/card.svg"
          alt=""
          aria-hidden
          draggable={false}
          className={
            compact
              ? 'pointer-events-none absolute top-7 right-6 opacity-50'
              : 'pointer-events-none absolute top-12 right-10 opacity-50'
          }
          style={
            compact ? { width: 64, height: 44 } : { width: 100, height: 68 }
          }
        />
        <CardContent card={card} compact={compact} />
      </motion.div>
    </div>
  )
}

interface PhilosophyStackProps {
  active: boolean
  ratio: number
  progress: MotionValue<number>
  stageRef?: Ref<HTMLDivElement>
  isMobile?: boolean
}

export function PhilosophyStack({
  active,
  ratio,
  progress,
  stageRef,
  isMobile = false,
}: PhilosophyStackProps) {
  const d = isMobile ? MOBILE : DESKTOP

  // 모바일: 카드별 내용 높이 실측(폭 d.CW). 데스크탑은 측정 안 하고 고정 CH.
  const [heights, setHeights] = useState<number[] | null>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!isMobile) {
      setHeights(null)
      return
    }
    const measure = () => {
      const el = measureRef.current
      if (!el) return
      const hs = Array.from(el.children).map(
        (c) => (c as HTMLElement).offsetHeight + MOBILE_BOTTOM_PAD
      )
      if (hs.length === N) setHeights(hs)
    }
    measure()
    document.fonts?.ready.then(measure)
  }, [isMobile, d.CW])

  // 카드 높이/위치: stacked는 OFFSET 일정, spread는 가변 높이 누적.
  const ch = (i: number) => (heights ? heights[i] : d.CH) // 측정 전 fallback
  const stackedTop = (i: number) => i * d.OFFSET
  const spreadTop = (i: number) => {
    let t = 0
    for (let j = 0; j < i; j++) t += ch(j) + d.GAP
    return t
  }
  const stageH =
    isMobile && heights
      ? Math.max(...PHILOSOPHY_CARDS.map((_, i) => stackedTop(i) + ch(i)))
      : d.OFFSET * (N - 1) + d.CH

  return (
    <div
      ref={stageRef}
      className="relative shrink-0"
      style={{
        width: d.CW,
        height: stageH,
        transform: `scale(${ratio})`,
        transformOrigin: 'top',
      }}
    >
      {/* 모바일 높이 측정용 숨김 내용(폭 d.CW, 내용만). offsetHeight는 transform 무관. */}
      {isMobile && (
        <div
          ref={measureRef}
          aria-hidden
          className="invisible absolute top-0"
          style={{ left: -99999 }}
        >
          {PHILOSOPHY_CARDS.map((card) => (
            <div key={card.id} style={{ width: d.CW }}>
              <CardContent card={card} compact />
            </div>
          ))}
        </div>
      )}

      {PHILOSOPHY_CARDS.map((card, i) => (
        <CardCell
          key={card.id}
          card={card}
          index={i}
          active={active}
          progress={progress}
          dims={d}
          compact={isMobile}
          height={ch(i)}
          stackedTop={stackedTop(i)}
          spreadOffset={spreadTop(i) - stackedTop(i)}
        />
      ))}
    </div>
  )
}

function CardCell({
  card,
  index,
  active,
  progress,
  dims,
  compact,
  height,
  stackedTop,
  spreadOffset,
}: {
  card: PhilosophyCard
  index: number
  active: boolean
  progress: MotionValue<number>
  dims: Dims
  compact: boolean
  height: number
  stackedTop: number
  spreadOffset: number
}) {
  const [stacked, setStacked] = useState(index === 0)
  useEffect(() => {
    if (index === 0) return
    const T = dims.THRESHOLDS[index]
    const apply = (p: number) => setStacked(p >= T)
    apply(progress.get())
    const unsub = progress.on('change', apply)
    return () => unsub()
  }, [progress, index, dims])

  return (
    <motion.div
      className="absolute left-0"
      style={{ top: stackedTop, width: dims.CW, height, zIndex: index + 1 }}
      initial={{ opacity: 0, scale: 0.92, y: ENTRY_OFFSET }}
      animate={
        active
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.92, y: ENTRY_OFFSET }
      }
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 22,
        delay: active ? 0.08 + index * 0.12 : 0,
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ y: stacked ? 0 : spreadOffset }}
        transition={{
          y: { type: 'tween', duration: 0.65, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <CardFace card={card} compact={compact} />
      </motion.div>
    </motion.div>
  )
}
