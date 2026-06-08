import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, type MotionValue } from 'motion/react'
import { COOLDOWN_MS, SLIDE_DURATION, SLIDE_EASE, SLIDES } from '@/config/slides'

export interface SlideController {
  /** Real-valued slide progress (0 = first section). Drives all animation. */
  slide: MotionValue<number>
  /** Nearest integer slide — for scroll-spy / active nav state. */
  index: number
  /** Programmatically snap to a section (used by header nav). */
  goTo: (next: number) => void
}

interface Options {
  /** Number of sections. */
  total: number
  /** Gate input handling (e.g. while a loading screen is up). */
  enabled?: boolean
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

/* Gesture thresholds. */
const WHEEL_THRESHOLD = 40
const WHEEL_RESET_MS = 180
const TOUCH_THRESHOLD = 50

/**
 * One gesture = one section snap. Hijacks wheel / touch / keyboard, drives a
 * single `slide` motion value with a cooldown so fast scrolls don't skip
 * sections. Also owns body scroll lock and the `is-dark` class used by the
 * central video blend.
 */
export function useSlideController({
  total,
  enabled = true,
}: Options): SlideController {
  const slide = useMotionValue(0)
  const [index, setIndex] = useState(0)

  const currentRef = useRef(0)
  const animatingRef = useRef(false)
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
      currentRef.current = next
      animatingRef.current = true
      let cooldownTimer: ReturnType<typeof setTimeout>
      animate(slide, next, {
        duration: SLIDE_DURATION,
        ease: SLIDE_EASE,
        onComplete: () => {
          cooldownTimer = setTimeout(() => {
            animatingRef.current = false
          }, COOLDOWN_MS)
        },
      })
      return () => clearTimeout(cooldownTimer)
    }
    goToRef.current = goTo

    if (!enabled) return

    // Wheel: accumulate delta, fire once past threshold, reset between bursts.
    let wheelAccum = 0
    let wheelResetTimer: ReturnType<typeof setTimeout>
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (animatingRef.current) return
      wheelAccum += e.deltaY
      clearTimeout(wheelResetTimer)
      wheelResetTimer = setTimeout(() => (wheelAccum = 0), WHEEL_RESET_MS)
      if (wheelAccum > WHEEL_THRESHOLD) {
        wheelAccum = 0
        goTo(currentRef.current + 1)
      } else if (wheelAccum < -WHEEL_THRESHOLD) {
        wheelAccum = 0
        goTo(currentRef.current - 1)
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
      goTo(currentRef.current + (delta > 0 ? 1 : -1))
    }

    // Keyboard.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        goTo(currentRef.current + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goTo(currentRef.current - 1)
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
  }, [enabled, total, slide])

  const goTo = useCallback((next: number) => goToRef.current(next), [])

  return { slide, index, goTo }
}
