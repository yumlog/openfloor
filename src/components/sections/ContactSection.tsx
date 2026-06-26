import { useEffect } from 'react'
import { motion, useMotionValue } from 'motion/react'
import { ArrowDownToLine } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { CentralCrystal } from '@/components/layout/CentralCrystal'
import { RISE, FADE, entryProps } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'
import { cn } from '@/lib/cn'
import { CircularBadge } from './hero/CircularBadge'

/* ---------------------------------------------------------------------------
   Contact — 슬라이드 6, 다크(#171717). 배경은 Frame 크로스페이드가 칠하므로
   섹션은 투명하다. Hero의 비주얼(중앙 3D 크리스탈 + 고스트 텍스트)을 그대로
   재사용해 깔아두고, 그 위로 콘텐츠를 배치한다: 좌상단 이메일/주소 블록 +
   Company Profile 버튼(PDF 다운로드), 우하단 'SCROLL UP' 빨강 뱃지(클릭 시 Hero로).
   데스크탑은 1440 design-px 캔버스를 `ratio`로 스케일; 모바일(<768)은 한 컬럼 reflow.
--------------------------------------------------------------------------- */

const def = SLIDES[6]

const INFO = {
  email: 'by.lee@openfloor.kr',
  address: '서울 중구 세종대로16길 18, 4층',
  phone: '010-8718-5785',
}
/** Company Profile 클릭 시 다운로드할 PDF(public/ → 루트 경로). */
const PROFILE_PDF = '/pdfs/openfloor.pdf'

/**
 * Company Profile 버튼 — Hero CTA와 동일한 외형(accent 보더 pill + accent 텍스트 +
 * 우측 아이콘). 아이콘만 arrow-down-to-line(다운로드), 텍스트는 COMPANY PROFILE.
 * Hero 버튼은 공용 컴포넌트가 아니라 인라인이므로 스타일을 그대로 복제한다.
 * `scaled`: 데스크탑 스케일 캔버스 안에선 디자인px 고정(캔버스가 ratio로 축소),
 * 모바일 normal-flow에선 Hero와 동일한 clamp 반응형(이중 스케일 방지).
 */
function ProfileButton({
  onClick,
  scaled,
}: {
  onClick: () => void
  scaled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group border-accent text-accent hover:bg-accent hover:text-title-on-dark inline-flex items-center gap-2 rounded-full border-2 leading-[1.2] font-bold tracking-[-0.04em] transition-colors',
        scaled
          ? 'py-3 pr-3 pl-4 text-[20px]'
          : 'py-[clamp(8px,0.83vw,12px)] pr-[clamp(8px,0.83vw,12px)] pl-[clamp(12px,1.11vw,16px)] text-[clamp(12px,1.39vw,20px)]'
      )}
    >
      COMPANY PROFILE
      <ArrowDownToLine
        strokeWidth={2}
        className={cn(
          'shrink-0',
          scaled ? 'size-6' : 'size-[clamp(16px,1.67vw,24px)]'
        )}
      />
    </button>
  )
}

interface ContactSectionProps {
  active: boolean
  goTo: (next: number) => void
}

/**
 * Hero와 동일한 마크업/문구의 큼직한 고스트 텍스트. Hero에선 Frame 레이어(HeroGhost)에
 * 있지만, Contact에선 섹션이 이미 스크롤 트랙과 함께 translate되므로 slide 모션 없이
 * 섹션 바닥에 정적으로 둔다. 진입 시 active로 페이드인(Hero와 동일 타이밍).
 */
function ContactGhost({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex h-dvh flex-col justify-end"
    >
      <Container className="mb-[clamp(58px,6.94vw,100px)] max-md:mb-8">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          // enter는 Hero와 동일한 느린 reveal(0.8s 지연 + 1.2s); exit는 즉시 리셋.
          // Hero는 바깥 slide 기반 opacity가 크리스프 리셋을 해주지만 Contact엔 그게
          // 없어, exit까지 느리면 빠른 왕복에서 0까지 못 내려가 재진입 페이드인이
          // 안 보인다 → exit만 빠르게 해서 재진입마다 0→1을 다시 재생.
          transition={{
            delay: active ? 0.8 : 0,
            duration: active ? 1.2 : 0.3,
            ease: 'easeOut',
          }}
          className="text-ghost-on-dark text-[clamp(46px,8vw,115px)] leading-none font-bold tracking-[-0.04em] whitespace-nowrap max-md:text-[44px]"
        >
          <span className="block">UNDERSTAND DEEPER</span>
          <span className="block">BUILD TO LAST</span>
        </motion.h2>
      </Container>
    </div>
  )
}

