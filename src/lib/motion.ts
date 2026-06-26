import type { Variants } from 'motion/react'
import { SLIDE_EASE } from '@/config/slides'

/* ---------------------------------------------------------------------------
   공용 진입 애니메이션 variants. 섹션이 `active`로 구동해 (재)진입할 때마다
   애니메이션이 다시 재생된다:
     initial="hidden" animate={active ? 'show' : 'hidden'}
   Hero와 About 양쪽에서 사용.
--------------------------------------------------------------------------- */

/** 페이드 + 상승 — 기본 보조 콘텐츠 진입. */
export const RISE: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

/** 단순 페이드 — 위치가 움직이면 안 되는 요소용. */
export const FADE: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

/** 표준 진입 지속 시간. */
export const ENTRY_DURATION = 0.6

/** 공용 duration / ease + 요소별 delay로 transition을 만든다. */
export const entryTransition = (delay = 0) => ({
  delay,
  duration: ENTRY_DURATION,
  ease: SLIDE_EASE,
})

/**
 * `active` 토글로 (재)진입 애니메이션을 재생하는 motion props 묶음. variants만
 * 갈아끼우면 rise / fade가 된다 — 섹션이 `{...riseProps(RISE, active, delay)}`로 스프레드.
 */
export const entryProps = (variants: Variants, active: boolean, delay = 0) => ({
  variants,
  initial: 'hidden' as const,
  animate: (active ? 'show' : 'hidden') as 'show' | 'hidden',
  transition: entryTransition(delay),
})
