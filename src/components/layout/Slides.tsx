import type { ReactNode } from 'react'
import { motion, type MotionValue } from 'motion/react'

interface SlidesProps {
  /** 트랙 translateY, 예: `-slide * 100dvh`. */
  trackY: MotionValue<string>
  children: ReactNode
}

/**
 * 세로 슬라이드 트랙. 섹션을 쌓아 두고 전체 트랙을 단일 transform으로 이동한다;
 * 각 자식 섹션은 뷰포트 높이 한 칸(100dvh)이다.
 */
export function Slides({ trackY, children }: SlidesProps) {
  return (
    <div className="relative z-20 h-full w-full overflow-hidden">
      <motion.div
        className="flex flex-col will-change-transform"
        style={{ y: trackY }}
      >
        {children}
      </motion.div>
    </div>
  )
}
