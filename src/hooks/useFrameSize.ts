import { useEffect, useState } from 'react'
import { DESIGN_WIDTH } from '@/config/slides'

export interface FrameSize {
  w: number
  h: number
}

/**
 * Tracks the design frame size. Width is capped at DESIGN_WIDTH so that on
 * wider viewports the layout (and the scroll-driven video position) behaves as
 * if the screen were 1440px wide, with the remainder showing as side margins.
 */
export function useFrameSize(): FrameSize {
  const [size, setSize] = useState<FrameSize>(() => ({
    w:
      typeof window !== 'undefined'
        ? Math.min(window.innerWidth, DESIGN_WIDTH)
        : DESIGN_WIDTH,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  }))

  useEffect(() => {
    const update = () =>
      setSize({
        w: Math.min(window.innerWidth, DESIGN_WIDTH),
        h: window.innerHeight,
      })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}
