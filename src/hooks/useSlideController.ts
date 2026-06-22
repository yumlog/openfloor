import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, type MotionValue } from 'motion/react'
import { SLIDE_DURATION, SLIDE_EASE, SLIDES } from '@/config/slides'
import {
  REVEAL_DURATION,
  REVEAL_END,
  REVEAL_HOLD,
  REVEAL_REVERSE_DURATION,
  TIME_EASE,
  TIME_EASE_REVERSE,
} from '@/components/sections/PortfolioSection'
import {
  GROW_DURATION,
  GROW_START,
} from '@/components/sections/PhilosophySection'

export interface SlideController {
  /** 실수값 슬라이드 진행도(0 = 첫 섹션). 모든 애니메이션을 구동. */
  slide: MotionValue<number>
  /** 가장 가까운 정수 슬라이드 — 스크롤스파이 / 활성 내비 상태용. */
  index: number
  /** 프로그램으로 특정 섹션에 스냅(헤더 내비에서 사용). */
  goTo: (next: number) => void
  /** 현재(마지막) 이동의 출발 섹션 인덱스. 포털 게이팅용. */
  source: number
  /** 현재(마지막) 이동의 도착 섹션 인덱스. 포털 게이팅용. */
  target: number
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
  /** true면 휠/터치도 비례 스크럽 대신 노치 스텝(한 제스처 = 한 칸). */
  snap?: boolean
  /** 유휴(스크롤 멈춤) 시 progress를 진입 방향으로 천천히 자동 전진시킨다. speed는
      초당 progress 증가량, fwdCap/revCap은 자동이 멈추는 지점(끝 줄이 정면). 그 너머
      이탈은 스크롤로만. progress와 rollTargetRef를 함께 움직여 데드존·점프가 없다. */
  autoFlow?: {
    speed: number
    fwdCap: number
    revCap: number
    damp: number
    impulse: number
    vMax: number
  }
}

