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
   * Optional "scroll trap": while parked on `trap.index`, each gesture advances
   * `trap.progress` by one notch (1/steps) instead of snapping to the next
   * section. The gesture only escapes the slide once the progress has reached
   * the matching end. Used by the Manifesto drum.
   */
  trap?: TrapOptions
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

/* Gesture thresholds. */
const WHEEL_THRESHOLD = 40
const WHEEL_RESET_MS = 180
const TOUCH_THRESHOLD = 50
/* A single drum-roll notch. Softer than the section-snap ease (SLIDE_EASE has a
   hard slow-in that reads as a lurch); a gentle ease-out glides line to line. */
const ROLL_DURATION = 0.55
const ROLL_EASE = [0.22, 1, 0.36, 1] as const

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
  // True while a single drum-roll notch is animating — blocks extra notches so
  // one gesture moves the trapped progress exactly one step.
  const rollAnimatingRef = useRef(false)
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
        trap.progress.set(next > from ? 0 : 1)
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
      // Scroll-trap gate: while parked on the trapped slide, each gesture moves
      // the drum one notch instead of snapping sections. Only when the drum is
      // already at the matching end does the gesture fall through and advance
      // out of the slide.
      if (trap && !animatingRef.current && currentRef.current === trap.index) {
        if (rollAnimatingRef.current) return // one gesture = one notch
        const p = trap.progress.get()
        const sz = 1 / trap.steps
        const eps = 1e-3
        if (dir > 0 && p < 1 - eps) {
          rollAnimatingRef.current = true
          animate(trap.progress, Math.min(1, p + sz), {
            duration: ROLL_DURATION,
            ease: ROLL_EASE,
            onComplete: () => {
              rollAnimatingRef.current = false
            },
          })
          return
        }
        if (dir < 0 && p > eps) {
          rollAnimatingRef.current = true
          animate(trap.progress, Math.max(0, p - sz), {
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

    if (!enabled) return

    // Wheel: accumulate delta, fire once past threshold, reset between bursts.
    let wheelAccum = 0
    let wheelResetTimer: ReturnType<typeof setTimeout>
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      wheelAccum += e.deltaY
      clearTimeout(wheelResetTimer)
      wheelResetTimer = setTimeout(() => (wheelAccum = 0), WHEEL_RESET_MS)
      if (wheelAccum > WHEEL_THRESHOLD) {
        wheelAccum = 0
        step(1)
      } else if (wheelAccum < -WHEEL_THRESHOLD) {
        wheelAccum = 0
        step(-1)
      }
    }

    // Touch: compare start/end Y, ignore small swipes.
    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY - e.changedTouches[0].clientY
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
