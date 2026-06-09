import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, type MotionValue } from 'motion/react'
import { SLIDE_DURATION, SLIDE_EASE, SLIDES } from '@/config/slides'

export interface SlideController {
  /** Real-valued slide progress (0 = first section). Drives all animation. */
  slide: MotionValue<number>
  /** Nearest integer slide — for scroll-spy / active nav state. */
  index: number
  /** Programmatically snap to a section (used by header nav). */
  goTo: (next: number) => void
}

interface TrapOptions {
  /** Slide index that "captures" the scroll. */
  index: number
  /** Number of notches a full gesture sweep moves the trapped progress over. */
  steps: number
  /** 0..1 progress the trapped slide drives (e.g. the manifesto drum roll). */
  progress: MotionValue<number>
}

interface Options {
  /** Number of sections. */
  total: number
  /** Gate input handling (e.g. while a loading screen is up). */
  enabled?: boolean
  /**
   * Optional "scroll trap": while parked on `trap.index`, input drives
   * `trap.progress` (0..1) instead of snapping to the next section — wheel /
   * touch roll it proportionally with spring inertia, keyboard moves one notch
   * (1/steps). Input only escapes the slide once the progress is pinned at the
   * matching end and keeps pushing. Used by the Manifesto drum.
   */
  trap?: TrapOptions
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

/* Gesture thresholds. */
const WHEEL_THRESHOLD = 40
const WHEEL_RESET_MS = 180
const TOUCH_THRESHOLD = 50
/* A single discrete drum-roll notch (keyboard / replayed gesture). Softer than
   the section-snap ease (SLIDE_EASE has a hard slow-in that reads as a lurch); a
   gentle ease-out glides line to line. */
const ROLL_DURATION = 0.55
const ROLL_EASE = [0.22, 1, 0.36, 1] as const
/* Trapped-slide roll for wheel / touch: the input distance moves the target
   proportionally (px * SENS) and a velocity-carrying spring chases it, so a hard
   flick whooshes through lines and a small nudge inches one along. */
const ROLL_SENSITIVITY = 0.0012
const ROLL_EPS = 1e-3

/**
 * One gesture = one section snap. Hijacks wheel / touch / keyboard, drives a
 * single `slide` motion value with a cooldown so fast scrolls don't skip
 * sections. Also owns body scroll lock and the `is-dark` class used by the
 * central video blend.
 */
export function useSlideController({
  total,
  enabled = true,
  trap,
}: Options): SlideController {
  const slide = useMotionValue(0)
  const [index, setIndex] = useState(0)

  const currentRef = useRef(0)
  const animatingRef = useRef(false)
  // True while a single discrete drum-roll notch is animating (keyboard) —
  // blocks extra notches so one key press moves the trapped progress one step.
  const rollAnimatingRef = useRef(false)
  // Where the trapped roll is heading (0..1). Wheel/touch re-target this each
  // event; kept in sync on seat + discrete notches so edge detection is exact.
  const rollTargetRef = useRef(0)
  // Direction (+1 / -1) of a gesture made mid-animation, replayed once it ends.
  const queuedDirRef = useRef(0)
  // Stable handle so the returned goTo identity never changes.
  const goToRef = useRef<(next: number) => void>(() => {})

  // Lock the page; the track translate is our only scroll.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Scroll-spy index + dark-mode toggle for the video blend. `is-dark` follows
  // the current slide's configured theme (not an arbitrary progress threshold),
  // so the dark-blend treatment holds for the whole time the video is on a dark
  // slide (hero + about).
  useEffect(() => {
    const apply = (v: number) => {
      const next = clamp(Math.round(v), 0, SLIDES.length - 1)
      setIndex((prev) => (prev === next ? prev : next))
      document.body.classList.toggle('is-dark', SLIDES[next]?.theme === 'dark')
    }
    apply(slide.get())
    const unsub = slide.on('change', apply)
    return () => unsub()
  }, [slide])

  // Input handling.
  useEffect(() => {
    const goTo = (next: number) => {
      next = clamp(next, 0, total - 1)
      if (next === currentRef.current || animatingRef.current) return
      const from = currentRef.current
      // Entering the trapped slide: seat the drum at the matching end so it
      // rolls forward from the top (entered going down) or backward from the
      // bottom (entered coming back up).
      if (trap && next === trap.index) {
        const seat = next > from ? 0 : 1
        trap.progress.set(seat)
        rollTargetRef.current = seat
      }
      currentRef.current = next
      animatingRef.current = true
      animate(slide, next, {
        duration: SLIDE_DURATION,
        ease: SLIDE_EASE,
        onComplete: () => {
          animatingRef.current = false
          // Replay a gesture that arrived mid-animation: step once more (via the
          // gate, so a replay landing on the trapped slide rolls the drum rather
          // than skipping it) the instant the snap settles.
          const dir = queuedDirRef.current
          if (dir !== 0) {
            queuedDirRef.current = 0
            step(dir)
          }
        },
      })
    }
    goToRef.current = goTo

    // One directional step. If a snap is in flight, don't drop the input — keep
    // the latest direction and let onComplete replay it. No post-snap dead time;
    // the wheel accumulator below is what keeps one gesture to one step.
    const step = (dir: number) => {
      // Scroll-trap gate (DISCRETE path — keyboard + replayed gestures): while
      // parked on the trapped slide, a step moves the drum exactly one notch
      // instead of snapping sections. Wheel / touch use the proportional path
      // below; this keeps `rollTargetRef` in sync so both agree on the edges.
      // Only when the drum is already at the matching end does the step fall
      // through and advance out of the slide.
      if (trap && !animatingRef.current && currentRef.current === trap.index) {
        if (rollAnimatingRef.current) return // one press = one notch
        const p = rollTargetRef.current
        const sz = 1 / trap.steps
        if (dir > 0 && p < 1 - ROLL_EPS) {
          rollAnimatingRef.current = true
          rollTargetRef.current = Math.min(1, p + sz)
          animate(trap.progress, rollTargetRef.current, {
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
          animate(trap.progress, rollTargetRef.current, {
            duration: ROLL_DURATION,
            ease: ROLL_EASE,
            onComplete: () => {
              rollAnimatingRef.current = false
            },
          })
          return
        }
        // At an end — fall through to advance out of the trap.
      }

      if (animatingRef.current) {
        queuedDirRef.current = dir
      } else {
        goTo(currentRef.current + dir)
      }
    }

    // Parked on the trapped slide, not mid section-snap?
    const inTrap = () =>
      !!trap && !animatingRef.current && currentRef.current === trap.index

    // Re-target the proportional drum roll. A velocity-carrying spring chases
    // the target, so re-targeting mid-flick keeps the momentum (whoosh) while a
    // single small nudge just eases a little.
    const rollTo = (target: number) => {
      if (!trap) return
      rollTargetRef.current = clamp(target, 0, 1)
      animate(trap.progress, rollTargetRef.current, {
        type: 'spring',
        stiffness: 120,
        damping: 24,
      })
    }

    if (!enabled) return

    // Wheel: accumulate delta, fire once past threshold, reset between bursts.
    let wheelAccum = 0
    // Separate accumulator for "pushing past an end" while trapped, so the roll
    // and the section-advance don't share state.
    let rollEdgeAccum = 0
    let wheelResetTimer: ReturnType<typeof setTimeout>
    const resetWheel = () => {
      wheelAccum = 0
      rollEdgeAccum = 0
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      // Trapped slide: roll the drum proportionally with inertia. Only once
      // pinned at an end and still pushing does an accumulated burst advance out.
      if (inTrap()) {
        const t = rollTargetRef.current
        const pushingPastEnd =
          (e.deltaY > 0 && t >= 1 - ROLL_EPS) ||
          (e.deltaY < 0 && t <= ROLL_EPS)
        if (!pushingPastEnd) {
          resetWheel()
          rollTo(t + e.deltaY * ROLL_SENSITIVITY)
          return
        }
        rollEdgeAccum += e.deltaY
        clearTimeout(wheelResetTimer)
        wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS)
        if (rollEdgeAccum > WHEEL_THRESHOLD) {
          resetWheel()
          step(1)
        } else if (rollEdgeAccum < -WHEEL_THRESHOLD) {
          resetWheel()
          step(-1)
        }
        return
      }

      wheelAccum += e.deltaY
      clearTimeout(wheelResetTimer)
      wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS)
      if (wheelAccum > WHEEL_THRESHOLD) {
        resetWheel()
        step(1)
      } else if (wheelAccum < -WHEEL_THRESHOLD) {
        resetWheel()
        step(-1)
      }
    }

    // Touch: while trapped the drum follows the finger proportionally; otherwise
    // compare start/end Y and step on a decisive swipe.
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
        const t = rollTargetRef.current
        const pushingPastEnd =
          (dy > 0 && t >= 1 - ROLL_EPS) || (dy < 0 && t <= ROLL_EPS)
        if (!pushingPastEnd) rollTo(t + dy * ROLL_SENSITIVITY)
      }
    }
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY - e.changedTouches[0].clientY
      // Trapped: the finger already rolled the drum; only a decisive swipe while
      // pinned at an end advances out of the slide.
      if (inTrap()) {
        const t = rollTargetRef.current
        if (delta > TOUCH_THRESHOLD && t >= 1 - ROLL_EPS) step(1)
        else if (delta < -TOUCH_THRESHOLD && t <= ROLL_EPS) step(-1)
        return
      }
      if (Math.abs(delta) < TOUCH_THRESHOLD) return
      step(delta > 0 ? 1 : -1)
    }

    // Keyboard.
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
  }, [enabled, total, slide, trap])

  const goTo = useCallback((next: number) => goToRef.current(next), [])

  return { slide, index, goTo }
}
