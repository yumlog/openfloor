import type { Variants } from 'motion/react'
import { SLIDE_EASE } from '@/config/slides'

/* ---------------------------------------------------------------------------
   Shared entry-animation variants. Sections drive these with `active` so the
   animation replays on every (re)entry:
     initial="hidden" animate={active ? 'show' : 'hidden'}
   Used by both Hero and About.
--------------------------------------------------------------------------- */

/** Fade + rise — the default supporting-content entrance. */
export const RISE: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

/** Plain fade — for elements that shouldn't shift position. */
export const FADE: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

/** Standard entry duration. */
export const ENTRY_DURATION = 0.6

/** Build a transition with the shared duration / ease and a per-element delay. */
export const entryTransition = (delay = 0) => ({
  delay,
  duration: ENTRY_DURATION,
  ease: SLIDE_EASE,
})
