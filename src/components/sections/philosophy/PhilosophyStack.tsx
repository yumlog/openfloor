import { type Ref } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { PHILOSOPHY_CARDS, type PhilosophyCard } from './cards'

/* ---------------------------------------------------------------------------
   Philosophy 스택 — 데스크탑. 트랩 progress(0..1)로 카드가 위로 순차로 쌓인다.
     진입(progress 0): 카드가 세로 리스트로 펼쳐짐(간격 20px) — 첫 카드가 보이고
                       나머지는 아래에 대기.
     스크롤: 카드마다 자기 구간을 가져 순차로 올라온다 — 2번이 다 쌓인 뒤 3번이
             시작(동시 진행 X). 쌓이면 이전 카드와 140px 차이로 겹친다.
   마지막(빨강) 카드가 다 쌓이면 PhilosophyGrow(포털)가 확대를 이어받는다.
   모든 값 design px(1440 기준); 부모 stage가 scale(ratio), origin top.
--------------------------------------------------------------------------- */

const CARD_W = 800
const CARD_H = 280
const GAP = 20
const STACK_OFFSET = 140
const N = PHILOSOPHY_CARDS.length

/** 쌓임이 끝나는 progress(= 확대 시작 GROW_START). 이후 .65→1 이 확대 구간. */
export const STACK_END = 0.55
/** 스테이지 높이(쌓인 상태 기준): 오프셋*(n-1) + 카드 높이. */
export const STAGE_H = STACK_OFFSET * (N - 1) + CARD_H // 560
/** 마지막(빨강) 카드 중심이 스테이지에서 차지하는 세로 비율 — 확대 측정용. */
export const LAST_CARD_CENTER_FRAC =
  (STACK_OFFSET * (N - 1) + CARD_H / 2) / STAGE_H // 0.75

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** 카드 비주얼(스택·확대 공용). contentOpacity는 확대 시 본문/따옴표 페이드용. */
export function CardFace({
  card,
  contentOpacity,
}: {
  card: PhilosophyCard
  contentOpacity?: MotionValue<number>
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
          className="pointer-events-none absolute top-[48px] right-[40px] opacity-50"
          style={{ width: 100, height: 68 }}
        />
        <div className="px-[40px] pt-[48px]">
          <div className="flex items-baseline gap-[16px] text-[24px] leading-[1.4] font-normal text-white">
            <span>{card.num}</span>
            <span>{card.name}</span>
          </div>
          <p className="mt-[74px] text-[24px] leading-[1.6] font-bold break-keep whitespace-pre-line text-white">
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
  /** philosophy 트랩 progress(0..1) — 쌓임을 구동. */
  progress: MotionValue<number>
  /** 확대 브릿지가 측정할 stage 루트 ref. */
  stageRef?: Ref<HTMLDivElement>
}

export function PhilosophyStack({
  active,
  ratio,
  progress,
  stageRef,
}: PhilosophyStackProps) {
  return (
    <div
      ref={stageRef}
      className="relative shrink-0"
      style={{
        width: CARD_W,
        height: STAGE_H,
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
}: {
  card: PhilosophyCard
  index: number
  active: boolean
  progress: MotionValue<number>
}) {
  // 순차 쌓임: 카드 i 는 [start_i, end_i] 구간에서만 펼침→쌓임으로 이동.
  //   start_i = (i-1)/(N-1)*STACK_END,  end_i = i/(N-1)*STACK_END
  // 그래서 i 카드가 다 올라온 뒤에야 i+1 카드가 시작한다.
  const top = useTransform(progress, (p) => {
    if (index === 0) return 0
    const start = ((index - 1) / (N - 1)) * STACK_END
    const end = (index / (N - 1)) * STACK_END
    const pLocal = clamp01((p - start) / (end - start))
    // easeOutCubic — 빠르게 올라오다 자리에 부드럽게 감속하며 안착.
    const eased = 1 - Math.pow(1 - pLocal, 3)
    const spread = index * (CARD_H + GAP) // 펼침: i*300
    const stacked = index * STACK_OFFSET // 쌓임: i*140
    return spread + (stacked - spread) * eased
  })

  return (
    // 바깥 = 쌓임 위치(top) + z. z는 바깥에 둬야 형제 순서가 잡힌다(안쪽 transform이
    // stacking context를 만들기 때문). 뒤(빨강·index 2)가 위로.
    <motion.div
      className="absolute left-0"
      style={{ top, width: CARD_W, height: CARD_H, zIndex: index + 1 }}
    >
      {/* 안쪽 = 진입: 활성화 시 아래에서 통통 솟아오름(뒤 카드부터 → 새 카드가 위로). */}
      <motion.div
        className="h-full w-full"
        initial={false}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={
          active
            ? {
                type: 'spring',
                bounce: 0.4,
                duration: 0.55,
                delay: 0.12 + (N - 1 - index) * 0.08,
              }
            : { duration: 0.2 }
        }
      >
        <CardFace card={card} />
      </motion.div>
    </motion.div>
  )
}
