import { ArrowDown } from 'lucide-react'

/**
 * Hero 원형 뱃지 — 천천히 회전하는 링에 "SCROLL DOWN"을 얹고 가운데에 아래
 * 화살표를 고정. 1440 기준 80px, 프레임에 맞춰 유동 스케일(floor 48px). 링
 * 텍스트는 SVG <textPath>; 회전은 keyframes.css에 있다(animate-spin-slow). 뱃지
 * 어디든 호버하면 링 텍스트와 화살표가 모두 accent 색으로 페이드된다.
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
