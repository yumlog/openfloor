import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, FADE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'

/* ---------------------------------------------------------------------------
   Contact — 슬라이드 6, 다크(#171717). 배경은 Frame 크로스페이드가 칠하므로
   섹션은 투명하다. Manifesto와 같은 패턴으로 1440 design-px 캔버스를 `ratio`로
   스케일해 모든 너비에서 같은 비율로 렌더한다 — 내부 요소는 전부 절대 배치.

   폼은 시각 전용(입력 기능 없음): 라벨 + 플레이스홀더 텍스트만 보여준다.
--------------------------------------------------------------------------- */

const def = SLIDES[6]

const TITLE_LINES = ['더 나은 경험을', '함께 만들어갑니다']

interface FormFieldDef {
  label: string
  /** 플레이스홀더 값(시각 전용). */
  value: string
  /** 진입 stagger delay, 초. */
  delay: number
  /** 여러 줄 값(Project Details)은 leading-[1.5]로 렌더. */
  multiline?: boolean
}

const FIELDS: FormFieldDef[] = [
  {
    label: 'Name / Company',
    value: '홍길동 / 주식회사 오픈플로어',
    delay: 0.18,
  },
  { label: 'Email', value: 'hello@company.com', delay: 0.24 },
  { label: 'Phone', value: '연락처를 입력해 주세요', delay: 0.3 },
  {
    label: 'Project Details',
    value:
      '예시) 프로젝트 제목, 선호하는 레퍼런스, 프로젝트 목적, 기존 URL (신규구축 제외)\n레퍼런스 사이트는 프로젝트 진행을 위한 참고용이니 없으면 기재하지 않으셔도 됩니다.',
    delay: 0.36,
    multiline: true,
  },
]

const FOOTER_ROWS = [
  { label: 'TEL', value: '123-456-789' },
  { label: 'MAIL', value: 'ABC@openfloor.kr' },
  { label: 'ADDRESS', value: '서울시 종로구 어쩌구 4층' },
]

const FOOTER_MENUS = ['Company Profile', 'Portfolio']

interface ContactSectionProps {
  /** Contact가 활성 슬라이드인 동안 true — 진입 애니메이션 재생을 구동. */
  active: boolean
}

