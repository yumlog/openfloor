import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { cn } from '@/lib/cn'
import type { Project } from './projects'

/* ---------------------------------------------------------------------------
   Portfolio carousel — an arc "wheel" of identical cards.

   ONE continuous motion value, `rotation`, drives everything. For card i the
   center-relative offset is the SHORTEST wrapped distance p = wrap(i - rotation)
   over the ring of N cards, so the wheel loops infinitely in both directions.
   Each card is then placed on a circle of radius R, stepping ANG° per slot:

       x      = R · sin(p·ANG)        (fan out left/right)
       y      = R · (1 − cos(p·ANG))  (sides dip below the upright center card)
       rotate = p·ANG                 (tilt only — every card keeps its size)
       zIndex = 100 − |p|·10          (center on top)

   With R≈1280 / ANG≈14° the center card stands upright, ±1 sit beside it, and
   ±2 peek in clipped at the frame edges (5 visible); |p| past ~2.4 fades out.

   Everything is authored in 1440-design px on a fixed canvas that the parent
   transform:scale(ratio)'s — same approach as the Philosophy deck.
--------------------------------------------------------------------------- */

const CANVAS_W = 1440
const CANVAS_H = 600
const CARD_W = 320
const CARD_H = 420

const R = 1280
const ANG = 14 // degrees per slot
const ANG_RAD = (ANG * Math.PI) / 180

const PX_PER_STEP = 320 // screen px dragged ≈ one card step
const CLICK_SLOP = 8 // movement under this (px) counts as a click, not a drag
const AUTO_MS = 2000 // auto-advance interval

const SPRING = { type: 'spring', stiffness: 140, damping: 22 } as const
const AUTO_TWEEN = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const

/** Shortest signed distance of `d` on a ring of size `n` → (-n/2, n/2]. */
function wrap(d: number, n: number) {
  const m = ((d % n) + n) % n
  return m > n / 2 ? m - n : m
}

/** Perceived-luminance test so card text contrasts the brand fill. */
function isLightColor(hex: string) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

interface PortfolioCardProps {
  project: Project
  index: number
  count: number
  rotation: MotionValue<number>
  onPointerDownCard: (e: ReactPointerEvent, index: number) => void
}

/** One card, positioned on the arc purely from the shared `rotation` value. */
function PortfolioCard({
  project,
  index,
  count,
  rotation,
  onPointerDownCard,
}: PortfolioCardProps) {
  const p = useTransform(rotation, (r) => wrap(index - r, count))
  const x = useTransform(p, (v) => R * Math.sin(v * ANG_RAD))
  const y = useTransform(p, (v) => R * (1 - Math.cos(v * ANG_RAD)))
  const rotate = useTransform(p, (v) => v * ANG)
  const zIndex = useTransform(p, (v) => Math.round(100 - Math.abs(v) * 10))
  // Fade the cards that swing past the visible arc; also drop their pointer
  // events so an invisible card can't intercept a click.
  const opacity = useTransform(p, [-2.6, -2.2, 2.2, 2.6], [0, 1, 1, 0])
  const pointerEvents = useTransform(opacity, (o) =>
    o < 0.05 ? 'none' : 'auto'
  )
  const light = isLightColor(project.color)

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 cursor-pointer select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        marginLeft: -CARD_W / 2,
        marginTop: -CARD_H / 2,
        x,
        y,
        rotate,
        zIndex,
        opacity,
        pointerEvents,
      }}
      onPointerDown={(e) => onPointerDownCard(e, index)}
    >
      {/* Flat brand-color placeholder (real artwork replaces this later). */}
      <div
        className="flex h-full w-full items-center justify-center rounded-[16px] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: project.color }}
      >
        <span
          className={cn(
            'text-[22px] font-bold tracking-[-0.04em]',
            light ? 'text-black/55' : 'text-white/85'
          )}
        >
          {project.name}
        </span>
      </div>
    </motion.div>
  )
}

interface PortfolioCarouselProps {
  projects: Project[]
  /** True while Portfolio is the active slide — gates fade-in + auto-rotate. */
  active: boolean
  /** True while the detail modal is open — freezes the wheel on the open card. */
  modalOpen: boolean
  /** frame.w / 1440 (<=1) — scales the whole design canvas fluidly. */
  ratio: number
  /** Open the detail modal for `index` (the card clicked / centered). */
  onOpen: (index: number) => void
}

