import { useEffect, useState, type Ref } from 'react'
import { motion, type MotionValue } from 'motion/react'
import { PHILOSOPHY_CARDS, type PhilosophyCard } from './cards'

/* ---------------------------------------------------------------------------
   Philosophy 스택 — 데스크탑. 카드가 위로 순차로 쌓인다.
     진입(progress 0): 카드가 세로 리스트로 펼쳐짐(간격 20px) — 첫 카드가 보이고
                       나머지는 아래에 대기.
     스크롤: progress가 카드별 임계값(STACK_THRESHOLDS)을 "넘는 순간" 그 카드가
             시간 기반(easeOut)으로 끝까지 스륵 올라붙는다. 휠을 얼마나 돌렸는지와
             무관하게 항상 완전히 안착(중간에 멈추지 않음). 임계값을 벌려놔 하나씩.
   마지막(빨강) 카드가 다 쌓이면 PhilosophyGrow(포털)가 확대를 이어받는다.
   모든 값 design px(1440 기준); 부모 stage가 scale(ratio), origin top.
--------------------------------------------------------------------------- */

const CARD_W = 800
const CARD_H = 280
const GAP = 20
const STACK_OFFSET = 140
const N = PHILOSOPHY_CARDS.length
/** 진입 바운스 시작 y 오프셋(px) — 아래에서 통 튀어 올라온다. */
const ENTRY_OFFSET = 26

/** 쌓임이 끝나는 progress(= 확대 시작 GROW_START 계산 기준). 임계값은 이 안에 둔다. */
export const STACK_END = 0.55
/** 카드별 쌓임 임계값(progress). 넘으면 그 카드가 스륵 올라붙는다. 0번은 항상 위. */
const STACK_THRESHOLDS = [0, 0.18, 0.42]
/** 스테이지 높이(쌓인 상태 기준): 오프셋*(n-1) + 카드 높이. */
export const STAGE_H = STACK_OFFSET * (N - 1) + CARD_H // 560
/** 마지막(빨강) 카드 중심이 스테이지에서 차지하는 세로 비율 — 확대 측정용. */
export const LAST_CARD_CENTER_FRAC =
  (STACK_OFFSET * (N - 1) + CARD_H / 2) / STAGE_H // 0.75

/** 치수 세트(데스크탑/모바일). 모바일은 카드를 더 작고 정사각에 가깝게 리셰이프하고
    임계값을 모바일 트랩(steps 3)에 맞춰 벌린다. */
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

/** 카드 비주얼(스택·확대 공용). contentOpacity는 확대 시 본문/따옴표 페이드용. */
export function CardFace({
  card,
  contentOpacity,
  compact = false,
}: {
  card: PhilosophyCard
  contentOpacity?: MotionValue<number>
  /** 모바일 compact: 패딩/글자/간격을 줄여 작은 카드에 맞춘다. */
  compact?: boolean
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[12px]"
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
              ? 'pointer-events-none absolute top-[28px] right-[24px] opacity-50'
              : 'pointer-events-none absolute top-[48px] right-[40px] opacity-50'
          }
          style={
            compact
              ? { width: 64, height: 44 }
              : { width: 100, height: 68 }
          }
        />
        <div className={compact ? 'px-[28px] pt-[32px]' : 'px-[40px] pt-[48px]'}>
          <div
            className={
              compact
                ? 'flex items-baseline gap-[12px] text-[20px] leading-[1.4] font-normal text-white'
                : 'flex items-baseline gap-[16px] text-[24px] leading-[1.4] font-normal text-white'
            }
          >
            <span>{card.num}</span>
            <span>{card.name}</span>
          </div>
          <p
            className={
              compact
                ? 'mt-[40px] text-[18px] leading-[1.6] font-bold break-keep whitespace-pre-line text-white'
                : 'mt-[74px] text-[24px] leading-[1.6] font-bold break-keep whitespace-pre-line text-white'
            }
          >
            {card.body}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

interface PhilosophyStackProps {
  /** Philosophy가 활성 슬라이드인 동안 true — 진입 애니메이션 재생. */
  active: boolean
  /** frame.w / 1440 (<=1) — 디자인 캔버스를 유동 스케일. */
  ratio: number
  /** philosophy 트랩 progress(0..1) — 임계값으로 쌓임을 트리거. */
  progress: MotionValue<number>
  /** 확대 브릿지가 측정할 stage 루트 ref. */
  stageRef?: Ref<HTMLDivElement>
  /** 모바일: compact 치수 + compact CardFace. */
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
  const stageH = d.OFFSET * (N - 1) + d.CH
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
      {PHILOSOPHY_CARDS.map((card, i) => (
        <CardCell
          key={card.id}
          card={card}
          index={i}
          active={active}
          progress={progress}
          dims={d}
          compact={isMobile}
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
}: {
  card: PhilosophyCard
  index: number
  active: boolean
  progress: MotionValue<number>
  dims: Dims
  compact: boolean
}) {
  // progress가 임계값을 넘었는지만 본다(연속 추적 X) → 넘으면 시간 기반으로 안착.
  const [stacked, setStacked] = useState(index === 0)
  useEffect(() => {
    if (index === 0) return
    const T = dims.THRESHOLDS[index]
    const apply = (p: number) => setStacked(p >= T)
    apply(progress.get())
    const unsub = progress.on('change', apply)
    return () => unsub()
  }, [progress, index, dims])

  // 기준 위치 = 쌓임 위치(top 고정). 펼침은 그만큼 아래로 내려둔 y 오프셋.
  const stackedTop = index * dims.OFFSET
  const spreadOffset = index * (dims.CH + dims.GAP) - stackedTop

  return (
    // 바깥: 진입 바운스(통 통 통) + 위치/z. z는 transform이 만드는 stacking
    // context와 같은 요소에 둔다 — 형제 순서는 zIndex로 정렬(뒤·빨강 index 2가 위로).
    <motion.div
      className="absolute left-0"
      style={{
        top: stackedTop,
        width: dims.CW,
        height: dims.CH,
        zIndex: index + 1,
      }}
      initial={{ opacity: 0, scale: 0.92, y: ENTRY_OFFSET }}
      animate={
        active
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.92, y: ENTRY_OFFSET }
      }
      transition={{
        // 한 장씩 튀어나오는 스프링 바운스. delay로 통-통-통 stagger.
        type: 'spring',
        stiffness: 500,
        damping: 22,
        delay: active ? 0.08 + index * 0.12 : 0,
      }}
    >
      {/* 안: 기존 쌓임(spread↔stacked). y는 항상 stacked 상태를 따른다 — 역방향
          재진입은 seat=STACK_END라 전 카드 stacked로 들어와 깜빡임이 없다. */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: stacked ? 0 : spreadOffset }}
        transition={{
          // 쌓임 글라이드: 시간 기반 easeOut "스륵"(휠 양 무관, 항상 완전 안착).
          y: { type: 'tween', duration: 0.65, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <CardFace card={card} compact={compact} />
      </motion.div>
    </motion.div>
  )
}
