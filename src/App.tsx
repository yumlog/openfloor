import { useTransform } from 'motion/react'
import { Frame } from '@/components/layout/Frame'
import { Slides } from '@/components/layout/Slides'
import { Header } from '@/components/layout/Header'
import { CentralVideo } from '@/components/layout/CentralVideo'
import { HeroSection } from '@/components/sections/HeroSection'
import { HeroGhost } from '@/components/sections/hero/HeroGhost'
import { AboutSection } from '@/components/sections/AboutSection'
import { PhilosophySection } from '@/components/sections/PhilosophySection'
import { VisionSection } from '@/components/sections/VisionSection'
import { PortfolioSection } from '@/components/sections/PortfolioSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { useFrameSize } from '@/hooks/useFrameSize'
import { useSlideController } from '@/hooks/useSlideController'
import {
  BG_COLORS,
  BG_STOPS,
  DESIGN_WIDTH,
  TOTAL_SLIDES,
} from '@/config/slides'

export default function App() {
  const frame = useFrameSize()
  const { slide, index, goTo } = useSlideController({ total: TOTAL_SLIDES })

  // Background crossfades light <-> dark across the slide config.
  const background = useTransform(slide, BG_STOPS, BG_COLORS)

  // Track translate: one section per 100dvh.
  const trackY = useTransform(slide, (v) => `${-v * 100}dvh`)

  // Central video, slide 0 -> 1: shrink + move toward the upper-right, then
  // fade out before the Philosophy slide so the deck has the stage alone.
  //
  // The whole composition is defined at the 1440 reference and scaled by
  // `ratio` (frame.w / 1440) so it shrinks proportionally with the frame on
  // narrower screens — base size, the about-state target size, and the
  // about-state offsets (402 from the right, 301 from the top) all scale
  // together, so the about state reads identically at every width.
  // Slide 0: `videoSize` square centered. Slide 1: a 354/860 scale of it,
  // centered at (frame.w - 402*ratio, 301*ratio). The x/y translate moves the
  // centered box by an absolute px amount, so it's independent of the base
  // size — only the scale (constant 354/860) shapes the about state.
  // On mobile the slide-0 box is nudged down so it clears the stacked hero text.
  const ratio = frame.w / DESIGN_WIDTH
  const isMobile = frame.w < 768
  const videoSize = 860 * ratio
  const videoScale = useTransform(slide, [0, 1], [1, 354 / 860])
  const videoX = useTransform(slide, [0, 1], [0, frame.w / 2 - 402 * ratio])
  const videoY = useTransform(
    slide,
    [0, 1],
    [isMobile ? frame.h * 0.22 : 0, 301 * ratio - frame.h / 2]
  )
  const videoOpacity = useTransform(slide, [1.3, 1.75], [1, 0])

  return (
    <Frame background={background}>
      <HeroGhost slide={slide} active={index === 0} />

      <CentralVideo
        size={videoSize}
        scale={videoScale}
        x={videoX}
        y={videoY}
        opacity={videoOpacity}
      />

      <Slides trackY={trackY}>
        <HeroSection slide={slide} goTo={goTo} active={index === 0} />
        <AboutSection active={index === 1} />
        <PhilosophySection active={index === 2} />
        <VisionSection />
        <PortfolioSection />
        <ContactSection />
      </Slides>

      <Header index={index} goTo={goTo} />
    </Frame>
  )
}
