import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Container } from './Container'
import { NAV_ITEMS, SLIDES } from '@/config/slides'

interface HeaderProps {
  /** Active slide index (scroll-spy). */
  index: number
  /** Snap to a slide. */
  goTo: (next: number) => void
}

/**
 * Fixed top navigation. Links jump to their section; the active section is
 * highlighted in the accent color. Text color adapts to the current slide's
 * background theme.
 *
 * Desktop (md+) shows the inline nav. Mobile (<768) collapses it behind a
 * hamburger that opens a full-screen overlay menu.
 */
export function Header({ index, goTo }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const onDark = SLIDES[index]?.theme === 'dark'
  // On dark slides the nav uses the muted nav grey; on light slides it falls
  // back to the dark title color so it stays legible.
  const baseText = onDark ? 'text-text-nav' : 'text-title-on-light'

  // Snap, then close the mobile overlay.
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

        {/* Desktop: inline nav. */}
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

        {/* Mobile: hamburger toggles the overlay (icon color adapts to theme). */}
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

      {/* Mobile full-screen overlay menu. */}
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
