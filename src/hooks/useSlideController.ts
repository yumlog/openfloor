import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, type MotionValue } from 'motion/react'
import { SLIDE_DURATION, SLIDE_EASE, SLIDES } from '@/config/slides'
import {
  REVEAL_DURATION,
  REVEAL_END,
  TIME_EASE,
} from '@/components/sections/PortfolioSection'

export interface SlideController {
  /** 실수값 슬라이드 진행도(0 = 첫 섹션). 모든 애니메이션을 구동. */
  slide: MotionValue<number>
  /** 가장 가까운 정수 슬라이드 — 스크롤스파이 / 활성 내비 상태용. */
  index: number
  /** 프로그램으로 특정 섹션에 스냅(헤더 내비에서 사용). */
  goTo: (next: number) => void
}

interface TrapOptions {
  /** 스크롤을 "가두는" 슬라이드 인덱스. */
  index: number
  /** 한 제스처 스윕이 가둔 progress를 몇 칸 움직이는지. */
  steps: number
  /** 가둔 슬라이드가 구동하는 0..1 progress(예: manifesto 드럼 롤). */
  progress: MotionValue<number>
  /** 휠/터치 비례 롤 감도(deltaY * 이 값). 생략 시 ROLL_SENSITIVITY. */
  sensitivity?: number
  /** 역방향(아래에서 위로 되돌아) 진입 시 progress를 앉힐 값. 생략 시 1. philosophy는
      STACK_END로 앉혀 되돌아오는 즉시 growing=false가 되어 확대 카드가 자동 축소(g 1→0)되고
      카드가 스택 상태로 정착한다. */
  reverseSeat?: number
}

