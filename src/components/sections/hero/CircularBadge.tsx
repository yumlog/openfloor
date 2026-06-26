import { useId } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/cn'

interface CircularBadgeProps {
  /** 링 위에 흐르는 반복 문구. 기본은 Hero의 "SCROLL DOWN". */
  label?: string
  /** 가운데 화살표 방향. 기본 'down'(Hero). */
  direction?: 'down' | 'up'
  /** 기본색을 accent(빨강)로 고정. 기본은 text-nav → 호버 시 accent(Hero). */
  accent?: boolean
  /** 지정 시 클릭 가능한 button으로 렌더(없으면 장식용 div, Hero). */
  onClick?: () => void
}

/**
 * 원형 뱃지 — 천천히 회전하는 링에 문구를 얹고 가운데에 화살표를 고정. 1440 기준
 * 80px, 프레임에 맞춰 유동 스케일(floor 48px). 링 텍스트는 SVG <textPath>; 회전은
 * keyframes.css에 있다(animate-spin-slow).
 *
 * 기본값은 Hero의 "SCROLL DOWN" 장식 뱃지(text-nav, 호버 시 accent)를 그대로
 * 재현한다. props로 문구/화살표 방향/색/클릭을 바꿔 Contact의 "SCROLL UP"(빨강,
 * 클릭 시 Hero로 이동) 같은 변형을 만든다.
 */
export function CircularBadge({
  label = 'SCROLL DOWN • SCROLL DOWN •',
  direction = 'down',
  accent = false,
  onClick,
}: CircularBadgeProps) {
  // 한 페이지에 뱃지가 둘 이상 있어도 textPath href가 충돌하지 않도록 고유 id.
  const ringId = useId()
  const Arrow = direction === 'up' ? ArrowUp : ArrowDown
  // accent=true면 항상 빨강; 아니면 Hero처럼 text-nav → 호버 시 accent.
  const color = accent ? 'text-accent' : 'text-text-nav group-hover:text-accent'
  const Root = onClick ? 'button' : 'div'

  return (
    <Root
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'group relative size-[clamp(48px,5.56vw,80px)]',
        onClick && 'cursor-pointer'
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className={cn(
          'animate-spin-slow h-full w-full transition-colors duration-300',
          color
        )}
      >
        <defs>
          <path
            id={ringId}
            fill="none"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <text className="fill-current text-[11px] font-medium tracking-[0.16em] uppercase">
          <textPath href={`#${ringId}`} startOffset="0">
            {label}
          </textPath>
        </text>
      </svg>

      <Arrow
        strokeWidth={2}
        className={cn(
          'absolute top-1/2 left-1/2 size-[clamp(12px,1.39vw,20px)] -translate-x-1/2 -translate-y-1/2 transition-colors duration-300',
          color
        )}
      />
    </Root>
  )
}
