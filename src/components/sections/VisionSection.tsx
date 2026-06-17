import { motion } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RISE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'

const def = SLIDES[4]

interface VisionSectionProps {
  active: boolean
}

export function VisionSection({ active }: VisionSectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)
  const H = frame.h / ratio

  const rise = (d: number) => ({
    variants: RISE,
    initial: 'hidden' as const,
    animate: active ? 'show' : 'hidden',
    transition: entryTransition(d),
  })

  const TitleBlock = (
    <div>
      <motion.p {...rise(0)} className="text-[20px] font-bold leading-[1.4] tracking-[-0.04em] text-[#FB3640]">
        OUR VISION
      </motion.p>
      <motion.p {...rise(0.06)} className="mt-[16px] text-[44px] font-bold leading-[1.5] tracking-normal text-white">
        AI와 함께 일하는 방식이 바뀌는 시대,<br />
        우리는 그 변화를 가장 깊이 만들어갑니다.
      </motion.p>
    </div>
  )

  if (isMobile) {
    return (
      <section id={def.id} className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
        <Container className="flex h-full flex-col pt-[88px]">
          <motion.p {...rise(0)} className="text-[15px] font-bold leading-[1.4] tracking-[-0.04em] text-[#FB3640]">
            OUR VISION
          </motion.p>
          <motion.p {...rise(0.06)} className="mt-4 text-[clamp(26px,7vw,36px)] font-bold leading-[1.5] text-white">
            AI와 함께 일하는 방식이 바뀌는 시대, 우리는 그 변화를 가장 깊이 만들어갑니다.
          </motion.p>
          {/* 모바일 아코디언은 3단계에서 */}
        </Container>
      </section>
    )
  }

  return (
    <section id={def.id} className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden">
      <div className="relative shrink-0" style={{ width: DESIGN_WIDTH, height: H, transform: `scale(${ratio})` }}>
        <div className="flex h-full flex-col justify-between py-[100px] px-[64px]">
          {TitleBlock}
          {/* 파이프라인 트리 — 2단계에서 채움(타이틀-트리 justify-between) */}
          <div className="relative w-full" />
        </div>
      </div>
    </section>
  )
}