interface Options {
  /** 섹션 수. */
  total: number
  /** 입력 처리 게이트(예: 로딩 화면이 떠 있는 동안). */
  enabled?: boolean
  /**
   * 선택적 "스크롤 트랩" 목록: 현재 슬라이드가 어떤 트랩의 `index`와 같으면
   * 입력이 다음 섹션으로 스냅하는 대신 그 트랩의 `progress`(0..1)를 구동한다 —
   * 휠 / 터치는 스프링 관성으로 비례 롤, 키보드는 한 칸(1/steps) 이동. progress가
   * 해당 끝에 핀 채로 계속 밀어야만 슬라이드를 빠져나간다. Manifesto 드럼에서 사용.
   */
  traps?: TrapOptions[]
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

const PHILO_IDX = SLIDES.findIndex((sl) => sl.id === 'philosophy')
const PORT_IDX = SLIDES.findIndex((sl) => sl.id === 'portfolio')
const SEAM_DURATION = 0.4

/* 제스처 임계값. */
const WHEEL_THRESHOLD = 40
const WHEEL_RESET_MS = 180
const TOUCH_THRESHOLD = 50
/* 단일 discrete 드럼 롤 노치(키보드 / 재생 제스처). 섹션 스냅 이징보다 부드럽다
   (SLIDE_EASE는 급한 slow-in이라 덜컥거림); 완만한 ease-out이 줄에서 줄로 미끄러진다. */
const ROLL_DURATION = 0.55
const ROLL_EASE = [0.22, 1, 0.36, 1] as const
/* 휠 / 터치의 가둔 슬라이드 롤: 입력 거리가 목표를 비례(px * SENS)로 움직이고
   속도를 이어받는 스프링이 추종해, 세게 튕기면 줄을 휘리릭 넘기고 작은 너지는
   한 칸씩 살살 움직인다. */
const ROLL_SENSITIVITY = 0.0012
const ROLL_EPS = 1e-3

/**
 * 한 제스처 = 한 섹션 스냅. 휠 / 터치 / 키보드를 가로채 단일 `slide` motion
 * value를 구동하며, 쿨다운을 둬서 빠른 스크롤이 섹션을 건너뛰지 않게 한다.
 * body 스크롤 잠금도 소유.
 */
export function useSlideController({
  total,
  enabled = true,
  traps,
}: Options): SlideController {
  const slide = useMotionValue(0)
  const [index, setIndex] = useState(0)

  const currentRef = useRef(0)
  const animatingRef = useRef(false)
  // 단일 discrete 드럼 롤 노치가 애니메이션 중일 때 true(키보드) — 추가 노치를
  // 막아 한 번의 키 입력이 가둔 progress를 딱 한 칸 움직이게 한다.
  const rollAnimatingRef = useRef(false)
  // 가둔 롤이 향하는 목표(0..1). 휠/터치가 매 이벤트마다 재타깃하며, seat +
  // discrete 노치에서 동기화해 경계 판정이 정확하다.
  const rollTargetRef = useRef(0)
  // 반환되는 goTo의 정체성이 바뀌지 않도록 하는 안정적인 핸들.
  const goToRef = useRef<(next: number) => void>(() => {})

  // 페이지를 잠근다; 트랙 translate가 우리의 유일한 스크롤.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // 스크롤스파이 인덱스 — 가장 가까운 정수 슬라이드를 추적해 활성 내비 상태를 구동.
  useEffect(() => {
    const apply = (v: number) => {
      const next = clamp(Math.round(v), 0, SLIDES.length - 1)
      setIndex((prev) => (prev === next ? prev : next))
    }
    apply(slide.get())
    const unsub = slide.on('change', apply)
    return () => unsub()
  }, [slide])

  // 입력 처리.
  useEffect(() => {
    const trapAt = (idx: number) => traps?.find((t) => t.index === idx)
    const goTo = (next: number) => {
      next = clamp(next, 0, total - 1)
      if (next === currentRef.current || animatingRef.current) return
      const from = currentRef.current
      // 가둔 슬라이드로 진입: 드럼을 해당 끝에 seat 해서 위(아래로 진입)에서
      // 앞으로 굴리거나, 아래(위로 되돌아 진입)에서 거꾸로 굴리게 한다.
      const entering = trapAt(next)
      if (entering) {
        const seat = next > from ? 0 : (entering.reverseSeat ?? 1)
        entering.progress.set(seat)
        rollTargetRef.current = seat
        // 여기서 `.set()`이 진행 중인 노치 애니를 중단시켜 onComplete가 안 불리므로,
        // 잠금을 수동으로 풀지 않으면 true로 박혀 아래 step() 게이트가 이후 모든
        // 롤 AND 탈출을 막는다.
        rollAnimatingRef.current = false
      }
      currentRef.current = next
      animatingRef.current = true
      // philosophy↔portfolio 전환만 빠르게(빨강만 깔린 대기 구간 최소화), 그 외엔 기본.
      const isSeam =
        (from === PHILO_IDX && next === PORT_IDX) ||
        (from === PORT_IDX && next === PHILO_IDX)
      // 정방향 philosophy→portfolio: 확대 핸드오프 직후 Portfolio reveal을 '커밋된 자동
      // 전환'으로 재생한다. seam(slide 2→3)과 동시에 trap progress를 0→REVEAL_END로
      // 자동 전진시키면 reveal01이 함께 0→1로 재생된다. 그 전진이 끝날 때까지
      // animatingRef를 true로 유지해(inTrap()=false → 롤 잠금, step() 게이트) 휠/터치/
      // 키보드가 reveal을 끊지 못하게 한다. (역방향·그 외는 onComplete에서 즉시 unlock.)
      const isForwardSeam = from === PHILO_IDX && next === PORT_IDX
      animate(slide, next, {
        duration: isSeam ? SEAM_DURATION : SLIDE_DURATION,
        ease: SLIDE_EASE,
        onComplete: () => {
          if (!isForwardSeam) animatingRef.current = false
        },
      })
      if (isForwardSeam && entering) {
        animate(entering.progress, REVEAL_END, {
          duration: REVEAL_DURATION,
          ease: TIME_EASE,
          onComplete: () => {
            // 잠금 해제 후 첫 스크롤이 progress를 0으로 되돌리지 않도록 목표를 동기화.
            rollTargetRef.current = REVEAL_END
            animatingRef.current = false
          },
        })
      }
    }
    goToRef.current = goTo

    // 한 방향 step. 스냅(또는 트랩 탈출)이 진행 중이면 추가 입력을 무시한다 —
    // 한 제스처가 한 섹션만 이동하며, 아래의 휠 잠금 + quiet 타이머가 연속
    // 스크롤 / 관성이 그 너머로 advance하는 걸 막는다.
    const step = (dir: number) => {
      // 스크롤 트랩 게이트(DISCRETE 경로 — 키보드 + 재생 제스처): 가둔 슬라이드에
      // 머무는 동안 step은 섹션 스냅 대신 드럼을 딱 한 칸 움직인다. 휠 / 터치는
      // 아래의 비례 경로를 쓰며, 이 경로가 `rollTargetRef`를 동기화해 둘이 경계에서
      // 일치한다. 드럼이 이미 해당 끝에 있을 때만 step이 통과해 슬라이드 밖으로
      // advance 한다.
      const curTrap = trapAt(currentRef.current)
      if (curTrap && !animatingRef.current) {
        if (rollAnimatingRef.current) return // 한 키 = 한 칸
        const p = rollTargetRef.current
        const sz = 1 / curTrap.steps
        if (dir > 0 && p < 1 - ROLL_EPS) {
          rollAnimatingRef.current = true
          rollTargetRef.current = Math.min(1, p + sz)
          animate(curTrap.progress, rollTargetRef.current, {
            duration: ROLL_DURATION,
            ease: ROLL_EASE,
            onComplete: () => {
              rollAnimatingRef.current = false
            },
          })
          return
        }
        if (dir < 0 && p > ROLL_EPS) {
          rollAnimatingRef.current = true
          rollTargetRef.current = Math.max(0, p - sz)
          animate(curTrap.progress, rollTargetRef.current, {
            duration: ROLL_DURATION,
            ease: ROLL_EASE,
            onComplete: () => {
              rollAnimatingRef.current = false
            },
          })
          return
        }
        // 끝에 도달 — 통과해서 트랩 밖으로 advance.
      }

      if (animatingRef.current) return
      goTo(currentRef.current + dir)
    }

    // 가둔 슬라이드에 머무는 중이고, 섹션 스냅 중이 아닌가?
    const inTrap = () => !animatingRef.current && !!trapAt(currentRef.current)

    // 비례 드럼 롤을 재타깃한다. 속도를 이어받는 스프링이 목표를 추종해, 튕기는
    // 도중 재타깃해도 모멘텀이 유지되고(휘리릭) 작은 너지 하나는 살짝만 움직인다.
    const rollTo = (target: number) => {
      const t = trapAt(currentRef.current)
      if (!t) return
      // 비례 롤은 어떤 discrete 노치도 대체한다; 잠금을 풀어 두면 드럼을 휠/드래그로
      // 끝까지 굴린 뒤 step()이 (stale 노치 잠금에 막히지 않고) 통과해 트랩 밖으로
      // advance 할 수 있다.
      rollAnimatingRef.current = false
      rollTargetRef.current = clamp(target, 0, 1)
      animate(t.progress, rollTargetRef.current, {
        type: 'spring',
        stiffness: 120,
        damping: 24,
      })
    }

    if (!enabled) return

    // 휠: delta를 누적, 임계를 넘으면 한 번 발사, 버스트 사이에 리셋.
    let wheelAccum = 0
    // 가둔 동안 "끝을 넘어 미는" 용도의 별도 누산기 — 롤과 섹션 advance가 상태를
    // 공유하지 않게.
    let rollEdgeAccum = 0
    // 한 휠 버스트가 한 섹션 advance를 소비하면 set; 이벤트가 계속 오는 동안
    // (연속 스크롤 / 관성) 유지되고 멎으면 해제되어, 끊기지 않은 한 제스처가 딱
    // 한 섹션만 이동하게 한다.
    let wheelLocked = false
    let wheelResetTimer: ReturnType<typeof setTimeout>
    const resetWheel = () => {
      wheelAccum = 0
      rollEdgeAccum = 0
      wheelLocked = false
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      // 가둔 슬라이드: 드럼을 관성으로 비례 롤. 끝에 핀 채로 계속 밀 때만
      // 누적 버스트가 밖으로 advance.
      if (inTrap()) {
        const sens = trapAt(currentRef.current)?.sensitivity ?? ROLL_SENSITIVITY
        const t = rollTargetRef.current
        const pushingPastEnd =
          (e.deltaY > 0 && t >= 1 - ROLL_EPS) || (e.deltaY < 0 && t <= ROLL_EPS)
        if (!pushingPastEnd) {
          resetWheel()
          rollTo(t + e.deltaY * sens)
          return
        }
        rollEdgeAccum += e.deltaY
        clearTimeout(wheelResetTimer)
        wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS)
        // 리셋이 아니라 잠금 — 트랩을 빠져나온 뒤 남은 관성이 contact / portfolio를
        // 지나 섹션까지 이어지지 않게.
        if (rollEdgeAccum > WHEEL_THRESHOLD) {
          rollEdgeAccum = 0
          wheelLocked = true
          step(1)
        } else if (rollEdgeAccum < -WHEEL_THRESHOLD) {
          rollEdgeAccum = 0
          wheelLocked = true
          step(-1)
        }
        return
      }

      // 매 이벤트마다 quiet 타이머 갱신(잠겨 있어도) — 잠금은 휠이 실제로
      // WHEEL_RESET_MS 동안 멎어야만 해제된다.
      clearTimeout(wheelResetTimer)
      wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS)
      // 이미 이번 제스처의 한 advance를 소비함 — 휠이 멎을 때까지 무시.
      if (wheelLocked) return
      wheelAccum += e.deltaY
      if (wheelAccum > WHEEL_THRESHOLD) {
        wheelAccum = 0
        wheelLocked = true
        step(1)
      } else if (wheelAccum < -WHEEL_THRESHOLD) {
        wheelAccum = 0
        wheelLocked = true
        step(-1)
      }
    }

    // 터치: 가둔 동안 드럼이 손가락을 비례로 따라간다; 그 외에는 시작/끝 Y를
    // 비교해 결정적 스와이프에 step.
    let touchStartY = 0
    let touchPrevY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      touchPrevY = touchStartY
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const y = e.touches[0].clientY
      const dy = touchPrevY - y
      touchPrevY = y
      if (inTrap()) {
        const sens = trapAt(currentRef.current)?.sensitivity ?? ROLL_SENSITIVITY
        const t = rollTargetRef.current
        const pushingPastEnd =
          (dy > 0 && t >= 1 - ROLL_EPS) || (dy < 0 && t <= ROLL_EPS)
        if (!pushingPastEnd) rollTo(t + dy * sens)
      }
    }
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY - e.changedTouches[0].clientY
      // 가둔 동안: 손가락이 이미 드럼을 굴렸으니, 끝에 핀 상태에서의 결정적
      // 스와이프만 밖으로 advance.
      if (inTrap()) {
        const t = rollTargetRef.current
        if (delta > TOUCH_THRESHOLD && t >= 1 - ROLL_EPS) step(1)
        else if (delta < -TOUCH_THRESHOLD && t <= ROLL_EPS) step(-1)
        return
      }
      if (Math.abs(delta) < TOUCH_THRESHOLD) return
      step(delta > 0 ? 1 : -1)
    }

    // 키보드.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        step(1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(total - 1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
      clearTimeout(wheelResetTimer)
    }
  }, [enabled, total, slide, traps])

  const goTo = useCallback((next: number) => goToRef.current(next), [])

  return { slide, index, goTo }
}
