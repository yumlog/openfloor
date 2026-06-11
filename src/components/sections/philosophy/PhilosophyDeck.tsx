import { useEffect, useState } from 'react'
import {
  motion,
  type MotionValue,
  type TargetAndTransition,
  type Transition,
} from 'motion/react'
import { cn } from '@/lib/cn'
import { PHILOSOPHY_CARDS } from './cards'

/* ---------------------------------------------------------------------------
   Philosophy 덱 — 데스크탑 상태 머신.

   `selected`(가운데 카드 인덱스, 또는 null)가 구동하는 두 상태:
     standing   selected === null   동일한 카드 3장을 덱으로 쌓음.
     expanded   selected !== null   평면 3-up; 선택 카드는 가운데(본문 + 스크림 +
                                     닫는 따옴표), 나머지 둘은 양옆(이미지 + 이름만).

   클릭 규칙: 세움 카드 -> 가운데로 펼침. 옆 카드 -> 가운데로 이동. 가운데 카드 ->
   덱으로 접힘.

   STANDING은 2D 오블리크 스택(3D 원근 아님): 모든 카드가 완전히 같은 크기와
   skewY를 공유하고 일정한 대각선 오프셋으로 stepped 되어, 셋이 가지런한 동일
   평행사변형으로 읽힌다(세로 변은 수직 유지; 위/아래 변만 기울어짐). 이렇게 해야
   히트 테스트가 정확하고 모양이 균일하다 — 진짜 원근 덱은 카드마다 각도가 달랐다.

   여기 모든 값은 design px(1440 기준)다. 전체 스테이지는 부모가
   transform:scale(ratio)하므로 이 리터럴들이 프레임에 맞춰 유동 축소된다 —
   스케일된 캔버스 안에선 값별 clamp가 필요 없다.
--------------------------------------------------------------------------- */

const CANVAS_W = 1440
const CANVAS_H = 600

// 펼침 크기(design-philosophy.png).
const CENTER = 420
const SIDE = 300
const CARD_GAP = 40
// 스테이지 중심에서 옆 카드 중심까지의 거리.
const SLOT_X = CENTER / 2 + CARD_GAP + SIDE / 2

// 세움 덱(philosophy-standing-name.png): 동일한 세로형 카드(W:H ≈ 0.7), 공유
// skew 하나, 일정 대각선 step. 앞(인덱스 0)이 맨 위; 뒤 카드가 그 위를 넘어
// 아래로 들어간다.
const DECK_W = 220
const DECK_H = 320 // ≈ DECK_W / 0.7 -> 레퍼런스처럼 세로형
const SKEW = 30 // skewY, 도 — "\" 기울기(왼쪽 변이 높음); 세로 변은 수직 유지
const STEP_X = 100
const STEP_Y = 0
const HOVER_LIFT = 30

// 언더댐핑 스프링이라 카드가 상태 간 이동/리사이즈 시 살짝 오버슈트하며 "보잉"
// 하고 안착한다(x 이동도 옆 흔들림처럼 읽힌다). zIndex는 절대 애니메이션 X —
// 사용처마다 즉시 스냅하도록 덮어쓴다.
const TRANSITION: Transition = {
  type: 'spring',
  bounce: 0.3,
  duration: 0.6,
}
const FADE: Transition = { duration: 0.3, ease: 'easeOut' }

// 진입: 섹션이 활성화되면 각 카드가 통통 튀는 stagger("통통통")로 아래에서
// 솟아오른다; false -> true(재진입)마다 다시 재생. 안쪽 레이아웃 상태 머신과
// 독립되도록 바깥 래퍼에 둔다.
const ENTRY_BASE = 0.15
const ENTRY_STAGGER = 0.1
const CARD_COUNT = PHILOSOPHY_CARDS.length

/**
 * 현재 `selected` 카드와 hover된 카드를 기준으로 한 카드 `index`의 목표
 * transform. 카드는 스테이지 중심에 top-left로 앵커되므로, x/y가 -w/2 / -h/2
 * 오프셋을 실어 카드 자신의 중심으로 위치시킨다.
 */
function targetFor(
  index: number,
  selected: number | null,
  hovered: number | null
): TargetAndTransition {
  // standing — 일정 대각선 step 위의 동일한 skew 카드들.
  if (selected === null) {
    const cx = (index - 1) * STEP_X
    const cy = (1 - index) * STEP_Y - (hovered === index ? HOVER_LIFT : 0)
    return {
      width: DECK_W,
      height: DECK_H,
      x: cx - DECK_W / 2,
      y: cy - DECK_H / 2,
      skewY: SKEW,
      zIndex: 30 - index * 10 + (hovered === index ? 5 : 0),
    }
  }

  // expanded — 가운데 카드.
  if (index === selected) {
    return {
      width: CENTER,
      height: CENTER,
      x: -CENTER / 2,
      y: -CENTER / 2,
      skewY: 0,
      zIndex: 30,
    }
  }

  // expanded — 옆 카드들, 기준 좌 -> 우 순서 유지.
  const others = [0, 1, 2].filter((i) => i !== selected)
  const cx = others[0] === index ? -SLOT_X : SLOT_X
  return {
    width: SIDE,
    height: SIDE,
    x: cx - SIDE / 2,
    y: -SIDE / 2,
    skewY: 0,
    zIndex: 20,
  }
}

interface PhilosophyDeckProps {
  /** Philosophy가 활성 슬라이드인 동안 true — 나갈 때 덱으로 리셋. */
  active: boolean
  /** frame.w / 1440 (<=1) — 전체 디자인 캔버스를 유동 스케일. */
  ratio: number
  /** philosophy 트랩 progress(0..1) — 중앙 카드를 스텝. */
  progress?: MotionValue<number>
}

