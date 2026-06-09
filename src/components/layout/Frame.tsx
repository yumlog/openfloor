import type { ReactNode } from 'react'
import { motion, type MotionValue } from 'motion/react'

interface FrameProps {
  /** 풀블리드 레이어와 프레임이 공유하는 애니메이션 배경색. */
  background: MotionValue<string>
  children: ReactNode
}

/**
 * 디자인 프레임. 두 레이어가 동일한 애니메이션 배경을 운반한다:
 *
 *  1. 풀뷰포트 블리드 레이어 — 1440보다 넓은 화면에서 좌우 여백이 현재 슬라이드
 *     색을 띠게 하고,
 *  2. 1440으로 제한된 가운데 프레임 자체 — 중앙 비디오의 mix-blend-mode가
 *     같은 스택 컨텍스트 안에서 블렌드할 배경을 갖게 한다(이게 없으면 블렌드
 *     전환이 하얀 플래시로 보인다).
 *
 * 풀블리드 요소(섹션 배경)는 이 너비 제한 밖에 있어야 하며, 콘텐츠만 프레임에
 * 갇힌다.
 */
export function Frame({ background, children }: FrameProps) {
  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background }}
      />
      <motion.div
        className="max-w-frame fixed inset-y-0 left-1/2 z-10 w-full -translate-x-1/2 overflow-hidden"
        style={{ background }}
      >
        {children}
      </motion.div>
    </>
  )
}
