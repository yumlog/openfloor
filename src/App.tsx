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
import { BG_COLORS, BG_STOPS, TOTAL_SLIDES } from '@/config/slides'

export default function App() {
  const frame = useFrameSize()
  const isMobile = frame.w < 768

  // Manifesto 드럼 롤: 스크롤 엔진이 슬라이드 4를 가두고 이 0..1 값을 제스처당
  // 한 칸씩 구동한다; 섹션이 이를 원통 롤로 바꾼다.
  const manifestoRoll = useMotionValue(0)
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
        // 아래(Vision/Contact/헤더)에서 역방향 진입 시 progress를 0(첫 슬라이드)에
        // 앉힌다. 기본값 1이면 마지막 프로젝트로 가버린다. 착지 후 컨트롤러가
        // reveal을 자동재생해 첫 프로젝트(01)가 펼쳐지며 등장한다.
        reverseSeat: 0,
      },
      {
        index: 5,
        steps: MANIFESTO_STEPS,
        progress: manifestoRoll,
        sensitivity: 0.0008,
        autoFlow: {
          speed: 0.08,
          fwdCap: 1.0,
          revCap: 0.0,
          damp: 4,
          impulse: 0.004,
          vMax: 1.0,
        },
      },
    ],
    [isMobile, philosophyRoll, portfolioRoll, manifestoRoll]
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

  // 중앙 크리스탈: hero 자리(가운데, scale 0.78)에 고정한 채 hero를 벗어나면
  // 페이드아웃만 한다(about으로 이동/축소하지 않음). 박스 크기 `videoSize`는
  // 1440 기준을 `ratio`(frame.w / 1440)로 스케일해 좁은 화면에서 비례 축소.
  // 모바일에선 박스를 위로 올려(heroCrystalY) 쌓인 hero 텍스트를 피한다.
  const videoSize = 860 * frame.ratio
  const heroCrystalY = isMobile ? -frame.h * 0.26 : 0
  const videoScale = useMotionValue(0.78)
  const videoX = useMotionValue(0)
  // 리사이즈/모바일 토글로 heroCrystalY가 바뀌면 반영(useMotionValue는 초기값만 잡음).
  const videoY = useMotionValue(heroCrystalY)
  useEffect(() => {
    videoY.set(heroCrystalY)
  }, [heroCrystalY, videoY])
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
        {/* active를 현재 이동의 출발/도착이 About일 때만 true로 가드 — index===1
            단독이면 Hero↔Contact 점프로 slide가 1을 스칠 때 index가 잠깐 1이 되어
            카드가 켜졌다(스침). source/target 가드로 통과 중엔 계속 false 유지. */}
        <AboutSection active={index === 1 && (source === 1 || target === 1)} />
        <PhilosophySection
          active={index === 2 && (target === 2 || source === 2)}
          // 빨강 grow 오버레이는 현재 이동의 도착이 philosophy(2)/portfolio(3)일
          // 때만 보이게 게이트 — Hero↔Contact 등 무관한 점프가 slide로 2~3을
          // 스쳐도(그때 g 잔여값이 있어도) 오버레이가 강제로 숨어 빨강이 안 스친다.
          // 정상 2↔3 seam·grow·parked 상태는 모두 target∈{2,3}이라 그대로 보존.
          bridgeActive={target === 2 || target === 3}
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
        <ManifestoSection active={index === 5} progress={manifestoRoll} />
        <ContactSection active={index === 6} goTo={goTo} />
      </Slides>

      <Header index={index} goTo={goTo} />
    </Frame>
  )
}
