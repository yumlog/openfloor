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

// Standing deck card size + fan offsets (philosophy-standing.png).
const DECK_W = 360
const DECK_H = 440
const FAN_X = 60
const FAN_Y = 26
const FAN_Z = 90
const FAN_ROTY = -26
const FAN_RZ = 3
const HOVER_LIFT = 24

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
        perspective: 2000,
        transformStyle: 'preserve-3d',
      }}
    >
      {PHILOSOPHY_CARDS.map((card, i) => {
        const t = targetFor(i, selected, hovered)
        const isSelected = selected === i
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
                className="absolute inset-0 bg-black/35"
                animate={{ opacity: isSelected ? 1 : 0 }}
                transition={FADE}
              />
              {/* Body + closing quote — only on the centered card. */}
              <motion.div
                className="absolute inset-0 px-[48px] py-[60px]"
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

            {/* Name below the card — shown only when expanded. */}
            <motion.p
              className="text-card-name absolute top-full right-0 left-0 mt-[28px] text-center text-[20px] leading-[1.4] font-bold tracking-[-0.04em]"
              animate={{ opacity: selected !== null ? 1 : 0 }}
              transition={FADE}
            >
              {card.name}
            </motion.p>
          </motion.div>
        )
      })}

      {/* Standing hover label — the hovered deck card's name, bottom-right. */}
      <motion.p
        className="text-card-name absolute right-[60px] bottom-[40px] text-[20px] leading-[1.4] font-bold tracking-[-0.04em]"
        animate={{
          opacity: selected === null && hovered !== null ? 1 : 0,
        }}
        transition={FADE}
      >
        {hovered !== null ? PHILOSOPHY_CARDS[hovered].name : ''}
      </motion.p>
    </div>
  )
}