export function ContactSection({ active }: ContactSectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  // 글자는 너비 기준 유지(≥1440에서 design px 그대로); 좁은 프레임에서만 축소.
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)
  // 캔버스는 `ratio`로 스케일되므로 이 높이가 정확히 100dvh로 렌더된다.
  const H = frame.h / ratio

  // 모바일(<768): scale 캔버스 대신 한 컬럼 풀폭 스택(데스크탑 좌/우 분할을 reflow).
  // 토큰·문구·호버는 데스크탑과 동일, 크기만 모바일용. 푸터는 mt-auto로 하단 밀착.
  if (isMobile) {
    return (
      <section
        id={def.id}
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
      >
        <Container className="flex h-full flex-col pt-[88px] pb-[48px]">
          <motion.p
            variants={RISE}
            initial="hidden"
            animate={active ? 'show' : 'hidden'}
            transition={entryTransition(0)}
            className="text-accent text-[15px] leading-[1.4] font-bold tracking-[-0.04em]"
          >
            CONTACT
          </motion.p>

          <RevealText
            as="h2"
            active={active}
            lines={TITLE_LINES}
            baseDelay={0.12}
            className="text-title-on-dark mt-3 flex flex-col items-start text-[clamp(26px,7vw,34px)] leading-[1.4] font-bold tracking-normal"
          />

          {/* 폼: 풀폭 1줄씩 스택. 시각 전용. */}
          <div className="mt-8 flex flex-col gap-6">
            {FIELDS.map((field) => (
              <motion.div
                key={field.label}
                variants={RISE}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                transition={entryTransition(field.delay)}
              >
                <p className="text-[16px] leading-[1] font-bold tracking-normal text-white">
                  {field.label}
                </p>
                <p
                  className={
                    field.multiline
                      ? 'text-text-on-dark mt-2 text-[15px] leading-[1.5] font-normal tracking-normal whitespace-pre-line'
                      : 'text-text-on-dark mt-2 text-[15px] leading-[1] font-normal tracking-normal'
                  }
                >
                  {field.value}
                </p>
                <div className="bg-text-on-dark/[0.32] mt-3 h-px w-full" />
              </motion.div>
            ))}

            {/* Contact 버튼 — 좌측 정렬, 시각 전용(onClick 없음). */}
            <motion.button
              type="button"
              variants={RISE}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              transition={entryTransition(0.42)}
              className="group border-accent text-accent hover:bg-accent inline-flex items-center gap-2 self-start rounded-full border-2 py-2.5 pr-2.5 pl-3.5 text-[16px] leading-[1.2] font-bold tracking-[-0.04em] transition-colors hover:text-white"
            >
              Contact
              <ArrowUpRight strokeWidth={2} className="size-5 shrink-0" />
            </motion.button>
          </div>

          {/* 푸터: 하단 밀착. */}
          <div className="mt-auto flex flex-col gap-6 pt-12">
            <motion.div
              variants={RISE}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              transition={entryTransition(0.3)}
              className="flex flex-col gap-3"
            >
              {FOOTER_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="flex gap-3 text-[15px] leading-[1] font-normal tracking-normal text-white"
                >
                  <span className="w-[64px] shrink-0">{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={FADE}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              transition={entryTransition(0.36)}
              className="flex flex-col gap-2"
            >
              {FOOTER_MENUS.map((menu) => (
                <span
                  key={menu}
                  className="text-title-on-dark hover:text-accent decoration-accent cursor-pointer text-[clamp(24px,7vw,32px)] leading-[1.4] font-bold tracking-[-0.04em] whitespace-nowrap underline-offset-[5px] transition-colors hover:underline hover:decoration-[2px]"
                >
                  {menu}
                </span>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section
      id={def.id}
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      {/* 스케일된 design-px 캔버스(좌표계 1440 고정). */}
      <div
        className="relative shrink-0"
        style={{ width: DESIGN_WIDTH, height: H, transform: `scale(${ratio})` }}
      >
        {/* 좌측 컬럼: 라벨 + 타이틀. */}
        <div className="absolute" style={{ left: 64, top: 100 }}>
          <motion.p
            variants={RISE}
            initial="hidden"
            animate={active ? 'show' : 'hidden'}
            transition={entryTransition(0)}
            className="text-accent text-[20px] leading-[1.4] font-bold tracking-[-0.04em]"
          >
            CONTACT
          </motion.p>

          <RevealText
            as="h2"
            active={active}
            lines={TITLE_LINES}
            baseDelay={0.12}
            className="text-title-on-dark mt-4 flex flex-col items-start text-[60px] leading-[1.4] font-bold tracking-normal"
          />
        </div>

        {/* 우측 폼: 절대 배치, 너비 640(우측 끝 1376). 시각 전용. */}
        <div
          className="absolute flex flex-col gap-6"
          style={{ left: 736, top: 144, width: 640 }}
        >
          {FIELDS.map((field) => (
            <motion.div
              key={field.label}
              variants={RISE}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              transition={entryTransition(field.delay)}
            >
              <p className="text-[18px] leading-[1] font-bold tracking-normal text-white">
                {field.label}
              </p>
              <p
                className={
                  field.multiline
                    ? 'text-text-on-dark mt-3 text-[16px] leading-[1.5] font-normal tracking-normal whitespace-pre-line'
                    : 'text-text-on-dark mt-3 text-[16px] leading-[1] font-normal tracking-normal'
                }
              >
                {field.value}
              </p>
              <div className="bg-text-on-dark/[0.32] mt-6 h-px w-full" />
            </motion.div>
          ))}

          {/* Contact 버튼 — 폼 컬럼 우측 정렬, 시각 전용(onClick 없음). */}
          <motion.button
            type="button"
            variants={RISE}
            initial="hidden"
            animate={active ? 'show' : 'hidden'}
            transition={entryTransition(0.42)}
            className="group border-accent text-accent hover:bg-accent inline-flex items-center gap-2 self-end rounded-full border-2 py-3 pr-3 pl-4 text-[20px] leading-[1.2] font-bold tracking-[-0.04em] transition-colors hover:text-white"
          >
            Contact
            <ArrowUpRight strokeWidth={2} className="size-6 shrink-0" />
          </motion.button>
        </div>

        {/* 하단 좌측 푸터: TEL / MAIL / ADDRESS. */}
        <motion.div
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(0.3)}
          className="absolute flex flex-col gap-3"
          style={{ left: 64, bottom: 84 }}
        >
          {FOOTER_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex gap-3 text-[16px] leading-[1] font-normal tracking-normal text-white"
            >
              <span className="shrink-0" style={{ width: 76 }}>
                {row.label}
              </span>
              <span>{row.value}</span>
            </div>
          ))}
        </motion.div>

        {/* 하단 우측 푸터: 메뉴. 시각 전용(호버 = accent + 밑줄). */}
        <motion.div
          variants={FADE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(0.36)}
          className="absolute flex items-baseline justify-end gap-[90px]"
          style={{ right: 64, bottom: 84 }}
        >
          {FOOTER_MENUS.map((menu) => (
            <span
              key={menu}
              className="text-title-on-dark hover:text-accent decoration-accent cursor-pointer text-[44px] leading-[1.4] font-bold tracking-[-0.04em] whitespace-nowrap underline-offset-[6px] transition-colors hover:underline hover:decoration-[3px]"
            >
              {menu}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
