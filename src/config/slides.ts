/* ---------------------------------------------------------------------------
   Slide config. The whole experience is driven by a single `slide` motion
   value (0, 1, 2 …). Adding / reordering sections is done here — the engine,
   background crossfade, and nav all read from this.
--------------------------------------------------------------------------- */

export type SlideTheme = 'dark' | 'light'

export interface SlideDef {
  /** stable id, also used for the section element id */
  id: string
  /** placeholder label shown until the section is built */
  label: string
  /** which background the section sits on (drives bg crossfade + text color) */
  theme: SlideTheme
  /**
   * Optional explicit background color (raw hex) overriding the theme default
   * in the crossfade — for light sections that sit on an off-white instead of
   * pure #fff. Keep in sync with whatever the section itself paints.
   */
  bg?: string
}

/** Off-white backdrop for the Portfolio slide (carousel cards read better on it). */
export const BG_PORTFOLIO = '#fafafa'

/** Section order. Index === slide value. */
export const SLIDES: SlideDef[] = [
  { id: 'hero', label: 'Hero', theme: 'dark' },
  { id: 'about', label: 'About', theme: 'dark' },
  { id: 'philosophy', label: 'Philosophy', theme: 'light' },
  { id: 'vision', label: 'Vision', theme: 'dark' },
  { id: 'portfolio', label: 'Portfolio', theme: 'light', bg: BG_PORTFOLIO },
  { id: 'contact', label: 'Contact', theme: 'dark' },
]

export const TOTAL_SLIDES = SLIDES.length

/** Frame width — keep in sync with the --container-frame token. */
export const DESIGN_WIDTH = 1440

/** Raw background colors (must match --color-bg-* tokens). */
export const BG_DARK = '#171717'
export const BG_LIGHT = '#ffffff'

/**
 * Background crossfade stops. One stop per slide so the bg color animates
 * light <-> dark as `slide` moves between integers. Extend automatically as
 * SLIDES grows.
 */
export const BG_STOPS: number[] = SLIDES.map((_, i) => i)
export const BG_COLORS: string[] = SLIDES.map(
  (s) => s.bg ?? (s.theme === 'dark' ? BG_DARK : BG_LIGHT)
)

/** Header navigation — maps a label to the slide it scrolls to. */
export interface NavItem {
  label: string
  index: number
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'About Us', index: 1 },
  { label: 'Philosophy', index: 2 },
  { label: 'Vision', index: 3 },
  { label: 'Portfolio', index: 4 },
]

/* Snap engine timing. */
export const SLIDE_DURATION = 1.05
export const SLIDE_EASE = [0.77, 0, 0.175, 1] as const
