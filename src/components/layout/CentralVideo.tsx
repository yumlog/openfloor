import { motion, type MotionValue } from 'motion/react'

interface CentralVideoProps {
  /** 기본(slide-0) 박스 변의 px 길이; App이 프레임에 맞춰 스케일. */
  size: number
  scale: MotionValue<number>
  x: MotionValue<number>
  y: MotionValue<number>
  opacity: MotionValue<number>
}

/**
 * hero -> about 중심 클립. 기본 위치는 프레임 중앙; 스크롤 엔진이
 * scale/x/y/opacity를 구동한다(App 참조).
 *
 * 소스에 알파가 없어 — 슬라이드 배경 위에 mix-blend-mode로 합성된다(CSS
 * .central-video, body.is-dark로 토글). 블렌드가 실제로 Frame이 칠한 배경까지
 * 닿으려면 블렌드 요소가 자체 스택 컨텍스트로 격리되면 안 된다: 래퍼는 z-index가
 * 없고(격리 안 함), 스크롤 transform은 별도 내부 div에 두며, 블렌드 요소 자체는
 * opacity만 갖는다. 예전의 동작하던 구조를 그대로 따른다.
 */
export function CentralVideo({
  size,
  scale,
  x,
  y,
  opacity,
}: CentralVideoProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="central-video"
        style={{ opacity, width: size, height: size }}
      >
        <motion.div className="h-full w-full" style={{ scale, x, y }}>
          <video
            src="/bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="central-video__el h-full w-full object-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
