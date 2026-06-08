import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { RISE, entryTransition } from '@/lib/motion'
import { PHILOSOPHY_CARDS } from './cards'

/* ---------------------------------------------------------------------------
   Mobile (<768px) reflow. The 3D deck / 3-up doesn't fit a phone, so the three
   cards become a simple vertical stack (image + name + body), all visible at
   once, within one 100dvh screen. Purpose-built reflow — not the scaled
   desktop. (Mobile polish is a separate later pass.)
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
