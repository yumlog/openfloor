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
 */
export function Header({ index, goTo }: HeaderProps) {
  const onDark = SLIDES[index]?.theme === 'dark'
  const baseText = onDark ? 'text-title-on-dark' : 'text-title-on-light'

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <Container className="flex items-center justify-between py-6">
        <button
          type="button"
          onClick={() => goTo(0)}
          className={cn(
            'text-lg font-bold tracking-tight transition-colors',
            index === 0 ? 'text-accent' : baseText
          )}
        >
          OPENFLOOR
        </button>

        <nav className="flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => goTo(item.index)}
              className={cn(
                'text-sm font-medium transition-colors',
                index === item.index ? 'text-accent' : baseText
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </Container>
    </header>
  )
}
