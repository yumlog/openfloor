import { useId } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/cn'

interface CircularBadgeProps {
  /** 링 위에 흐르는 반복 문구. 기본은 Hero의 "SCROLL DOWN". */
  label?: string
  /** 가운데 화살표 방향. 기본 'down'(Hero). */
  direction?: 'down' | 'up'
  /**
   * 링 텍스트 자간(letter-spacing). 기본은 Hero의 0.16em. 라벨이 짧으면(예:
   * "SCROLL UP") 원 둘레에 빈 구간이 생기므로 더 넓혀 고르게 채운다.
   */
  tracking?: string
  /** 지정 시 클릭 가능한 button으로 렌더(없으면 장식용 div, Hero). */
  onClick?: () => void
}

/**
 * 원형 뱃지 — 천천히 회전하는 링에 문구를 얹고 가운데에 화살표를 고정. 1440 기준
 * 80px, 프레임에 맞춰 유동 스케일(floor 48px). 링 텍스트는 SVG <textPath>; 회전은
 * keyframes.css에 있다(animate-spin-slow).
 *
 * 색은 항상 Hero와 동일하게 기본 text-nav(회색) → 호버 시 accent(빨강). props로
 * 문구/화살표 방향/자간/클릭을 바꿔 Contact의 "SCROLL UP"(클릭 시 Hero로 이동)
 * 같은 변형을 만든다.
 */
export function CircularBadge({
  label = 'SCROLL DOWN • SCROLL DOWN •',
  direction = 'down',
  tracking = '0.16em',
  onClick,
}: CircularBadgeProps) {
  // 한 페이지에 뱃지가 둘 이상 있어도 textPath href가 충돌하지 않도록 고유 id.
  const ringId = useId()
  const Arrow = direction === 'up' ? ArrowUp : ArrowDown
  // Hero와 동일: 기본 회색, 호버 시 accent(빨강).
  const color = 'text-text-nav group-hover:text-accent'
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
        <text
          className="fill-current text-[11px] font-medium uppercase"
          style={{ letterSpacing: tracking }}
        >
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
