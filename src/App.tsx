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
import { BG_COLORS, BG_STOPS, TOTAL_SLIDES } from '@/config/slides'

export default function App() {
  const frame = useFrameSize()
  const { slide, index, goTo } = useSlideController({ total: TOTAL_SLIDES })

  // Background crossfades light <-> dark across the slide config.
  const background = useTransform(slide, BG_STOPS, BG_COLORS)

  // Track translate: one section per 100dvh.
  const trackY = useTransform(slide, (v) => `${-v * 100}dvh`)

  // Central video, slide 0 -> 1: shrink + move toward the upper-right, then
  // fade out before the Philosophy slide so the deck has the stage alone.
  // Slide 0: 860 square centered. Slide 1: 354 square centered at
  // (frame.w - 402, 301). The x/y translate moves the (centered) box by an
  // absolute px amount, so it's independent of the base size — only the scale
  // changes when the base grows (690 -> 860), keeping the about state identical.
  const videoScale = useTransform(slide, [0, 1], [1, 354 / 860])
  const videoX = useTransform(slide, [0, 1], [0, frame.w / 2 - 402])
  const videoY = useTransform(slide, [0, 1], [0, 301 - frame.h / 2])
  const videoOpacity = useTransform(slide, [1.3, 1.75], [1, 0])

  return (
    <Frame background={background}>
      <HeroGhost slide={slide} />

      <CentralVideo
        scale={videoScale}
        x={videoX}
        y={videoY}
        opacity={videoOpacity}
      />

      <Slides trackY={trackY}>
        <HeroSection slide={slide} goTo={goTo} />
        <AboutSection />
        <PhilosophySection />
        <VisionSection />
        <PortfolioSection />
        <ContactSection />
      </Slides>

      <Header index={index} goTo={goTo} />
    </Frame>
  )
}
