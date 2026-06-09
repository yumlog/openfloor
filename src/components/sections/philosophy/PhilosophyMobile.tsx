import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { RISE, entryTransition } from '@/lib/motion'
import { PHILOSOPHY_CARDS } from './cards'

/* ---------------------------------------------------------------------------
   모바일(<768px) reflow. 3D 덱 / 3-up은 폰에 맞지 않으므로, 세 카드를 단순
   세로 스택(이미지 + 이름 + 본문)으로 만들어 한 100dvh 화면 안에 한꺼번에
   보이게 한다. 스케일된 데스크탑이 아닌 전용 reflow. (모바일 다듬기는 나중에
   별도로.)
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
            className={cn(
              'h-[76px] w-[76px] shrink-0 rounded-[12px]',
              card.tint
            )}
          />
          <div>
            <p className="text-card-name text-[16px] leading-[1.4] font-bold tracking-[-0.04em]">
              {card.name}
            </p>
            <p className="text-text-on-light mt-1.5 text-[13px] leading-[1.5]">
              {card.body}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
