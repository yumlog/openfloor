/**
 * Hero circular badge — "I LOVE FRAMER" set on a ring that rotates slowly, with
 * a small accent dot pinned at the center. 80px. The ring text is drawn with an
 * SVG <textPath>; the spin lives in keyframes.css (animate-spin-slow).
 */
export function CircularBadge() {
  return (
    <div className="relative h-20 w-20">
      <svg
        viewBox="0 0 100 100"
        className="animate-spin-slow text-text-nav h-full w-full"
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
            I LOVE FRAMER • I LOVE FRAMER •
          </textPath>
        </text>
      </svg>

      <span className="bg-accent absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
    </div>
  )
}
