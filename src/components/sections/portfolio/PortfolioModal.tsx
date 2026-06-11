import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project } from './projects'

/* ---------------------------------------------------------------------------
   Portfolio 상세 모달(design-6.png). 어두운 배경 + 가운데 둥근 프레임; 프레임은
   프로젝트의 콘텐츠 슬라이드 이미지를 담고 그 사이를 크로스페이드한다. 이전/다음
   화살표는 프레임 가장자리에서 36px 떨어진 어두운 영역에 있다.

   슬라이드 트랙이 transform 되어 있어, 그 아래 중첩된 `fixed` 오버레이는 갇히므로
   PortfolioSection이 body 포털을 통해 렌더한다.
--------------------------------------------------------------------------- */

// ≥1440에선 프레임이 고정 1024 너비; 그 아래에선 양쪽에 208px 어두운 거터를
// 유지. 높이는 항상 위/아래 96px 어두운 마진을 남긴다.
const MODAL_W = 'min(calc(100vw - 416px), 1024px)'
const MODAL_H = 'calc(100dvh - 192px)'

interface PortfolioModalProps {
  project: Project
  onClose: () => void
}

export function PortfolioModal({ project, onClose }: PortfolioModalProps) {
  const [i, setI] = useState(0)
  const slides = project.slides
  const slide = slides[i]
  const atFirst = i === 0
  const atLast = i === slides.length - 1

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClose}
    >
      <motion.div
        className="relative"
        style={{ width: MODAL_W, height: MODAL_H }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 흰색 베이스 — 슬라이드 크로스페이드(두 레이어 모두 opacity<1) 시 뒤의
            어두움이 아니라 흰색이 보이게; 실제 이미지가 들어와도 backstop 역할. */}
        <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-white">
          <AnimatePresence>
            <motion.img
              key={i}
              src={slide.image}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </AnimatePresence>
        </div>

        {/* 어두운 영역의 화살표, 프레임 가장자리에서 36px(52px 버튼 = -88). */}
        {!atFirst && (
          <button
            type="button"
            aria-label="이전 슬라이드"
            onClick={() => setI((n) => n - 1)}
            className="absolute top-1/2 left-[-88px] flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/60"
          >
            <ChevronLeft className="h-[26px] w-[26px] text-white" />
          </button>
        )}
        {!atLast && (
          <button
            type="button"
            aria-label="다음 슬라이드"
            onClick={() => setI((n) => n + 1)}
            className="absolute top-1/2 right-[-88px] flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/60"
          >
            <ChevronRight className="h-[26px] w-[26px] text-white" />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
