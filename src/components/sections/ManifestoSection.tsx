import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'

/* ---------------------------------------------------------------------------
   Manifesto — 슬라이드 5, 다크(#171717). 아홉 줄을 3D 원통("드럼")에 감아 두고,
   스크롤하면 위로 굴러간다. 스크롤 엔진이 이 슬라이드를 "가두며"(useSlide
   controller의 `trap` 참조), 0..1 `progress` motion value를 먹여 이 섹션이 롤
   위치로 변환한다; 드럼이 끝에 닿아야만 추가 제스처가 슬라이드를 떠난다.

   두 스케일이 공존한다: 글자(TYPE)는 너비 기준(≥1440에서 88px, 좁은 프레임에서만
   축소, Philosophy / Portfolio처럼 `ratio`로 스케일된 캔버스 사용); 드럼(DRUM,
   반지름 + 각도 스텝)은 곡률 우선이고 고정 라인 높이에서 도출된다. 줄은 수동
   scale 없이 translate3d + rotateX로 원통에 놓이고 — PERSPECTIVE가 포어쇼트닝을
   처리해 볼록감이 자연스럽고 앞줄은 정확히 88px을 유지한다.
--------------------------------------------------------------------------- */

const def = SLIDES[5]

const LINES = [
  '우리는 결과물만',
  '전달하는 회사가',
  '아닙니다',
  '함께 문제를',
  '정의하고,',
  '올바른 방향을',
  '만들며,',
  '지속 가능한 결과를',
  '책임집니다.',
]

const DEG = Math.PI / 180

// 글자는 너비 기준 유지: ≥1440에서 88px, 좁은 프레임에서만 축소. 드럼은 곡률
// 우선(CURVATURE-FIRST): 고정 각도 스텝(STEP_ANG)과 낮은 perspective가 볼록함을
// 결정하고, RADIUS는 고정 라인 높이에서 따라 나와 앞줄이 정확히 88px을 유지한다.
// 기하는 뷰포트 독립 — 밴드는 클립만 한다 — 그래서 볼록감이 모든 높이에서 유지된다.
const FONT_PX = 88
const LINE_H = FONT_PX * 1.4 // ≈ 123 — 인접 줄 사이 고정 design-px 간격

const CANVAS_W = DESIGN_WIDTH
// 좌우 여유 공간(각 변 design px) — 너비 cap이 걸리기 전까지 가장 긴 줄을 캔버스
// 가장자리에서 이만큼 떨어뜨려 둔다.
const SIDE_PAD = 90
// 드럼 창에 적용하는 perspective(design px). 낮을수록 더 볼록 / 포어쇼트닝 강함;
// STEP_ANG와 함께 튜닝.
const PERSPECTIVE = 800
// 위/아래 마진(design px) — 드럼은 그 사이 밴드 안에서 세로 가운데로 굴러가고,
// 마진은 빈 여백으로 남는다.
const MARGIN = 100

// 인접 줄 사이 기울기 각도 — 주요 곡률 노브. 클수록 줄이 원통을 더 빨리 감아
// 더 볼록하다(그리고 보이는 줄은 적어진다).
const STEP_ANG = 24
// 인접 줄이 정면에서 라인 높이만큼 떨어지게 하는 반지름. 앞줄은 z=0으로 당겨지므로
// 반지름을 바꿔도 크기는 절대 변하지 않는다(88px 유지).
const RADIUS = LINE_H / (2 * Math.sin((STEP_ANG / 2) * DEG))
// 줄이 밴드 가장자리에 닿는, 정면으로부터의 각도 — "줄 수 / 크기" 다이얼. 낮을수록
// 줄이 적고 크다(그만큼 드럼이 더 확대되어 밴드를 채운다).
const FADE_LIMIT = 50 // 도
const COS_FADE = Math.cos(FADE_LIMIT * DEG)

// FADE_LIMIT에 놓인 줄의 투영 반높이(design px, base 스케일): 앞줄이 z=0으로
// 당겨진 상태에서 줄은 y=R·sinθ, z=-R·(1-cosθ)에 놓이므로 화면상 y는
// R·sinθ·P / (P + R·(1-cosθ))이다. 드럼은 런타임에 이 범위가 밴드를 채우도록
// 스케일된다(`fillScale` 참조).
const NATURAL_HALF_H =
  (RADIUS * Math.sin(FADE_LIMIT * DEG) * PERSPECTIVE) /
  (PERSPECTIVE + RADIUS * (1 - COS_FADE))
const NATURAL_H = 2 * NATURAL_HALF_H

const LAST_INDEX = LINES.length - 1
// 롤 범위(라인 스텝 단위). progress 0은 첫 줄을 아래 페이드 가장자리에, progress
// 1은 마지막 줄을 위 가장자리에 seat 한다. W는 그 가장자리를 라인 스텝으로 표현.
const W = FADE_LIMIT / STEP_ANG
const START_OFFSET = -W
const TRAVEL = LAST_INDEX + 2 * W

