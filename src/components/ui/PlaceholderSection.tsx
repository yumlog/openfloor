import { cn } from '@/lib/cn'
import type { SlideTheme } from '@/config/slides'

interface PlaceholderSectionProps {
  /** 섹션 엘리먼트 id(내비/앵커용). */
  id: string
  /** 섹션이 구현되기 전까지 보여줄 큰 라벨. */
  label: string
  /** 배경 테마 — 텍스트 색을 결정. */
  theme: SlideTheme
}

/**
 * 섹션의 1단계 대체물. 뷰포트 한 칸 높이, 가운데 라벨만. 실제 콘텐츠 +
 * 인터랙션이 나중에 각 섹션 본문을 대체한다; 그동안 엔진 + 레이아웃을 검증
 * 가능하게 유지한다.
 */
export function PlaceholderSection({
  id,
  label,
  theme,
}: PlaceholderSectionProps) {
  return (
    <section
      id={id}
      className="relative flex h-[100dvh] w-full items-center justify-center"
    >
      <h2
        className={cn(
          'text-6xl font-bold tracking-tight uppercase md:text-8xl',
          theme === 'dark' ? 'text-title-on-dark' : 'text-title-on-light'
        )}
      >
        {label}
      </h2>
    </section>
  )
}
