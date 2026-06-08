import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import LoadingScreen from './components/LoadingScreen'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import CardStackSection from './components/CardStackSection'
import CentralVideo from './components/CentralVideo'
import './App.css'

const TOTAL_SLIDES = 3
const SLIDE_DURATION = 1.05
const SLIDE_EASE = [0.77, 0, 0.175, 1]
const COOLDOWN_MS = 220
const DESIGN_WIDTH = 1440

// Tracks the design frame size — capped at DESIGN_WIDTH so that on wider
// viewports the layout (and the scroll-driven video position) is positioned
// as if the screen were 1440px wide, with the rest showing as side margins.
function useFrameSize() {
  const [size, setSize] = useState(() => ({
    w:
      typeof window !== 'undefined'
        ? Math.min(window.innerWidth, DESIGN_WIDTH)
        : DESIGN_WIDTH,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  }))
  useEffect(() => {
    const update = () =>
      setSize({
        w: Math.min(window.innerWidth, DESIGN_WIDTH),
        h: window.innerHeight,
      })
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const frame = useFrameSize()

  // slide progress: 0 = hero, 1 = about. Real number — animates smoothly between.
  const slide = useMotionValue(0)

  // Slide 0: 690 square centered. Slide 1: 354 square anchored 124 from top
  // and 225 from the frame's right edge. Translate deltas computed against
  // the CSS anchor at frame center.
  // Slide-1 center = (frame.w - 225 - 177, 124 + 177) = (frame.w - 402, 301)
  const videoScale = useTransform(slide, [0, 1], [1, 354 / 690])
  const videoX = useTransform(slide, [0, 1], [0, frame.w / 2 - 402])
  const videoY = useTransform(slide, [0, 1], [0, 301 - frame.h / 2])

  // Background and hero content opacity follow slide
  // Stays dark through the about slide, then snaps back to white as the
  // user moves into the cards slide (1.5 → 2.0).
  const bg = useTransform(
    slide,
    [0, 0.6, 1, 1.5, 2],
    ['#ffffff', '#1a1a1a', '#0a0a0a', '#0a0a0a', '#ffffff']
  )
  const heroOpacity = useTransform(slide, [0, 0.55], [1, 0])

  // Fade the central video out before reaching the cards slide so the deck
  // has the stage to itself.
  const videoOpacity = useTransform(slide, [1.3, 1.75], [1, 0])

  // Track translate
  const trackY = useTransform(slide, (v) => `${-v * 100}vh`)

  // Toggle a body class so the video can disable mix-blend-mode on the dark
  // slide — multiply against a near-black background would kill the object.
  // Temporary until a true alpha-channel video is in place.
  useEffect(() => {
    const unsub = slide.on('change', (v) => {
      document.body.classList.toggle('is-dark', v > 0.55)
    })
    return () => unsub()
  }, [slide])

  // Snap controller
  useEffect(() => {
    if (loading) return

    let current = 0
    let isAnimating = false
    let cooldownTimer = null

    const goTo = (next) => {
      next = Math.max(0, Math.min(TOTAL_SLIDES - 1, next))
      if (next === current || isAnimating) return
      current = next
      isAnimating = true
      animate(slide, next, {
        duration: SLIDE_DURATION,
        ease: SLIDE_EASE,
        onComplete: () => {
          clearTimeout(cooldownTimer)
          cooldownTimer = setTimeout(() => {
            isAnimating = false
          }, COOLDOWN_MS)
        },
      })
    }

    let wheelAccum = 0
    let wheelResetTimer = null
    const onWheel = (e) => {
      e.preventDefault()
      if (isAnimating) return
      wheelAccum += e.deltaY
      clearTimeout(wheelResetTimer)
      wheelResetTimer = setTimeout(() => (wheelAccum = 0), 180)
      if (wheelAccum > 40) {
        wheelAccum = 0
        goTo(current + 1)
      } else if (wheelAccum < -40) {
        wheelAccum = 0
        goTo(current - 1)
      }
    }

    let touchStartY = 0
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    const onTouchMove = (e) => {
      e.preventDefault()
    }
    const onTouchEnd = (e) => {
      const delta = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(delta) < 50) return
      if (delta > 0) goTo(current + 1)
      else goTo(current - 1)
    }

    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        goTo(current + 1)
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goTo(current - 1)
      }
      if (e.key === 'Home') goTo(0)
      if (e.key === 'End') goTo(TOTAL_SLIDES - 1)
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
      clearTimeout(cooldownTimer)
      clearTimeout(wheelResetTimer)
    }
  }, [loading, slide])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      {loading && (
        <LoadingScreen
          onComplete={() => {
            setLoading(false)
            setTimeout(() => setStarted(true), 120)
          }}
        />
      )}

      {/* Full-viewport background — bleeds into the side margins on screens
          wider than 1440 so the empty area picks up the same slide color. */}
      <motion.div className="app-bg" style={{ background: bg }} />

      {/* The frame ALSO carries the same background so that the central
          video's mix-blend-mode has an in-stacking-context backdrop to blend
          against. Without this, the .app's transform-induced stacking context
          would trap the blend and the multiply/lighten swap at slide 0.55
          shows up as a hard "white flash" instead of a smooth color shift. */}
      <motion.div className="app" style={{ background: bg }}>
        <CentralVideo
          scale={videoScale}
          x={videoX}
          y={videoY}
          opacity={videoOpacity}
          shouldPlay={started}
        />

        <div className="slides">
          <motion.div className="slides__track" style={{ y: trackY }}>
            <HeroSection
              contentOpacity={heroOpacity}
              started={started}
              slide={slide}
            />
            <AboutSection slide={slide} />
            <CardStackSection slide={slide} started={started} />
          </motion.div>
        </div>

        <Header started={started} slide={slide} />
      </motion.div>
    </>
  )
}
