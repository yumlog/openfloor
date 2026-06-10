import { motion, useTransform, type MotionValue } from 'motion/react'
import { Container } from '@/components/layout/Container'

interface HeroGhostProps {
  /** 스크롤 엔진 motion value — 이것을 hero와 정확히 같이 움직이게 한다. */
  slide: MotionValue<number>
  /** hero가 활성인 동안 true — 재진입 시 고스트 페이드인을 다시 재생. */
  active: boolean
}

/**
 * 큼직한 "UNDERSTAND DEEPER / BUILD TO LAST" 고스트 텍스트. 배경과 중앙 크리스탈
 * 사이의 Frame 레이어에 있다(크리스탈 캔버스보다 먼저 렌더, z-index 없음). 그래서
 * 크리스탈이 그 위에 겹쳐 그려진다 — 유리 오브젝트가 텍스트를 가리는 것처럼 읽혀
 * 시안의 깊이감과 맞는다.
 *
 * Slides 트랙 안에 있지 않으므로, 여기서 hero의 모션을 재현한다: 트랙과 함께
 * translate(-slide * 100dvh)하고 슬라이드 0을 떠날 때 페이드 아웃해, 나머지
 * hero 콘텐츠와 정확히 똑같이 동작한다.
 */
export function HeroGhost({ slide, active }: HeroGhostProps) {
  const y = useTransform(slide, (v) => `${-v * 100}dvh`)
  const opacity = useTransform(slide, [0, 0.5], [1, 0])

  return (
    <motion.div
      aria-hidden
      style={{ y, opacity }}
      className="pointer-events-none absolute inset-0 flex h-[100dvh] flex-col justify-end"
    >
      <Container className="mb-[clamp(58px,6.94vw,100px)] max-md:mb-8">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
          className="text-ghost-on-dark text-[clamp(46px,8vw,115px)] leading-none font-bold tracking-[-0.04em] whitespace-nowrap max-md:text-[44px]"
        >
          <span className="block">UNDERSTAND DEEPER</span>
          <span className="block">BUILD TO LAST</span>
        </motion.h2>
      </Container>
    </motion.div>
  )
}
