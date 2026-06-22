import { useEffect, useMemo, useState } from 'react'
import { useMotionValue, useTransform } from 'motion/react'
import { Frame } from '@/components/layout/Frame'
import { Slides } from '@/components/layout/Slides'
import { Header } from '@/components/layout/Header'
import { CentralCrystal } from '@/components/layout/CentralCrystal'
import { HeroSection } from '@/components/sections/HeroSection'
import { HeroGhost } from '@/components/sections/hero/HeroGhost'
import { AboutSection } from '@/components/sections/AboutSection'
import {
  PhilosophySection,
  PHILOSOPHY_STEPS,
} from '@/components/sections/PhilosophySection'
import {
  PortfolioSection,
  PORTFOLIO_STEPS,
} from '@/components/sections/PortfolioSection'
import { STACK_END } from '@/components/sections/philosophy/PhilosophyStack'
import {
  ManifestoSection,
  MANIFESTO_STEPS,
} from '@/components/sections/ManifestoSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { VisionSection } from '@/components/sections/VisionSection'
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
  const isMobile = frame.w < 768

  // Manifesto 드럼 롤: 스크롤 엔진이 슬라이드 4를 가두고 이 0..1 값을 제스처당
  // 한 칸씩 구동한다; 섹션이 이를 원통 롤로 바꾼다.
  const rollProgress = useMotionValue(0)
  const portfolioRoll = useMotionValue(0)
  const philosophyRoll = useMotionValue(0)
  const traps = useMemo(
    () => [
      {
        index: 2,
        steps: isMobile ? 3 : PHILOSOPHY_STEPS,
        progress: philosophyRoll,
        sensitivity: isMobile ? 0.002 : 0.0006,
        reverseSeat: isMobile ? 1 : STACK_END,
      },
      {
        index: 3,
        steps: PORTFOLIO_STEPS,
        progress: portfolioRoll,
        sensitivity: 0.0004,
        snap: true,
      },
      {
        index: 5,
        steps: MANIFESTO_STEPS,
        progress: rollProgress,
        sensitivity: 0.0008,
        autoFlow: {
          speed: 0.018,
          fwdCap: 1.0,
          revCap: 0.0,
          damp: 4,
          impulse: 0.004,
          vMax: 1.0,
        },
      },
    ],
    [isMobile, philosophyRoll, portfolioRoll, rollProgress]
  )
  const { slide, index, goTo, source, target } = useSlideController({
    total: TOTAL_SLIDES,
    traps,
    isMobile,
  })

  // 배경은 슬라이드 설정에 따라 라이트 <-> 다크로 크로스페이드.
  const background = useTransform(slide, BG_STOPS, BG_COLORS)

  // 트랙 translate: 100dvh당 한 섹션.
  const trackY = useTransform(slide, (v) => `${-v * 100}dvh`)

  // 중앙 비디오, 슬라이드 0 -> 1: 축소 + 우상단으로 이동, 그 뒤 Philosophy
  // 슬라이드 전에 페이드 아웃해 덱이 무대를 독차지하게.
  //
  // 전체 합성은 1440 기준으로 정의하고 `ratio`(frame.w / 1440)로 스케일해 좁은
  // 화면에서 프레임에 비례해 줄어든다 — 기본 크기, about 상태 목표 크기,
  // about 상태 오프셋(우측에서 402, 상단에서 301)이 함께 스케일되므로 about
  // 상태가 모든 너비에서 동일하게 읽힌다.
  // 슬라이드 0: `videoSize` 정사각 가운데. 슬라이드 1: 그 354/860 스케일을
  // (frame.w - 402*ratio, 301*ratio)에 가운데 정렬. x/y translate는 가운데 박스를
  // 절대 px만큼 옮기므로 기본 크기와 무관하다 — about 상태는 스케일(상수 354/860)만
  // 결정한다.
  // 모바일에선 슬라이드-0 박스를 아래로 살짝 내려 쌓인 hero 텍스트를 피한다.
  const ratio = frame.w / DESIGN_WIDTH
  const videoSize = 860 * ratio
  // hero 전용: about으로 이동/축소시키지 않고 hero 자리(가운데, scale 0.78)에 고정.
  const heroCrystalY = isMobile ? -frame.h * 0.26 : 0
  const videoScale = useTransform(slide, [0, 1], [0.78, 0.78])
  const videoX = useTransform(slide, [0, 1], [0, 0])
  const videoY = useTransform(slide, [0, 1], [heroCrystalY, heroCrystalY])
  // hero를 벗어나면(0→0.8) 그 자리에서 페이드아웃 → about에선 안 보임.
  const videoOpacity = useTransform(slide, [0, 0.8], [1, 0])

  // 크리스탈 캔버스는 hero/about 구간(slide < ~1.9)에서만 렌더한다 — 그 밖에선
  // 페이드아웃이 끝나 안 보이므로 frameloop를 멈춰 GPU를 아낀다.
  const [crystalVisible, setCrystalVisible] = useState(true)
  useEffect(() => {
    const apply = (v: number) => setCrystalVisible(v < 1.0)
    apply(slide.get())
    const unsub = slide.on('change', apply)
    return () => unsub()
  }, [slide])

  return (
    <Frame background={background}>
      <HeroGhost slide={slide} active={index === 0} />

      <CentralCrystal
        size={videoSize}
        scale={videoScale}
        x={videoX}
        y={videoY}
        opacity={videoOpacity}
        lowSpec={isMobile}
        visible={crystalVisible}
      />

      <Slides trackY={trackY}>
        <HeroSection slide={slide} goTo={goTo} active={index === 0} />
        <AboutSection active={index === 1} />
        <PhilosophySection
          active={index === 2 && (target === 2 || source === 2)}
          progress={philosophyRoll}
          slide={slide}
          goTo={goTo}
        />
        <PortfolioSection
          active={
            (index === 3 && (target === 3 || source === 3)) ||
            (source === 2 && target === 3)
          }
          progress={portfolioRoll}
        />
        <VisionSection active={index === 4} />
        <ManifestoSection active={index === 5} progress={rollProgress} />
        <ContactSection active={index === 6} goTo={goTo} />
      </Slides>

      <Header index={index} goTo={goTo} />
    </Frame>
  )
}
