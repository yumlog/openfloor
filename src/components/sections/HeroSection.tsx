import { motion, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { CircularBadge } from './hero/CircularBadge'
import { SLIDES, SLIDE_EASE } from '@/config/slides'

const def = SLIDES[0]
const CONTACT_INDEX = SLIDES.length - 1

const HEADLINE_LINES = ['더 깊이 이해하고', '더 안정적으로', '구현합니다']

const INTRO =
  '오픈플로어는 AI 워크플로우를 기반으로\n기업의 주요 시스템과 디지털 서비스를\n기획부터 운영까지 함께 수행하는\n개발 파트너입니다.'

// Fade/rise variants for the supporting entry animations. Driven by `active` so
// they replay every time the hero is (re)entered rather than only on mount.
const RISE = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
const FADE = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

interface HeroSectionProps {
  /** The single scroll-engine motion value, for the leave-slide-0 fade. */
  slide: MotionValue<number>
  /** True while the hero is the active slide — drives entry-animation replay. */
  active: boolean
  /** Snap to a slide — wires the CONTACT CTA. */
  goTo: (next: number) => void
}

/**
 * Slide 0, dark. The central video is rendered by App and shows through this
 * (transparent) section; content is laid out to sit clear of it. Top row pins
 * the headline left / intro right; the bottom row anchors the oversized ghost
 * text and the rotating badge. All entry animations replay on re-entry via
 * `active` (the headline reveal through the shared RevealText, the rest through
 * the RISE / FADE variants).
 */
export function HeroSection({ slide, active, goTo }: HeroSectionProps) {
  // Content fades out as we scroll away from the hero.
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
        {/* Top: headline + CTA (left), intro (right). pt reserves the header.
            Mobile (<768): stack vertically — headline → CONTACT → intro. */}
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
            className="text-text-on-dark mt-[clamp(93px,11.11vw,160px)] max-w-[clamp(153px,18.33vw,264px)] text-[clamp(12px,1.11vw,16px)] leading-[1.5] font-medium whitespace-pre-line max-md:mt-0 max-md:max-w-none max-md:text-[14px]"
          >
            {INTRO}
          </motion.p>
        </Container>

        {/* Bottom: rotating badge (right). The oversized ghost text behind it
            lives in the Frame layer (HeroGhost) so the video can blend over it. */}
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