export function PhilosophyDeck({ active, ratio, progress }: PhilosophyDeckProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  // 섹션을 떠나면 덱을 다시 접어, 재진입 시 standing에서 시작하게 한다.
  useEffect(() => {
    if (!active) setHovered(null)
  }, [active])

  // 스크롤 트랩 progress가 중앙 카드를 구동: <0.125 세움 → c0 → c1 → c2.
  useEffect(() => {
    if (!progress) return
    const apply = (p: number) =>
      setSelected(p < 0.125 ? null : p < 0.375 ? 0 : p < 0.625 ? 1 : 2)
    apply(progress.get())
    const unsub = progress.on('change', apply)
    return () => unsub()
  }, [progress, active])

  const standing = selected === null

  return (
    <div
      className="relative shrink-0"
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
        transform: `scale(${ratio})`,
      }}
    >
      {PHILOSOPHY_CARDS.map((card, i) => {
        const t = targetFor(i, selected, hovered)
        // z-index는 바깥 래퍼에 둔다: 래퍼의 opacity/transform이 stacking
        // context를 만들어, 안쪽 z-index로는 형제 순서를 정할 수 없다.
        const { zIndex, ...layout } = t
        const isSelected = selected === i
        const isCenter = selected === null ? i === 1 : selected === i
        // 본문/스크림 페이드. 펼칠 땐 사이즈 스프링이 최종 너비에 거의 도달할
        // 때까지 기다려 최종 줄바꿈에서 등장하게 한다(리사이즈 중 reflow 깜빡임
        // 없음). 접을 땐 빠르게 사라진다 — 축소가 보이는 텍스트를 reflow 하기 전에.
        const bodyFade: Transition = {
          duration: 0.25,
          delay: 0.4,
          ease: 'easeOut',
        }
        return (
          // 바깥 = 진입 앵커: 섹션 진입 시 카드를 아래에서 솟아오르게(stagger),
          // 안쪽 레이아웃/상태 머신과 독립적으로.
          <motion.div
            key={card.id}
            className="absolute top-1/2 left-1/2"
            initial={false}
            animate={{
              ...(active
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 40, scale: 0.92 }),
              zIndex,
            }}
            transition={{
              ...(active
                ? {
                    type: 'spring',
                    bounce: 0.45,
                    duration: 0.55,
                    // 역순: 뒤 카드(인덱스 2)가 먼저, 앞(인덱스 0)이 마지막 —
                    // 그래서 새 카드가 항상 위에 얹힌다.
                    delay: ENTRY_BASE + (CARD_COUNT - 1 - i) * ENTRY_STAGGER,
                  }
                : { duration: 0.2 }),
              // 쌓임은 즉시 스냅해야 하며, 절대 애니메이션 X.
              zIndex: { duration: 0 },
            }}
          >
            {/* 안쪽 = 레이아웃 상태 머신(standing/expanded/hover). 바깥 원점
                (스테이지 중심)에 앵커; t의 x/y가 거기서부터 translate. */}
            <motion.div
              className="absolute select-none"
              animate={layout}
              transition={TRANSITION}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered((h) => (h === i ? null : h))}
            >
              {/* 이미지 플레이스홀더 — 본문을 둥근 카드로 클립. */}
              <div
                className={cn(
                  'absolute inset-0 overflow-hidden rounded-[24px]',
                  isCenter ? 'bg-[#FB3640]' : 'bg-[#E4E4E7]'
                )}
              >
                {/* 본문 — 펼침 상태의 모든 카드(가운데/양옆 크기·색 분기). */}
                <motion.div
                  key={standing ? 'standing' : isCenter ? 'center' : 'side'}
                  className={cn(
                    'pointer-events-none absolute inset-0',
                    standing
                      ? 'px-[32px] py-[40px]'
                      : isCenter
                        ? 'px-[44px] py-[48px]'
                        : 'px-[32px] py-[40px]'
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={bodyFade}
                >
                  <p
                    className={cn(
                      'leading-[1.4] font-medium tracking-[-0.05em] text-pretty break-keep',
                      isCenter ? 'text-title-on-dark' : 'text-[#999]',
                      standing
                        ? 'text-[16px]'
                        : isCenter
                          ? 'text-[24px]'
                          : 'text-[20px]'
                    )}
                  >
                    {card.body}
                  </p>
                </motion.div>

                {/* 우하단 쌍따옴표 — 가운데 128×88 / 양옆 88×60. */}
                <motion.img
                  src="/images/card.svg"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="pointer-events-none absolute right-[40px] bottom-[44px]"
                  animate={{
                    width: standing ? 88 : isCenter ? 128 : 88,
                    height: standing ? 60 : isCenter ? 88 : 60,
                  }}
                  transition={TRANSITION}
                />
              </div>

              {/* 카드 아래 이름. 두 상태 공용 라벨 하나(상호 배타적): 펼침은
                모든 카드 이름을 가운데 표시; 세움은 호버한 카드 이름만 우측
                정렬로 표시. 카드 그룹 안에 있어 카드의 skew를 물려받고 호버한
                카드를 따라간다(레퍼런스 "MILLA"). */}
              <motion.p
                className={cn(
                  'text-card-name pointer-events-none absolute top-full right-0 left-0 mt-[20px] leading-[1.4] font-bold tracking-[-0.04em]',
                  isSelected ? 'text-[24px]' : 'text-[16px]',
                  standing ? 'text-right' : 'text-center'
                )}
                animate={{
                  opacity: standing ? (hovered === i ? 1 : 0) : 1,
                }}
                transition={FADE}
              >
                {card.name}
              </motion.p>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
