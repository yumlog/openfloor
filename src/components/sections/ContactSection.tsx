import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { RISE, FADE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'

/* ---------------------------------------------------------------------------
   Contact — 슬라이드 6, 다크(#171717). 배경은 Frame 크로스페이드가 칠하므로
   섹션은 투명하다. 데스크탑은 1440 design-px 캔버스를 `ratio`로 스케일해 모든
   너비에서 같은 비율로 렌더(내부 요소는 절대 배치); 모바일(<768)은 한 컬럼 reflow.
--------------------------------------------------------------------------- */

const def = SLIDES[6]

const BADGES = ['R&D', 'Research', 'UXUI', 'Development', 'AI Platform']
const INFO = {
  email: 'by.lee@openfloor.kr',
  address: '서울 중구 세종대로16길 18, 4층',
  phone: '010-8718-5785',
}
const MENUS = ['Company Profile', 'Portfolio']

interface ContactSectionProps {
  active: boolean
}

export function ContactSection({ active }: ContactSectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)
  const H = frame.h / ratio

  const rise = (d: number) => ({
    variants: RISE,
    initial: 'hidden' as const,
    animate: active ? ('show' as const) : ('hidden' as const),
    transition: entryTransition(d),
  })
  const fade = (d: number) => ({
    variants: FADE,
    initial: 'hidden' as const,
    animate: active ? ('show' as const) : ('hidden' as const),
    transition: entryTransition(d),
  })

  // 모바일(<768): 한 컬럼 풀폭 스택.
  if (isMobile) {
    return (
      <section
        id={def.id}
        className="relative flex h-dvh w-full flex-col overflow-hidden"
      >
        <Container className="flex h-full flex-col pt-22 pb-12">
          <motion.p
            {...rise(0)}
            className="text-text-on-dark text-[15px] leading-[1.3] font-normal tracking-[-0.04em]"
          >
            Ready to start?
          </motion.p>
          <motion.p
            {...rise(0.06)}
            className="text-title-on-dark mt-5 text-[clamp(26px,7.5vw,38px)] leading-none font-bold tracking-normal"
          >
            {INFO.email}
          </motion.p>
          <motion.div {...rise(0.12)} className="mt-6 flex flex-col gap-4">
            <div>
              <p className="text-text-nav text-[14px] leading-[1.3] font-normal tracking-[-0.04em]">
                Address
              </p>
              <p className="text-text-on-dark mt-2 text-[16px] leading-none font-normal tracking-normal">
                {INFO.address}
              </p>
            </div>
            <div>
              <p className="text-text-nav text-[14px] leading-[1.3] font-normal tracking-[-0.04em]">
                Phone Number
              </p>
              <p className="text-text-on-dark mt-2 text-[16px] leading-none font-normal tracking-normal">
                {INFO.phone}
              </p>
            </div>
          </motion.div>
          <motion.button
            type="button"
            {...rise(0.18)}
            className="group border-accent text-accent hover:bg-accent hover:text-title-on-dark mt-6 inline-flex items-center gap-2 self-start rounded-full border-2 py-2.5 pr-2.5 pl-3.5 text-[16px] leading-[1.2] font-bold tracking-[-0.04em] transition-colors"
          >
            GET IN TOUCH
            <ArrowUpRight strokeWidth={2} className="size-5 shrink-0" />
          </motion.button>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {BADGES.map((b, i) => (
              <motion.span
                key={b}
                {...rise(0.1 + i * 0.05)}
                className="border-text-on-dark text-text-on-dark inline-flex h-9 items-center rounded-full border px-3 text-[14px] leading-[1.2] font-normal tracking-[-0.04em]"
              >
                {b}
              </motion.span>
            ))}
          </div>

          <div className="mt-auto">
            <motion.p
              {...fade(0.1)}
              className="text-accent text-[clamp(52px,15vw,104px)] leading-none font-bold tracking-[-0.04em]"
            >
              CONTACT
            </motion.p>
            <motion.div {...fade(0.2)} className="mt-3 flex gap-5">
              {MENUS.map((m) => (
                <span
                  key={m}
                  className="text-title-on-dark hover:text-accent decoration-accent cursor-pointer text-[clamp(20px,5.5vw,26px)] leading-[1.4] font-bold tracking-[-0.04em] whitespace-nowrap underline-offset-[5px] transition-colors hover:underline hover:decoration-2"
                >
                  {m}
                </span>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>
    )
  }

  // 데스크탑: 스케일 캔버스 + 절대배치(패딩 100/64).
  return (
    <section
      id={def.id}
      className="relative flex h-dvh w-full items-center justify-center overflow-hidden"
    >
      <div
        className="relative shrink-0"
        style={{ width: DESIGN_WIDTH, height: H, transform: `scale(${ratio})` }}
      >
        {/* 좌상단 블록 */}
        <div className="absolute" style={{ left: 64, top: 100 }}>
          <motion.p
            {...rise(0)}
            className="text-text-on-dark text-[20px] leading-[1.3] font-normal tracking-[-0.04em]"
          >
            Ready to start?
          </motion.p>
          <motion.p
            {...rise(0.06)}
            className="text-title-on-dark mt-9 text-[44px] leading-none font-bold tracking-normal"
          >
            {INFO.email}
          </motion.p>
          <motion.div {...rise(0.12)} className="mt-10 flex gap-10.5">
            <div>
              <p className="text-text-nav text-[20px] leading-[1.3] font-normal tracking-[-0.04em]">
                Address
              </p>
              <p className="text-text-on-dark mt-3 text-[20px] leading-none font-normal tracking-normal">
                {INFO.address}
              </p>
            </div>
            <div>
              <p className="text-text-nav text-[20px] leading-[1.3] font-normal tracking-[-0.04em]">
                Phone Number
              </p>
              <p className="text-text-on-dark mt-3 text-[20px] leading-none font-normal tracking-normal">
                {INFO.phone}
              </p>
            </div>
          </motion.div>
          <motion.button
            type="button"
            {...rise(0.18)}
            className="group border-accent text-accent hover:bg-accent hover:text-title-on-dark mt-9 inline-flex items-center gap-2 rounded-full border-2 py-3 pr-3 pl-4 text-[20px] leading-[1.2] font-bold tracking-[-0.04em] transition-colors"
          >
            GET IN TOUCH
            <ArrowUpRight strokeWidth={2} className="size-6 shrink-0" />
          </motion.button>
        </div>

        {/* 우상단 고스트 뱃지(패딩 제외 62px → top 162) */}
        <div
          className="absolute flex flex-col items-end gap-5"
          style={{ right: 64, top: 162 }}
        >
          {BADGES.map((b, i) => (
            <motion.span
              key={b}
              {...rise(0.1 + i * 0.06)}
              className="border-text-on-dark text-text-on-dark inline-flex h-12 items-center rounded-full border px-4 text-[20px] leading-[1.2] font-normal tracking-[-0.04em]"
            >
              {b}
            </motion.span>
          ))}
        </div>

        {/* 좌하단 CONTACT */}
        <motion.p
          {...fade(0.1)}
          className="text-accent absolute text-[136px] leading-none font-bold tracking-[-0.04em]"
          style={{ left: 64, bottom: 100 }}
        >
          CONTACT
        </motion.p>

        {/* 우하단 메뉴(호버 기존 유지) */}
        <motion.div
          {...fade(0.24)}
          className="absolute flex items-baseline gap-8"
          style={{ right: 64, bottom: 100 }}
        >
          {MENUS.map((m) => (
            <span
              key={m}
              className="text-title-on-dark hover:text-accent decoration-accent cursor-pointer text-[32px] leading-[1.4] font-bold tracking-[-0.04em] whitespace-nowrap underline-offset-[6px] transition-colors hover:underline hover:decoration-[3px]"
            >
              {m}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