// 드럼을 통과하는 제스처 수. 고정(동적 기하에 묶이지 않음)이라 섹션을 지나는 데
// 필요한 스크롤 수가 뷰포트 크기에 따라 변하지 않는다. 클수록 = 제스처당 롤이
// 작아 = 더 부드럽다(통과 스크롤이 늘어나는 대가).
export const MANIFESTO_STEPS = 14

// 마우스가 좌우 끝까지 갔을 때 드럼 좌우 회전 최대각(아주 미세하게).
const MAX_TILT_DEG = 5

// 호버 색수차 스팟의 스크린 반경(px).
const SPOT = 90

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

interface DrumLineProps {
  /** 현재 정면에 있는 줄 위치(드럼 시작/끝이 비도록 음수 / 마지막 줄 너머까지
   *  갈 수 있음). */
  rollPos: MotionValue<number>
  index: number
  text: string
  /** 색수차 복제 레이어 span 참조 — ManifestoSection이 마스크 변수를 갱신. */
  chromaRef?: (el: HTMLSpanElement | null) => void
}

/**
 * 원통에 붙은 한 줄. 각도는 정면으로부터의 오프셋이며, 회전해 멀어질수록 페이드되고
 * ±90°(드럼의 뒤편)를 지나면 숨겨진다. 줄은 콘텐츠 크기(풀 스테이지 박스가 아님)로,
 * translate3d + rotateX로 원통 표면에 직접 놓인다 — 수동 scale이 없어 PERSPECTIVE만
 * 크기를 정한다: 앞줄(각도 0)은 y=z=0(정확히 88px)에 놓이고, 멀어지는 줄은
 * 뒤로(z<0) 가며 perspective로 작아져 자연스러운 볼록감을 만든다.
 */
function DrumLine({ rollPos, index, text, chromaRef }: DrumLineProps) {
  // (rollPos - index): rollPos가 커질수록(스크롤 다운) 줄의 각도가 증가해, 정면
  // 위로 회전해 넘어가고 다음 줄이 아래에서 올라온다.
  const angle = useTransform(rollPos, (rp) => (rp - index) * STEP_ANG)
  // cos를 remap 해서 중앙은 진하게 유지하되 줄이 밴드 가장자리(FADE_LIMIT)에서
  // 정확히 0이 되게 한다 — 마진 너머로 반쯤 보이는 흐린 줄이 없도록.
  const opacity = useTransform(angle, (a) =>
    clamp01((Math.cos(a * DEG) - COS_FADE) / (1 - COS_FADE))
  )
  // 드럼 옆면을 지나 돌아간 줄은 페인트 스킵(이미 opacity 0).
  const visibility = useTransform(angle, (a) =>
    Math.abs(a) < 90 ? 'visible' : 'hidden'
  )
  const transform = useTransform(angle, (a) => {
    const y = -RADIUS * Math.sin(a * DEG)
    const z = RADIUS * (Math.cos(a * DEG) - 1)
    return `translate(-50%, -50%) translate3d(0px, ${y}px, ${z}px) rotateX(${a}deg)`
  })

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 will-change-transform"
      style={{ transform, opacity, visibility, backfaceVisibility: 'hidden' }}
    >
      <span className="relative inline-block whitespace-nowrap">
        {/* 깨끗한 글자 */}
        <span className="text-title-on-dark text-[88px] leading-[1.4] font-bold tracking-normal">
          {text}
        </span>
        {/* 호버 스팟에서만 드러나는 색수차 복제 레이어(정확히 겹침) */}
        <span
          ref={chromaRef}
          aria-hidden
          className="manifesto-chroma text-title-on-dark text-[88px] leading-[1.4] font-bold tracking-normal"
        >
          {text}
        </span>
      </span>
    </motion.div>
  )
}

interface ManifestoSectionProps {
  /** Manifesto가 활성 슬라이드인 동안 true. */
  active: boolean
  /** useSlideController의 스크롤 트랩이 구동하는 0..1 롤 progress. */
  progress: MotionValue<number>
}