export function PortfolioCarousel({
  projects,
  active,
  modalOpen,
  ratio,
  onOpen,
}: PortfolioCarouselProps) {
  const count = projects.length
  const rotation = useMotionValue(0)
  const [centerIndex, setCenterIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const controls = useRef<ReturnType<typeof animate> | null>(null)
  const drag = useRef<{
    startX: number
    startRot: number
    index: number
    moved: number
  } | null>(null)

  // Auto-rotate is paused while interacting, modal-open, or off-screen.
  const paused = hovered || dragging || modalOpen || !active

  // Track the rounded centered card (for the brand name below the wheel).
  useMotionValueEvent(rotation, 'change', (v) => {
    const idx = ((Math.round(v) % count) + count) % count
    setCenterIndex((prev) => (prev === idx ? prev : idx))
  })

  // Snap the given card to center, then open its modal.
  const focusAndOpen = (index: number) => {
    const base = rotation.get()
    controls.current?.stop()
    controls.current = animate(
      rotation,
      base + wrap(index - base, count),
      SPRING
    )
    onOpen(index)
  }

  // Stable window listeners (added on pointer-down, removed on up). Refs hold
  // the latest closure so the listener identity stays constant for removal.
  const moveRef = useRef<(e: PointerEvent) => void>(() => {})
  const upRef = useRef<(e: PointerEvent) => void>(() => {})
  const moveListener = useRef((e: PointerEvent) => moveRef.current(e)).current
  const upListener = useRef((e: PointerEvent) => upRef.current(e)).current

  moveRef.current = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    d.moved = Math.max(d.moved, Math.abs(dx))
    if (d.moved > CLICK_SLOP && !dragging) setDragging(true)
    rotation.set(d.startRot - dx / PX_PER_STEP)
  }

  upRef.current = () => {
    window.removeEventListener('pointermove', moveListener)
    window.removeEventListener('pointerup', upListener)
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (!d) return
    if (d.moved <= CLICK_SLOP) {
      // A click (no real drag) → center that card and open it.
      focusAndOpen(d.index)
    } else {
      // A drag → settle on the nearest card.
      controls.current?.stop()
      controls.current = animate(rotation, Math.round(rotation.get()), SPRING)
    }
  }

  const onPointerDownCard = (e: ReactPointerEvent, index: number) => {
    controls.current?.stop()
    drag.current = {
      startX: e.clientX,
      startRot: rotation.get(),
      index,
      moved: 0,
    }
    window.addEventListener('pointermove', moveListener)
    window.addEventListener('pointerup', upListener)
  }

  // Auto-advance one card every AUTO_MS while running.
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      controls.current?.stop()
      controls.current = animate(
        rotation,
        Math.round(rotation.get()) + 1,
        AUTO_TWEEN
      )
    }, AUTO_MS)
    return () => clearInterval(id)
  }, [paused, rotation])

  // Clean up dangling window listeners on unmount.
  useEffect(
    () => () => {
      window.removeEventListener('pointermove', moveListener)
      window.removeEventListener('pointerup', upListener)
    },
    [moveListener, upListener]
  )

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Wheel — fades/rises in on every (re)entry. */}
      <motion.div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="relative shrink-0"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${ratio})`,
          }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          {projects.map((proj, i) => (
            <PortfolioCard
              key={proj.id}
              project={proj}
              index={i}
              count={count}
              rotation={rotation}
              onPointerDownCard={onPointerDownCard}
            />
          ))}
        </div>
      </motion.div>

      {/* Centered brand name — separate from the wheel. Crosses over (old up /
          new in from below) as the centered card changes. Its bottom sits the
          section's bottom margin (100px) above the slide edge. */}
      <div className="relative flex min-h-[clamp(28px,2.78vw,40px)] shrink-0 items-start justify-center pb-[clamp(58px,6.94vw,100px)]">
        <AnimatePresence>
          <motion.p
            key={centerIndex}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="text-card-name absolute inset-x-0 text-center text-[clamp(13px,1.39vw,20px)] leading-[1.4] font-bold tracking-[-0.04em]"
          >
            {projects[centerIndex].name}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
