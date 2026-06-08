import { ArrowDown } from 'lucide-react'

/**
 * Hero circular badge — "SCROLL DOWN" set on a slowly-rotating ring with a
 * down arrow pinned at the center. 80px at the 1440 reference, scaled fluidly
 * with the frame (floor 48px). The ring text is an SVG <textPath>;
 * the spin lives in keyframes.css (animate-spin-slow). Hovering anywhere on the
 * badge fades both the ring text and the arrow to the accent color.
 */
export function CircularBadge() {
  return (
    <div className="group relative size-[clamp(48px,5.56vw,80px)]">
      <svg
        viewBox="0 0 100 100"
        className="animate-spin-slow text-text-nav group-hover:text-accent h-full w-full transition-colors duration-300"
      >
        <defs>
          <path
            id="hero-badge-ring"
            fill="none"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <text className="fill-current text-[11px] font-medium tracking-[0.16em] uppercase">
          <textPath href="#hero-badge-ring" startOffset="0">
            SCROLL DOWN • SCROLL DOWN •
          </textPath>
        </text>
      </svg>

      <ArrowDown
        strokeWidth={2}
        className="text-text-nav group-hover:text-accent absolute top-1/2 left-1/2 size-[clamp(12px,1.39vw,20px)] -translate-x-1/2 -translate-y-1/2 transition-colors duration-300"
      />
    </div>
  )
}