interface Options {
  /** 섹션 수. */
  total: number
  /** 입력 처리 게이트(예: 로딩 화면이 떠 있는 동안). */
  enabled?: boolean
  /** 모바일(<768): philosophy 확대 핸드오프가 없으므로 grow/역방향 seam 잠금을 끈다. */
  isMobile?: boolean
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
  isMobile = false,
}: Options): SlideController {
  const slide = useMotionValue(0)
  const [index, setIndex] = useState(0)
  // 현재 이동의 출발/도착 섹션 — 포트폴리오 포털을 '포트폴리오가 끝점인 이동'에만
  // 켜기 위해 reactive하게 노출(통과 깜빡임 제거).
  const [source, setSource] = useState(0)
  const [target, setTarget] = useState(0)

  const currentRef = useRef(0)
  const animatingRef = useRef(false)
  // 단일 discrete 드럼 롤 노치가 애니메이션 중일 때 true(키보드) — 추가 노치를
  // 막아 한 번의 키 입력이 가둔 progress를 딱 한 칸 움직이게 한다.
  const rollAnimatingRef = useRef(false)
  // 가둔 롤이 향하는 목표(0..1). 휠/터치가 매 이벤트마다 재타깃하며, seat +
  // discrete 노치에서 동기화해 경계 판정이 정확하다.
  const rollTargetRef = useRef(0)
  // 가둔 트랩 진입 방향(+1 정방향 / -1 역방향) — autoFlow 자동 흐름 방향 결정.
  const trapDirRef = useRef(0)
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
    // 역방향 seam(portfolio→philosophy) 빨강 카드 축소 동안 입력 잠금 해제 타이머.
    let reverseUnlockTimer: ReturnType<typeof setTimeout>
    // Portfolio reveal 자동 전진: 진입 후 REVEAL_HOLD 동안 통짜 텍스트(progress 0)로
    // 멈췄다가 split, 끝나면 목표 동기화 + unlock. seam(즉시)·점프 진입(착지 후) 공용.
    const playPortfolioReveal = (trap: TrapOptions) => {
      animate(trap.progress, REVEAL_END, {
        duration: REVEAL_DURATION,
        delay: REVEAL_HOLD,
        ease: TIME_EASE,
        onComplete: () => {
          rollTargetRef.current = REVEAL_END
          animatingRef.current = false
        },
      })
    }
    const goTo = (next: number) => {
      next = clamp(next, 0, total - 1)
      if (next === currentRef.current || animatingRef.current) return
      const from = currentRef.current
      setSource(from)
      // 가둔 슬라이드로 진입: 드럼을 해당 끝에 seat 해서 위(아래로 진입)에서
      // 앞으로 굴리거나, 아래(위로 되돌아 진입)에서 거꾸로 굴리게 한다.
      const entering = trapAt(next)
      if (entering) {
        const seat = next > from ? 0 : (entering.reverseSeat ?? 1)
        trapDirRef.current = next > from ? 1 : -1
        entering.progress.set(seat)
        rollTargetRef.current = seat
        // 여기서 `.set()`이 진행 중인 노치 애니를 중단시켜 onComplete가 안 불리므로,
        // 잠금을 수동으로 풀지 않으면 true로 박혀 아래 step() 게이트가 이후 모든
        // 롤 AND 탈출을 막는다.
        rollAnimatingRef.current = false
      }
      // philosophy/portfolio 범위(2~3) 밖으로 이동하면 parked된 philosophyRoll을 0으로
      // 초기화 — 그대로 두면 grow(빨강 g=1)가 살아남아, 멀리서 헤더로 점프할 때 전환 중
      // slide가 2~3을 지나며 빨강이 스치거나(문제1), 다시 정방향 진입 시 g가 1→0으로
      // 줄며 축소 애니가 보인다(문제2). 인접 seam(next=2 또는 3)은 제외해 안 깨뜨린다.
      if (next < PHILO_IDX || next > PORT_IDX) {
        trapAt(PHILO_IDX)?.progress.set(0)
      }
      currentRef.current = next
      setTarget(next)
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
      // 역방향 portfolio→philosophy: 빨강 카드가 g 1→0으로 축소되는 GROW_DURATION 동안
      // 입력을 잠가, 역스크롤 잔여 모멘텀이 philosophyRoll을 마지막 카드 임계값(0.42)
      // 밑으로 끌어내려 카드가 풀리는 걸 막는다(정방향 확대 잠금과 대칭).
      const isReverseSeam = !isMobile && from === PORT_IDX && next === PHILO_IDX
      // Philosophy 인접 seam이 아닌, 위쪽(Hero/About)에서 포트폴리오로 정방향 점프
      // 진입 — 착지 후 reveal을 자동재생해 통짜 텍스트에 멈춰 있지 않게 한다.
      const isPortJumpEntry =
        next === PORT_IDX && next > from && from !== PHILO_IDX
      animate(slide, next, {
        duration: isSeam ? SEAM_DURATION : SLIDE_DURATION,
        ease: SLIDE_EASE,
        onComplete: () => {
          // 정방향 seam: progress 자동 전진 onComplete가 unlock을 담당(여기선 아무것도 안 함).
          if (isForwardSeam) return
          // 역방향: 빨강 카드 축소(GROW_DURATION) 뒤 unlock.
          if (isReverseSeam) {
            clearTimeout(reverseUnlockTimer)
            reverseUnlockTimer = setTimeout(() => {
              animatingRef.current = false
            }, GROW_DURATION * 1000)
            return
          }
          // 위쪽에서 포트폴리오로 점프 진입: 착지 후 reveal 재생(unlock은 reveal
          // onComplete가 담당). 점프 동안 animatingRef가 계속 true라 입력이 끼어들지 못함.
          if (isPortJumpEntry && entering) {
            playPortfolioReveal(entering)
            return
          }
          animatingRef.current = false
        },
      })
      // seam: 빠른 전환과 겹쳐 즉시 재생(progress는 seat=0 → REVEAL_HOLD 후 split).
      if (isForwardSeam && entering) playPortfolioReveal(entering)
    }
    goToRef.current = goTo

    // 역방향 자동 re-gather: portfolio에서 progress가 REVEAL_END 아래로 하향 교차하면
    // reveal를 0까지 자동 재생(잠금)한 뒤 philosophy로 핸드오프. 정방향 자동재생과 대칭.
    // (philosophy가 트랩일 때 = 데스크탑에서만. mobile은 기존 손 스크롤 유지.)
    const portTrap = trapAt(PORT_IDX)
    const philoIsTrap = !!trapAt(PHILO_IDX)
    let regatherPrev = portTrap ? portTrap.progress.get() : 0
    let regathering = false
    const onPortProgress = (p: number) => {
      const crossingDown = regatherPrev >= REVEAL_END && p < REVEAL_END
      regatherPrev = p
      if (
        !philoIsTrap ||
        !portTrap ||
        currentRef.current !== PORT_IDX ||
        animatingRef.current ||
        regathering ||
        !crossingDown
      )
        return
      regathering = true
      animatingRef.current = true // inTrap()=false → 손굴림 잠금
      rollAnimatingRef.current = false
      rollTargetRef.current = 0
      animate(portTrap.progress, 0, {
        duration: REVEAL_REVERSE_DURATION,
        ease: TIME_EASE_REVERSE,
        onComplete: () => {
          regathering = false
          animatingRef.current = false // 아래 goTo 가드 통과용
          goTo(PHILO_IDX) // isReverseSeam 잠금으로 빨강 카드 축소까지 이어짐
        },
      })
    }
    const unsubPort = portTrap?.progress.on('change', onPortProgress)

    // 한 방향 step. 스냅(또는 트랩 탈출)이 진행 중이면 추가 입력을 무시한다 —
    // 한 제스처가 한 섹션만 이동하며, 아래의 휠 잠금 + quiet 타이머가 연속
    // 스크롤 / 관성이 그 너머로 advance하는 걸 막는다.
    const step = (dir: number) => {
      // 확대 커밋 후 정방향 입력은 무시(조기 portfolio advance 방지).
      if (philoGrowCommitted() && dir > 0) return
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
      // 위로 한 칸: vision(포트폴리오 바로 아래)에서 위로 가면 portfolio를 건너뛰고
      // philosophy로 — "올라갈 때 portfolio 스킵". 그 외는 인접 한 칸 이동.
      const stepTarget =
        dir < 0 && currentRef.current === PORT_IDX + 1
          ? PORT_IDX - 1
          : currentRef.current + dir
      goTo(stepTarget)
    }

    // 가둔 슬라이드에 머무는 중이고, 섹션 스냅 중이 아닌가?
    const inTrap = () => !animatingRef.current && !!trapAt(currentRef.current)

    // Philosophy 확대가 커밋된 상태(정방향으로 GROW_START에 도달) — 이때 정방향
    // 입력을 무시해 push-past-end로 인한 조기 슬라이드 advance를 막는다. 핸드오프는
    // grow의 onComplete(goTo)만 담당. rollTargetRef(목표)로 판정해 빠른 스크롤에서
    // 스프링이 따라오기 전이라도 즉시 차단(목표를 세팅하는 그 입력 자체는 체크가
    // rollTo 이전이라 차단되지 않으므로 deadlock 없음).
    const philoGrowCommitted = () =>
      !isMobile &&
      currentRef.current === PHILO_IDX &&
      rollTargetRef.current >= GROW_START

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
    // autoFlow 속도-바닥 모델의 현재 progress 속도(progress/sec). 휠/터치/키가 힘을
    // 더하고, 자동 루프가 진입 방향 자동 속도로 수렴시키며 적분한다.
    let v = 0
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
      if (inTrap() && !trapAt(currentRef.current)?.snap) {
        // autoFlow 트랩: 속도-바닥 모델 — 휠은 속도 v에 힘만 더한다(관성). 진행·이탈은
        // 자동 루프가 담당하므로 rollTo / push-past-end를 쓰지 않는다.
        const af = trapAt(currentRef.current)?.autoFlow
        if (af) {
          v = clamp(v + e.deltaY * af.impulse, -af.vMax, af.vMax)
          return
        }
        // 확대 커밋 후 정방향 휠은 무시(조기 portfolio advance 방지).
        if (philoGrowCommitted() && e.deltaY > 0) {
          resetWheel()
          return
        }
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
        const af = trapAt(currentRef.current)?.autoFlow
        if (af) {
          v = clamp(v + dy * af.impulse, -af.vMax, af.vMax)
          return
        }
        if (trapAt(currentRef.current)?.snap) return // ← 스냅은 end에서 판정
        // 확대 커밋 후 정방향 터치는 무시(조기 portfolio advance 방지).
        if (philoGrowCommitted() && dy > 0) return
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
        // autoFlow는 경계 이탈을 자동 루프가 처리하므로 여기선 아무것도 안 한다.
        if (trapAt(currentRef.current)?.autoFlow) return
        if (trapAt(currentRef.current)?.snap) {
          if (delta > TOUCH_THRESHOLD) step(1)
          else if (delta < -TOUCH_THRESHOLD) step(-1)
          return
        }
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
      // autoFlow 트랩: 위/아래 키도 속도 v에 힘을 더한다(자동 루프가 진행·이탈 담당).
      const af = trapAt(currentRef.current)?.autoFlow
      if (af && !animatingRef.current) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault()
          v = clamp(v + 100 * af.impulse, -af.vMax, af.vMax)
          return
        }
        if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault()
          v = clamp(v - 100 * af.impulse, -af.vMax, af.vMax)
          return
        }
      }
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

    // 속도-바닥(velocity floor) 모델: autoFlow 트랩에서 스크롤과 자동 흐름을 하나의
    // 속도 v로 통합한다. 휠/터치/키가 v에 힘을 더하고, 가만히 두면 v는 0이 아니라 진입
    // 방향 자동 속도(floor)로 수렴한다 → 스크롤이 멈춰도 정지하지 않고 그 속도로 자연
    // 감속·연결되어 "툭" 끊김이 없다. floor는 cap 안쪽에서만 자동 속도라 유휴는 마지막/
    // 첫 줄에서 멈추고, 경계(progress 1/0)에 닿으면 즉시 이탈한다(push-past-end 없음 = 데드존 0).
    let autoRaf = 0
    let autoPrev = performance.now()
    const autoLoop = (now: number) => {
      const dt = Math.min(0.05, (now - autoPrev) / 1000)
      autoPrev = now
      const trap = trapAt(currentRef.current)
      if (trap?.autoFlow && !animatingRef.current) {
        const { speed, fwdCap, revCap, damp } = trap.autoFlow
        const dir = trapDirRef.current
        let p = trap.progress.get()
        // cap 안쪽이면 자동 속도, 밖이면 0 — v가 수렴할 "바닥".
        const past = dir > 0 ? p >= fwdCap : p <= revCap
        const floor = past ? 0 : dir * speed
        v += (floor - v) * Math.min(1, damp * dt)
        p += v * dt
        if (p >= 1) {
          // 아래 경계(마지막 줄이 위로 사라짐) → 다음 섹션. 진입 방향과 무관.
          trap.progress.set(1)
          rollTargetRef.current = 1
          v = 0
          wheelLocked = true // 남은 관성이 다음 섹션까지 넘어가지 않게.
          goTo(currentRef.current + 1)
        } else if (p <= 0) {
          // 위 경계(첫 줄이 아래로 사라짐) → 이전 섹션. 정방향 진입 후 되돌아가기 포함.
          trap.progress.set(0)
          rollTargetRef.current = 0
          v = 0
          wheelLocked = true
          goTo(currentRef.current - 1)
        } else {
          p = clamp(p, 0, 1)
          trap.progress.set(p)
          rollTargetRef.current = p
        }
      } else {
        v = 0
      }
      autoRaf = requestAnimationFrame(autoLoop)
    }
    autoRaf = requestAnimationFrame(autoLoop)

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
      clearTimeout(reverseUnlockTimer)
      cancelAnimationFrame(autoRaf)
      unsubPort?.()
    }
  }, [enabled, total, slide, traps, isMobile])

  const goTo = useCallback((next: number) => goToRef.current(next), [])

  return { slide, index, goTo, source, target }
}
