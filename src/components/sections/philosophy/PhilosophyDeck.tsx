import { useEffect, useState } from 'react'
import { motion, type TargetAndTransition, type Transition } from 'motion/react'
import { cn } from '@/lib/cn'
import { PHILOSOPHY_CARDS } from './cards'

/* ---------------------------------------------------------------------------
   Philosophy deck — the desktop state machine.

   Two states driven by `selected` (the centered card index, or null):
     standing   selected === null   3 cards fanned into a 3D deck.
     expanded   selected !== null   flat 3-up; selected card centered (body +
                                     scrim + closing quote), the other two on
                                     the sides (image + name only).

   Click rules: standing card -> expand it center. Side card -> slide it to
   center. Centered card -> fold back to the deck.

   EVERYTHING here is in design pixels (1440 reference). The whole stage is
   transform:scale(ratio)'d by the parent so these literals shrink fluidly with
   the frame — no per-value clamp needed inside the scaled canvas.
--------------------------------------------------------------------------- */

const CANVAS_W = 1440
const CANVAS_H = 600

// Expanded sizes (design-philosophy.png).
const CENTER = 500
const SIDE = 380
const CARD_GAP = 40
// Distance from stage center to a side-card center.
const SLOT_X = CENTER / 2 + CARD_GAP + SIDE / 2 // 480

// Standing deck card size + fan offsets (philosophy-standing.png). Big cards
// with a wide fan: front card large + lower-left, each card stepping right /
// up / back behind it.
//
// The source card is WIDER than it is tall (W ≈ H / cos(FAN_ROTY)) so that the
// Y-rotation foreshortens it back to a *square-looking* projection — a square
// source would read as a tall sliver once rotated.
const FAN_ROTY = -38
const DECK_H = 460
const DECK_W = 580 // ≈ 460 / cos(38°) -> projects ~square
// Wide step (esp. vertical) so even the back card keeps a generous exposed
// strip to hover / click — not just its right edge.
const FAN_X = 140
const FAN_Y = 64
const FAN_Z = 70
const FAN_RZ = 4
const HOVER_LIFT = 28
// Closer perspective than the default so the Y-rotation foreshortens hard
// (near edge tall, far edge short) like the reference.
const PERSPECTIVE = 1200

const TRANSITION: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 30,
  mass: 0.9,
}
const FADE: Transition = { duration: 0.35, ease: 'easeOut' }

/**
 * Target transform for card `index` given the current `selected` card and the
 * hovered card. Cards are anchored top-left at the stage center, so x/y carry a
 * -w/2 / -h/2 offset to position by the card's own center.
 */
function targetFor(
  index: number,
  selected: number | null,
  hovered: number | null
): TargetAndTransition {
  // standing — fanned deck.
  if (selected === null) {
    const isHover = hovered === index
    const cx = (index - 1) * FAN_X
    const cy = (1 - index) * FAN_Y - (isHover ? HOVER_LIFT : 0)
    return {
      width: DECK_W,
      height: DECK_H,
      x: cx - DECK_W / 2,
      y: cy - DECK_H / 2,
      rotateY: FAN_ROTY,
      rotateZ: (index - 1) * FAN_RZ,
      z: -index * FAN_Z + (isHover ? 40 : 0),
      zIndex: 30 - index * 10 + (isHover ? 5 : 0),
    }
  }

  // expanded — centered card.
  if (index === selected) {
    return {
      width: CENTER,
      height: CENTER,
      x: -CENTER / 2,
      y: -CENTER / 2,
      rotateY: 0,
      rotateZ: 0,
      z: 0,
      zIndex: 30,
    }
  }

  // expanded — side cards, preserving canonical left -> right order.
  const others = [0, 1, 2].filter((i) => i !== selected)
  const cx = others[0] === index ? -SLOT_X : SLOT_X
  return {
    width: SIDE,
    height: SIDE,
    x: cx - SIDE / 2,
    y: -SIDE / 2,
    rotateY: 0,
    rotateZ: 0,
    z: 0,
    zIndex: 20,
  }
}

interface PhilosophyDeckProps {
  /** True while Philosophy is the active slide — resets to the deck on exit. */
  active: boolean
  /** frame.w / 1440 (<=1) — scales the whole design canvas fluidly. */
  ratio: number
}

export function PhilosophyDeck({ active, ratio }: PhilosophyDeckProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  // Leaving the section folds the deck back so re-entry starts at standing.
  useEffect(() => {
    if (!active) {
      setSelected(null)
      setHovered(null)
    }
  }, [active])

  const handleClick = (i: number) =>
    setSelected((prev) => (prev === null ? i : prev === i ? null : i))

  return (
    <div
      className="relative shrink-0"
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
        transform: `scale(${ratio})`,
        perspective: PERSPECTIVE,
        transformStyle: 'preserve-3d',
      }}
    >
      {PHILOSOPHY_CARDS.map((card, i) => {
        const t = targetFor(i, selected, hovered)
        const isSelected = selected === i
        const standing = selected === null
        return (
          <motion.div
            key={card.id}
            className="absolute top-1/2 left-1/2 cursor-pointer select-none"
            style={{ transformStyle: 'preserve-3d' }}
            animate={t}
            transition={TRANSITION}
            onClick={() => handleClick(i)}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered((h) => (h === i ? null : h))}
          >
            {/* Image placeholder — clips the scrim + body to the rounded card. */}
            <div
              className={cn(
                'absolute inset-0 overflow-hidden rounded-[20px]',
                card.tint
              )}
            >
              {/* Scrim for white-text legibility — only on the centered card. */}
              <motion.div
                className="pointer-events-none absolute inset-0 bg-black/35"
                animate={{ opacity: isSelected ? 1 : 0 }}
                transition={FADE}
              />
              {/* Body + closing quote — only on the centered card. */}
              <motion.div
                className="pointer-events-none absolute inset-0 px-[48px] py-[60px]"
                animate={{ opacity: isSelected ? 1 : 0 }}
                transition={FADE}
                aria-hidden={!isSelected}
              >
                <p className="text-title-on-dark text-[32px] leading-[1.4] font-medium tracking-[-0.05em]">
                  {card.body}
                </p>
                <span className="text-title-on-dark absolute right-[48px] bottom-[40px] h-[84px] w-[84px] text-[120px] leading-[0.7] font-bold">
                  &rdquo;
                </span>
              </motion.div>
            </div>

            {/* Standing hover label — the card's own name at its bottom-right,
                so it tracks the hovered card. It lives OUTSIDE the overflow-hidden
                image (no clipping), stays on one line (nowrap), and is
                counter-rotated out of the deck's Y/Z tilt so it reads flat. The
                forward z-lift keeps the (counter-rotated) label fully in front of
                the card plane instead of dipping behind it. */}
            <motion.p
              className="text-card-name pointer-events-none absolute right-[28px] bottom-[24px] text-[24px] leading-[1.4] font-bold tracking-[-0.04em] whitespace-nowrap"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{
                opacity: standing && hovered === i ? 1 : 0,
                rotateY: -FAN_ROTY,
                rotateZ: -(i - 1) * FAN_RZ,
                z: 120,
              }}
              transition={FADE}
            >
              {card.name}
            </motion.p>

            {/* Name below the card — shown only when expanded. */}
            <motion.p
              className="text-card-name pointer-events-none absolute top-full right-0 left-0 mt-[28px] text-center text-[20px] leading-[1.4] font-bold tracking-[-0.04em]"
              animate={{ opacity: selected !== null ? 1 : 0 }}
              transition={FADE}
            >
              {card.name}
            </motion.p>
          </motion.div>
        )
      })}
    </div>
  )
}
