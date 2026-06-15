import { motion } from 'motion/react'
import { RISE, entryTransition } from '@/lib/motion'
import { PHILOSOPHY_CARDS } from './cards'

/* ---------------------------------------------------------------------------
   모바일(<768px) reflow. 스택/확대는 폰에 맞지 않으므로, 세 카드를 단순 세로
   리스트(스와치 + 타이틀 + 본문)로 한 100dvh 안에 보여준다. (모바일 다듬기 별도.)
--------------------------------------------------------------------------- */

export function PhilosophyMobile({ active }: { active: boolean }) {
  return (
    <div className="flex w-full flex-col gap-5 px-6">
      {PHILOSOPHY_CARDS.map((card, i) => (
        <motion.div
          key={card.id}
          variants={RISE}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
          transition={entryTransition(0.2 + i * 0.1)}
          className="flex items-center gap-4"
        >
          <div
            className="h-[76px] w-[76px] shrink-0 rounded-[12px]"
            style={{ backgroundColor: card.bg }}
          />
          <div>
            <p className="text-title-on-dark text-[16px] leading-[1.4] font-bold tracking-[-0.04em]">
              {card.name}
            </p>
            <p className="text-text-on-dark mt-1.5 text-[13px] leading-[1.5] whitespace-pre-line">
              {card.body}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