export function ContactSection({ active, goTo }: ContactSectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = frame.ratio
  const H = frame.h / ratio

  // Company Profile → PDF 다운로드.
  const downloadProfile = () => {
    const a = document.createElement('a')
    a.href = PROFILE_PDF
    a.download = 'openfloor.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // 중앙 크리스탈 — Hero(App.tsx)와 동일한 박스/스케일/위치. 슬라이드 진행에
  // 묶이지 않은 상수 motion value로 구동하고, Contact가 활성일 때만 frameloop를
  // 돌려(visible) GPU를 아낀다. 모바일은 Hero처럼 위로 올려 쌓인 텍스트를 피한다.
  const crystalSize = 860 * ratio
  const crystalY = isMobile ? -frame.h * 0.26 : 0
  const crystalScale = useMotionValue(0.78)
  const crystalX = useMotionValue(0)
  const crystalYMV = useMotionValue(crystalY)
  const crystalOpacity = useMotionValue(1)
  // 리사이즈/모바일 토글로 crystalY가 바뀌면 반영(useMotionValue는 초기값만 잡음).
  useEffect(() => {
    crystalYMV.set(crystalY)
  }, [crystalY, crystalYMV])

  const rise = (d: number) => entryProps(RISE, active, d)
  const fade = (d: number) => entryProps(FADE, active, d)

  // 고스트 + 크리스탈(뒤 레이어) + 우하단 뱃지(앞 레이어) — 데스크탑/모바일 공통.
  const visual = (
    <>
      <ContactGhost active={active} />
      <CentralCrystal
        size={crystalSize}
        scale={crystalScale}
        x={crystalX}
        y={crystalYMV}
        opacity={crystalOpacity}
        lowSpec={isMobile}
        visible={active}
      />
    </>
  )

  // 우하단 'SCROLL UP' 빨강 뱃지 — Hero 뱃지와 동일하게 스케일 캔버스 밖
  // normal-flow에서 clamp 스케일(캔버스 transform과 이중 스케일 방지). 클릭 시 Hero로.
  const scrollUpBadge = (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end">
      <Container className="relative mb-[clamp(58px,6.94vw,100px)] max-md:mb-8">
        <motion.div
          {...fade(0.3)}
          className="pointer-events-auto absolute right-6 bottom-0 md:right-16"
        >
          <CircularBadge
            label="SCROLL UP • SCROLL UP •"
            direction="up"
            tracking="0.3em"
            onClick={() => goTo(0)}
          />
        </motion.div>
      </Container>
    </div>
  )

  // 모바일(<768): 한 컬럼 풀폭 스택.
  if (isMobile) {
    return (
      <section
        id={def.id}
        className="relative flex h-dvh w-full flex-col overflow-hidden"
      >
        {visual}
        {/* Hero 모바일과 동일: 크리스탈을 위로 올리고(-0.26h) 콘텐츠를 pt-[39vh]로
            내려 3D 오브젝트 → 텍스트 → 고스트 순으로 겹치지 않게 한다. */}
        <Container className="relative z-10 flex h-full flex-col pt-[39vh] pb-12">
          <motion.p
            {...rise(0)}
            className="text-title-on-dark font-montserrat text-[clamp(26px,7.5vw,38px)] leading-none font-bold tracking-[-0.04em]"
          >
            {INFO.email}
          </motion.p>
          <motion.div {...rise(0.08)} className="mt-6 flex flex-col gap-4">
            <div>
              <p className="text-text-nav text-[14px] leading-[1.3] font-normal tracking-[-0.04em]">
                Address
              </p>
              <p className="text-title-on-dark mt-2 text-[16px] leading-none font-normal tracking-normal">
                {INFO.address}
              </p>
            </div>
            <div>
              <p className="text-text-nav text-[14px] leading-[1.3] font-normal tracking-[-0.04em]">
                Phone Number
              </p>
              <p className="text-title-on-dark mt-2 text-[16px] leading-none font-normal tracking-normal">
                {INFO.phone}
              </p>
            </div>
          </motion.div>

          {/* Company Profile — 주소 블록 아래 좌측, Hero 스타일 버튼(PDF 다운로드). */}
          <motion.div {...rise(0.14)} className="mt-7">
            <ProfileButton scaled={false} onClick={downloadProfile} />
          </motion.div>
        </Container>
        {scrollUpBadge}
      </section>
    )
  }

  // 데스크탑: 스케일 캔버스 + 절대배치(패딩 100/64).
  return (
    <section
      id={def.id}
      className="relative flex h-dvh w-full items-center justify-center overflow-hidden"
    >
      {visual}
      <div
        className="relative z-10 shrink-0"
        style={{ width: DESIGN_WIDTH, height: H, transform: `scale(${ratio})` }}
      >
        {/* 좌상단: 이메일 + Address / Phone Number + Company Profile 버튼.
            top:128 = 헤더(absolute 오버레이) 포함 상단 패딩 128(디자인px, 캔버스가 ratio로 비례 축소). */}
        <div className="absolute" style={{ left: 64, top: 128 }}>
          <motion.p
            {...rise(0)}
            className="text-title-on-dark font-montserrat text-[44px] leading-none font-bold tracking-[-0.04em]"
          >
            {INFO.email}
          </motion.p>
          <motion.div {...rise(0.08)} className="mt-10 flex gap-10.5">
            <div>
              <p className="text-text-on-dark text-[20px] leading-[1.3] font-normal tracking-[-0.04em]">
                Address
              </p>
              <p className="text-title-on-dark mt-3 text-[20px] leading-none font-normal tracking-[-0.015em]">
                {INFO.address}
              </p>
            </div>
            <div>
              <p className="text-text-on-dark text-[20px] leading-[1.3] font-normal tracking-[-0.04em]">
                Phone Number
              </p>
              <p className="text-title-on-dark mt-3 text-[20px] leading-none font-normal tracking-[-0.015em]">
                {INFO.phone}
              </p>
            </div>
          </motion.div>

          {/* Company Profile — Address/Phone 블록과 36px(mt-9) 간격, Hero 스타일 버튼. */}
          <motion.div {...rise(0.2)} className="mt-9">
            <ProfileButton scaled onClick={downloadProfile} />
          </motion.div>
        </div>
      </div>
      {scrollUpBadge}
    </section>
  )
}
