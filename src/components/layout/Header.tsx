import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Container } from './Container'
import { NAV_ITEMS, SLIDES } from '@/config/slides'

interface HeaderProps {
  /** 활성 슬라이드 인덱스(스크롤스파이). */
  index: number
  /** 특정 슬라이드로 스냅. */
  goTo: (next: number) => void
}

/**
 * 고정 상단 내비게이션. 링크는 해당 섹션으로 점프하고, 활성 섹션은 accent
 * 색으로 강조된다. 텍스트 색은 현재 슬라이드의 배경 테마에 맞춰 바뀐다.
 *
 * 데스크탑(md+)은 인라인 내비를 보여준다. 모바일(<768)은 햄버거 뒤로 접고,
 * 누르면 풀스크린 오버레이 메뉴가 열린다.
 */
export function Header({ index, goTo }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const onDark = SLIDES[index]?.theme === 'dark'
  // 다크 슬라이드에선 내비가 차분한 nav 그레이를, 라이트 슬라이드에선 가독성을
  // 위해 다크 타이틀 색으로 떨어진다.
  const baseText = onDark ? 'text-text-nav' : 'text-title-on-light'

  // 스냅한 뒤 모바일 오버레이를 닫는다.
  const navigate = (next: number) => {
    goTo(next)
    setMenuOpen(false)
  }

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <Container className="flex h-[65px] items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(0)}
          className={cn(
            'text-[20px] leading-[1.2] font-bold tracking-[-0.04em] transition-colors',
            index === 0 ? 'text-accent' : baseText
          )}
        >
          OPENFLOOR
        </button>

        {/* 데스크탑: 인라인 내비. */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.index)}
              className={cn(
                'hover:text-accent text-[18px] leading-[1.4] font-medium tracking-[-0.04em] transition-colors',
                index === item.index ? 'text-accent' : baseText
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 모바일: 햄버거가 오버레이를 토글(아이콘 색은 테마에 맞춤). */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className={cn(
            'hover:text-accent transition-colors md:hidden',
            baseText
          )}
        >
          {menuOpen ? (
            <X size={28} strokeWidth={2} />
          ) : (
            <Menu size={28} strokeWidth={2} />
          )}
        </button>
      </Container>

      {/* 모바일 풀스크린 오버레이 메뉴. */}
      {menuOpen && (
        <div className="bg-bg-dark fixed inset-0 z-40 flex flex-col md:hidden">
          <Container className="flex h-[65px] shrink-0 items-center justify-end">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-text-nav hover:text-accent transition-colors"
            >
              <X size={28} strokeWidth={2} />
            </button>
          </Container>

          <nav className="flex flex-1 flex-col items-center justify-center gap-10">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.index)}
                className={cn(
                  'hover:text-accent text-[32px] leading-[1.2] font-bold tracking-[-0.04em] transition-colors',
                  index === item.index ? 'text-accent' : 'text-text-nav'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
