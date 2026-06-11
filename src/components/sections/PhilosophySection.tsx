import { motion, type MotionValue } from 'motion/react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'
import { PhilosophyDeck } from './philosophy/PhilosophyDeck'
import { PhilosophyMobile } from './philosophy/PhilosophyMobile'

const def = SLIDES[2]

/** philosophy 트랩 스텝 수(standing + 카드 3장; 마지막 노치는 4b의 확대용). */
export const PHILOSOPHY_STEPS = 4

// reveal sweep이 줄 박스 단위로 크기를 갖도록 헤드라인을 미리 분할(wrap 없음).
const HEADLINE_LINES = ['결과로 말하는 것이', '우리의 방식입니다.']

const LABEL_DELAY = 0
const HEADLINE_DELAY = 0.15

interface PhilosophySectionProps {
  /** Philosophy가 활성 슬라이드인 동안 true — reveal + 덱 리셋을 구동. */
  active: boolean
  /** philosophy 트랩 progress(0..1). */
  progress: MotionValue<number>
}

/**
 * 슬라이드 2, 라이트. 타이틀(라벨 + reveal 헤드라인)은 상단 가운데; 그 아래에
 * 인터랙티브 카드 덱. 덱(PhilosophyDeck)은 고정 1440 디자인 캔버스를 `ratio`로
 * 스케일해 비례 축소된다; 모바일은 전용 세로 스택으로 교체. 상단 마진 100px
 * (내비 포함), 하단 126px.
 *
 * 공용 RevealText는 "라이트 변형"을 오로지 텍스트 색으로만 구현한다(여기선 #111
 * 대 다크의 흰색) — 흰 halo + 청/적 색수차는 CSS에 있고 색에 독립적이라 keyframe
 * 변경이 필요 없다.
 */
export function PhilosophySection({ active, progress }: PhilosophySectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)

  return (
    <section
      id={def.id}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
    >
      <Container className="pt-[clamp(58px,6.94vw,100px)] max-md:pt-[88px]">
        <motion.p
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(LABEL_DELAY)}
          className="text-accent text-center text-[clamp(12px,1.39vw,20px)] leading-[1.4] font-bold tracking-[-0.04em] max-md:text-[15px]"
        >
          OUR PHILOSOPHY
        </motion.p>

        <RevealText
          as="h2"
          active={active}
          lines={HEADLINE_LINES}
          baseDelay={HEADLINE_DELAY}
          noChroma
          className="text-title-on-light mt-[clamp(7px,0.83vw,12px)] flex flex-col items-center text-[clamp(26px,3.06vw,44px)] leading-[1.4] font-bold tracking-normal max-md:text-[24px]"
        />
      </Container>

      {/* 카드 영역, 타이틀과 하단 마진(126px) 사이 공간에 가운데 정렬. */}
      <div className="flex flex-1 items-center justify-center pb-[clamp(73px,8.75vw,126px)] max-md:pb-[48px]">
        {isMobile ? (
          <PhilosophyMobile active={active} />
        ) : (
          <PhilosophyDeck active={active} ratio={ratio} progress={progress} />
        )}
      </div>
    </section>
  )
}
