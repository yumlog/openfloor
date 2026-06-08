import { cn } from '@/lib/cn'
import type { SlideTheme } from '@/config/slides'

interface PlaceholderSectionProps {
  /** Section element id (for nav/anchors). */
  id: string
  /** Big label shown until the section is built. */
  label: string
  /** Background theme — drives text color. */
  theme: SlideTheme
}

/**
 * Step 1 stand-in for a section. One viewport tall, centered label only.
 * Real content + interactions replace the body of each section later; this
 * keeps the engine + layout verifiable in the meantime.
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
