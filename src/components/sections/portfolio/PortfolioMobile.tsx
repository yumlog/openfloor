import { motion } from 'motion/react'
import { RISE, entryTransition } from '@/lib/motion'
import type { Project } from './projects'

/* ---------------------------------------------------------------------------
   모바일(<768px) reflow. 아크 휠은 폰에 맞지 않으므로, 프로젝트를 한 100dvh
   화면 안의 단순 가운데 세로 리스트(컬러 칩 + 브랜드 이름)로 만든다. 전용
   대체물 — 완전한 모바일 캐러셀은 나중에.
--------------------------------------------------------------------------- */

export function PortfolioMobile({
  projects,
  active,
}: {
  projects: Project[]
  active: boolean
}) {
  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-3 px-6 pb-[48px]">
      {projects.map((p, i) => (
        <motion.div
          key={p.id}
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(0.12 + i * 0.05)}
          className="flex items-center gap-4"
        >
          <div
            className="h-[52px] w-[52px] shrink-0 rounded-[12px]"
            style={{ backgroundColor: p.color }}
          />
          <p className="text-card-name text-[15px] leading-[1.4] font-bold tracking-[-0.04em]">
            {p.name}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
