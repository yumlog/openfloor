import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project } from './projects'

/* ---------------------------------------------------------------------------
   Portfolio detail modal (design-6.png). Dim backdrop + a centered rounded
   frame; the frame holds the project's content slides (brand-color fill, a
   readability scrim, and a top-left label/title), crossfading between them.
   Prev/next arrows live OUT in the dim, 36px off the frame's edges.

   Rendered through a body portal by PortfolioSection because the slide track
   is transformed — a `fixed` overlay nested under it would be trapped.
--------------------------------------------------------------------------- */

// At >=1440 the frame is a fixed 1024 wide; below it keeps a 208px dim gutter
// each side. Height always leaves a 96px dim margin top and bottom.
const MODAL_W = 'min(calc(100vw - 416px), 1024px)'
const MODAL_H = 'calc(100dvh - 192px)'

interface PortfolioModalProps {
  project: Project
  onClose: () => void
}

export function PortfolioModal({ project, onClose }: PortfolioModalProps) {
  const [i, setI] = useState(0)
  const slides = project.slides
  const slide = slides[i]
  const atFirst = i === 0
  const atLast = i === slides.length - 1

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClose}
    >
      <motion.div
        className="relative"
        style={{ width: MODAL_W, height: MODAL_H }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Solid white base so a slide crossfade (both layers <1 opacity) shows
            white, not the dim behind — also a backstop once real images land. */}
        <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-white">
          <AnimatePresence>
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{ backgroundColor: project.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Scrim for white-text legibility over the brand color. */}
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute top-0 left-0 p-[clamp(36px,4.44vw,64px)]">
                <p className="text-[clamp(14px,1.39vw,20px)] font-semibold tracking-[-0.02em] text-white/90">
                  {slide.label}
                </p>
                <h3 className="mt-[clamp(8px,1.11vw,16px)] text-[clamp(28px,3.06vw,44px)] leading-[1.3] font-bold tracking-[-0.03em] text-white">
                  {slide.title}
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows out in the dim, 36px off the frame edges (52px button = -88). */}
        {!atFirst && (
          <button
            type="button"
            aria-label="이전 슬라이드"
            onClick={() => setI((n) => n - 1)}
            className="absolute top-1/2 left-[-88px] flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/60"
          >
            <ChevronLeft className="h-[26px] w-[26px] text-white" />
          </button>
        )}
        {!atLast && (
          <button
            type="button"
            aria-label="다음 슬라이드"
            onClick={() => setI((n) => n + 1)}
            className="absolute top-1/2 right-[-88px] flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/60"
          >
            <ChevronRight className="h-[26px] w-[26px] text-white" />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
