import { motion, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, FADE } from '@/lib/motion'
import { CircularBadge } from './hero/CircularBadge'
import { SLIDES, SLIDE_EASE } from '@/config/slides'

const def = SLIDES[0]
const CONTACT_INDEX = SLIDES.length - 1

const HEADLINE_LINES = ['각자의 모서리가', '맞닿을 때', '비로소 완성됩니다']

const INTRO =
  '기획, 디자인, 개발, 운영 역할은 나뉘어 있지만 벽은 없습니다.\n서로가 무엇을 하는지 보이고, 그들의 의견과 나의 이견이 섞일 때\n비로소 진짜 품질이 만들어진다고 믿습니다.'

interface HeroSectionProps {
  /** 단일 스크롤 엔진 motion value, 슬라이드-0 이탈 페이드용. */
  slide: MotionValue<number>
  /** hero가 활성 슬라이드인 동안 true — 진입 애니메이션 재생을 구동. */
  active: boolean
  /** 특정 슬라이드로 스냅 — CONTACT CTA에 연결. */
  goTo: (next: number) => void
}

/**
 * 슬라이드 0, 다크. 중앙 비디오는 App이 렌더해 이 (투명) 섹션 위로 비친다;
 * 콘텐츠는 그것을 피하도록 배치한다. 상단 행은 헤드라인 좌 / 소개문 우로 고정;
 * 하단 행은 큼직한 고스트 텍스트와 회전 뱃지를 앵커한다. 모든 진입 애니메이션은
 * `active`로 재진입 시 다시 재생된다(헤드라인 reveal은 공용 RevealText로,
 * 나머지는 RISE / FADE variants로).
 */
export function HeroSection({ slide, active, goTo }: HeroSectionProps) {
  // hero에서 스크롤로 멀어질수록 콘텐츠가 페이드 아웃.
  const opacity = useTransform(slide, [0, 0.5], [1, 0])

  return (
    <section
      id={def.id}
      className="relative flex h-[100dvh] w-full flex-col justify-between overflow-hidden"
    >
      <motion.div
        style={{ opacity }}
        className="flex h-full flex-col justify-between"
      >
        {/* 상단: 헤드라인 + CTA(좌), 소개문(우). pt가 헤더 공간을 확보.
            모바일(<768): 세로로 쌓음 — 헤드라인 → CONTACT → 소개문. */}
        <Container className="flex justify-between pt-[65px] max-md:flex-col max-md:gap-6 max-md:pt-[76px]">
          <div className="mt-[clamp(82px,9.86vw,142px)] max-md:mt-0">
            <RevealText
              as="h1"
              active={active}
              lines={HEADLINE_LINES}
              className="text-title-on-dark text-[clamp(36px,4.17vw,60px)] leading-[1.5] font-bold tracking-normal max-md:text-[clamp(26px,7vw,34px)]"
            />

            <motion.div
              variants={RISE}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              transition={{ delay: 0.55, duration: 0.6, ease: SLIDE_EASE }}
              className="mt-[clamp(18px,2.22vw,20px)] max-md:mt-3"
            >
              <button
                type="button"
                onClick={() => goTo(CONTACT_INDEX)}
                className="group border-accent text-accent hover:bg-accent inline-flex items-center gap-2 rounded-full border-2 py-[clamp(8px,0.83vw,12px)] pr-[clamp(8px,0.83vw,12px)] pl-[clamp(12px,1.11vw,16px)] text-[clamp(12px,1.39vw,20px)] leading-[1.2] font-bold tracking-[-0.04em] transition-colors hover:text-white"
              >
                CONTACT
                <ArrowUpRight
                  strokeWidth={2}
                  className="size-[clamp(16px,1.67vw,24px)] shrink-0"
                />
              </button>
            </motion.div>
          </div>

          <motion.p
            variants={RISE}
            initial="hidden"
            animate={active ? 'show' : 'hidden'}
            transition={{ delay: 0.65, duration: 0.6, ease: SLIDE_EASE }}
            className="text-text-on-dark mt-[clamp(93px,11.11vw,160px)] max-w-[clamp(213px,27.78vw,402px)] text-[clamp(12px,1.11vw,16px)] leading-[1.5] font-medium whitespace-pre-line max-md:mt-0 max-md:max-w-none max-md:text-[14px]"
          >
            {INTRO}
          </motion.p>
        </Container>

        {/* 하단: 회전 뱃지(우). 그 뒤의 큼직한 고스트 텍스트는 Frame 레이어
            (HeroGhost)에 있어 비디오가 그 위로 블렌드할 수 있다. */}
        <Container className="relative mb-[clamp(58px,6.94vw,100px)] max-md:mb-8">
          <motion.div
            variants={FADE}
            initial="hidden"
            animate={active ? 'show' : 'hidden'}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute right-6 bottom-0 md:right-16"
          >
            <CircularBadge />
          </motion.div>
        </Container>
      </motion.div>
    </section>
  )
}
