import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  className?: string
  children: ReactNode
}

/**
 * Content wrapper with the standard horizontal gutter. Use inside sections to
 * keep content aligned; full-bleed backgrounds should sit outside it.
 */
export function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn('max-w-frame mx-auto w-full px-6 md:px-10', className)}>
      {children}
    </div>
  )
}