export function ManifestoSection({ active, progress }: ManifestoSectionProps) {
  const frame = useFrameSize()
  // 글자는 너비 기준 유지(≥1440에서 88px).
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  // 정규화 마우스 X(-1..1) → rotateY(deg), 스프링으로 부드럽게.
  const mouseX = useMotionValue(0)
  const tiltTarget = useTransform(
    mouseX,
    [-1, 1],
    [-MAX_TILT_DEG, MAX_TILT_DEG]
  )
  const tiltY = useSpring(tiltTarget, { stiffness: 50, damping: 14, mass: 0.6 })
  useEffect(() => {
    if (!active) {
      mouseX.set(0) // 비활성일 때 정면으로
      return
    }
    const onMove = (e: PointerEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [active, mouseX])

  // 호버 색수차: 각 chroma 레이어의 마스크 중심을 줄 로컬좌표로 갱신(active일 때만).
  const chromaRefs = useRef<(HTMLElement | null)[]>([])
  useEffect(() => {
    if (!active) {
      chromaRefs.current.forEach((el) => {
        el?.style.setProperty('--mx', '-9999px')
        el?.style.setProperty('--my', '-9999px')
      })
      return
    }
    let raf = 0
    let cx = 0
    let cy = 0
    const update = () => {
      chromaRefs.current.forEach((el) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const s = el.offsetWidth ? r.width / el.offsetWidth : 1 // 누적 스케일 보정
        el.style.setProperty('--mx', `${(cx - r.left) / s}px`)
        el.style.setProperty('--my', `${(cy - r.top) / s}px`)
        el.style.setProperty('--spot', `${SPOT / s}px`)
      })
    }
    const onMove = (e: PointerEvent) => {
      cx = e.clientX
      cy = e.clientY
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [active])

  // 캔버스는 `ratio`로 스케일되므로, 이 높이의 캔버스는 정확히 100dvh로 렌더된다 —
  // H는 design px로 표현한 뷰포트 높이.
  const H = frame.h / ratio
  // 드럼은 위/아래 마진을 뺀 밴드 안에서 굴러간다.
  const hBand = H - 2 * MARGIN

  // 가장 긴 줄을 base 88px(design px)로 측정해 fill을 가용 너비로 제한한다 —
  // 안 그러면 좁고/긴 뷰포트에서 fillScale이 1440 캔버스를 넘게 부풀어 글자가
  // 양옆으로 잘린다. 폰트 로드 후 재측정.
  const measureRef = useRef<HTMLDivElement>(null)
  const [maxLineW, setMaxLineW] = useState(0)
  useLayoutEffect(() => {
    const measure = () => {
      const el = measureRef.current
      if (!el) return
      let w = 0
      for (const child of Array.from(el.children)) {
        w = Math.max(w, (child as HTMLElement).offsetWidth)
      }
      if (w > 0) setMaxLineW(w)
    }
    measure()
    document.fonts?.ready.then(measure)
  }, [])

  // (곡률 고정) 드럼을 줌해 ±FADE_LIMIT 범위가 밴드를 채우게 한다 — 크고 진한
  // 줄로 — 단 캔버스가 가로로 담을 수 있는 것보다 넓어지지는 않게.
  const widthCap =
    maxLineW > 0 ? (CANVAS_W - 2 * SIDE_PAD) / maxLineW : Infinity
  const fillScale = Math.min(hBand / NATURAL_H, widthCap)

  // 0..1 progress → 정면 줄 위치. 아래 페이드 가장자리(첫 줄이 막 올라오기 직전)에서
  // 시작해 위 가장자리(마지막 줄이 막 사라짐)에서 끝난다.
  const rollPos = useTransform(progress, (p) => p * TRAVEL + START_OFFSET)

  return (
    <section
      id={def.id}
      className="relative flex h-dvh w-full items-center justify-center overflow-hidden"
    >
      {/* 숨겨진 너비 프로브 — 각 줄을 base 88px로, 스케일 없이(캔버스 바깥) 둬서
          offsetWidth가 진짜 design-px 줄 너비가 되게 한다. */}
      <div
        ref={measureRef}
        aria-hidden
        className="invisible absolute top-0"
        style={{ left: -99999 }}
      >
        {LINES.map((line, i) => (
          <span
            key={i}
            className="block text-[88px] leading-[1.4] font-bold tracking-normal whitespace-nowrap"
          >
            {line}
          </span>
        ))}
      </div>

      {/* 스케일된 design-px 캔버스 — 높이를 100dvh로 렌더되게 설정; 너비는 좌표계로
          1440 유지(가로 넘침은 클립). */}
      <div
        className="relative shrink-0"
        style={{
          width: CANVAS_W,
          height: H,
          transform: `scale(${ratio})`,
        }}
      >
        {/* 밴드: 위/아래 마진 사이의 클립 창. 평면(transform / perspective 없음)
            이라 overflow 클립이 유효하다. */}
        <div
          className="absolute right-0 left-0 overflow-hidden"
          style={{ top: MARGIN, bottom: MARGIN }}
        >
          {/* 스케일러: perspective를 갖고 투영된 드럼 전체를 `fillScale`로 줌해
              ±FADE_LIMIT 범위가 밴드를 채우게 한다. 스케일이 클립 바깥(이 안쪽
              레이어)에 있어 밴드 크기는 고정된다. */}
          <div
            className="absolute inset-0"
            style={{
              perspective: `${PERSPECTIVE}px`,
              transform: `scale(${fillScale})`,
            }}
          >
            {/* 원통 면을 담는 3D 스테이지. 마우스 X에 따라 perspective 안에서
                rotateY로 아주 미세하게 좌우로 돈다(세로 롤과 독립 축). */}
            <motion.div
              className="absolute inset-0"
              style={{ rotateY: tiltY, transformStyle: 'preserve-3d' }}
            >
              {LINES.map((line, i) => (
                <DrumLine
                  key={i}
                  rollPos={rollPos}
                  index={i}
                  text={line}
                  chromaRef={(el) => {
                    chromaRefs.current[i] = el
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
