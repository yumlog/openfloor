import type { CSSProperties } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { CircularBadge } from './hero/CircularBadge'
import { SLIDES, SLIDE_EASE } from '@/config/slides'

const def = SLIDES[0]
const CONTACT_INDEX = SLIDES.length - 1

const HEADLINE_LINES = ['더 깊이 이해하고', '더 안정적으로', '구현합니다']

const INTRO =
  '오픈플로어는 AI 워크플로우를 기반으로 기업의 주요 시스템과 디지털 서비스를 ' +
  '기획부터 운영까지 함께 수행하는 개발 파트너입니다.'

interface HeroSectionProps {
  /** The single scroll-engine motion value, for the leave-slide-0 fade. */
  slide: MotionValue<number>
  /** Snap to a slide — wires the CONTACT CTA. */
  goTo: (next: number) => void
}

/**
 * Slide 0, dark. The central video is rendered by App and shows through this
 * (transparent) section; content is laid out to sit clear of it. Top row pins
 * the headline left / intro right; the bottom row anchors the oversized ghost
 * text and the rotating badge.
 */
export function HeroSection({ slide, goTo }: HeroSectionProps) {
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
        {/* Top: headline + CTA (left), intro (right). pt reserves the header. */}
        <Container className="flex justify-between pt-[65px]">
          <div className="mt-[142px]">
            <h1 className="text-title-on-dark text-[60px] leading-[1.5] font-bold tracking-normal">
              {HEADLINE_LINES.map((line, i) => (
                <span
                  key={line}
                  className="hero-reveal-line"
                  style={{ '--line-delay': `${i * 0.27}s` } as CSSProperties}
                >
                  <span className="hero-reveal-clean">{line}</span>
                  <span className="hero-reveal-edge" aria-hidden="true">
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: SLIDE_EASE }}
              className="mt-8"
            >
              <button
                type="button"
                onClick={() => goTo(CONTACT_INDEX)}
                className="group border-accent text-accent hover:bg-accent inline-flex items-center gap-2 rounded-full border-2 py-3 pr-3 pl-4 text-[20px] leading-[1.2] font-bold tracking-[-0.04em] transition-colors hover:text-white"
              >
                CONTACT
                <ArrowUpRight size={24} strokeWidth={2} />
              </button>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: SLIDE_EASE }}
            className="text-text-on-dark mt-[160px] max-w-[360px] text-[16px] leading-[1.5] font-medium"
          >
            {INTRO}
          </motion.p>
        </Container>

        {/* Bottom: oversized ghost text (left) + rotating badge (right). */}
        <Container className="relative mb-[100px]">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
            className="text-ghost-on-dark text-[115px] leading-none font-bold tracking-[-0.04em] whitespace-nowrap"
          >
            <span className="block">UNDERSTAND DEEPER</span>
            <span className="block">BUILD TO LAST</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute right-0 bottom-0"
          >
            <CircularBadge />
          </motion.div>
        </Container>
      </motion.div>
    </section>
  )
}
