import { useEffect, useState } from 'react'
import { motion, type TargetAndTransition, type Transition } from 'motion/react'
import { cn } from '@/lib/cn'
import { PHILOSOPHY_CARDS } from './cards'

/* ---------------------------------------------------------------------------
   Philosophy deck — the desktop state machine.

   Two states driven by `selected` (the centered card index, or null):
     standing   selected === null   3 identical cards stacked into a deck.
     expanded   selected !== null   flat 3-up; selected card centered (body +
                                     scrim + closing quote), the other two on
                                     the sides (image + name only).

   Click rules: standing card -> expand it center. Side card -> slide it to
   center. Centered card -> fold back to the deck.

   STANDING is a 2D oblique stack (NOT 3D perspective): every card shares the
   exact same size and skewY, stepped by a constant diagonal offset, so the
   three read as tidy identical parallelograms (vertical edges stay vertical;
   only top/bottom edges slope). This keeps hit-testing exact and the shapes
   uniform — a real perspective deck gave each card a different angle.

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

// Standing deck (philosophy-standing-name.png): identical square cards, one
// shared skew, constant up-right diagonal step. Front (index 0) sits lowest-
// left and on top; the back card steps up-right and underneath.
const DECK = 360
const SKEW = 12 // skewY, deg — "\" lean (left edge high); vertical edges stay vertical
const STEP_X = 116
const STEP_Y = 46
const HOVER_LIFT = 22

const TRANSITION: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 30,
  mass: 0.9,
}
const FADE: Transition = { duration: 0.3, ease: 'easeOut' }

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
  // standing — identical skewed cards on a constant diagonal step.
  if (selected === null) {
    const cx = (index - 1) * STEP_X
    const cy = (1 - index) * STEP_Y - (hovered === index ? HOVER_LIFT : 0)
    return {
      width: DECK,
      height: DECK,
      x: cx - DECK / 2,
      y: cy - DECK / 2,
      skewY: SKEW,
      zIndex: 30 - index * 10 + (hovered === index ? 5 : 0),
    }
  }

  // expanded — centered card.
  if (index === selected) {
    return {
      width: CENTER,
      height: CENTER,
      x: -CENTER / 2,
      y: -CENTER / 2,
      skewY: 0,
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
    skewY: 0,
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

  const standing = selected === null

  return (
    <div
      className="relative shrink-0"
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
        transform: `scale(${ratio})`,
      }}
    >
      {PHILOSOPHY_CARDS.map((card, i) => {
        const t = targetFor(i, selected, hovered)
        const isSelected = selected === i
        return (
          <motion.div
            key={card.id}
            className="absolute top-1/2 left-1/2 cursor-pointer select-none"
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

            {/* Name below the card — shown only when expanded (centered). */}
            <motion.p
              className="text-card-name pointer-events-none absolute top-full right-0 left-0 mt-[28px] text-center text-[20px] leading-[1.4] font-bold tracking-[-0.04em]"
              animate={{ opacity: selected !== null ? 1 : 0 }}
              transition={FADE}
            >
              {card.name}
            </motion.p>

            {/* Standing name — lives inside the card group, so it inherits the
                card's skew and sits right below the hovered card (reference
                "MILLA"). Shares the expanded label's style. Shown only for the
                hovered card while standing. */}
            <motion.p
              className="text-card-name pointer-events-none absolute top-full right-0 left-0 mt-[28px] text-right text-[20px] leading-[1.4] font-bold tracking-[-0.04em]"
              animate={{ opacity: standing && hovered === i ? 1 : 0 }}
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
