import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Bot } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { RISE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'

const def = SLIDES[4]

/* --- 트리 데이터 (좌표 = 원 중심, 트리 박스 기준 디자인 px) --- */
type NodeId = 'root' | 'gen' | 'llm' | 'doc' | 'qa' | 'img' | 'motion' | 'sllm' | 'ir' | 'rfp' | 'eval'
interface VNode { id: NodeId; title: string; desc: string; x: number; y: number }

const TREE_W = 1312
const TREE_H = 660
const R = 28 // 원 반지름

// 컬럼 x: root=28, 중간=580, 오른쪽=940 / y: 중간 4개 164 간격, 오른쪽 6개 균등 배치
const NODES: VNode[] = [
  { id: 'root',   title: '통제 가능한 실전 AI',          desc: 'AI 신뢰성과 제어력을 핵심 축',     x: 28,  y: 356 },
  { id: 'gen',    title: '생성형 비주얼',                desc: '이미지·영상 생성 기술',           x: 490, y: 110 },
  { id: 'llm',    title: '로컬 LLM·파인튜닝',            desc: '온프레미스 모델 최적화',          x: 490, y: 274 },
  { id: 'doc',    title: '문서 분석 자동화',             desc: '비정형 데이터 처리 파이프라인',    x: 490, y: 438 },
  { id: 'qa',     title: 'AI 품질 검증',                desc: '성능 평가·회귀 방어',            x: 490, y: 602 },
  { id: 'img',    title: '이미지 생성 파이프라인',        desc: '자체 R&D·구축 운영',            x: 940, y: 55  },
  { id: 'motion', title: '영상 모션 전이·페이스스왑',      desc: '고객 프로젝트·전략 평가',         x: 940, y: 165 },
  { id: 'sllm',   title: '도메인 특화 sLLM 파인튜닝',     desc: '고객 프로젝트·전략 평가',         x: 940, y: 274 },
  { id: 'ir',     title: '금융 IR 텍스트·감성 분석 엔진',  desc: '고객 프로젝트·구축 운영',         x: 940, y: 383 },
  { id: 'rfp',    title: '공공조달 RFP 분석 파이프라인',   desc: '자체 R&D·구축 운영',            x: 940, y: 493 },
  { id: 'eval',   title: 'AI평가·회귀 검증 방법론',       desc: '자체 R&D·설계',                x: 940, y: 602 },
]

const EDGES: [NodeId, NodeId][] = [
  ['root', 'gen'], ['root', 'llm'], ['root', 'doc'], ['root', 'qa'],
  ['gen', 'img'], ['gen', 'motion'],
  ['llm', 'sllm'],
  ['doc', 'ir'], ['doc', 'rfp'],
  ['qa', 'eval'],
]

const CHILDREN: Record<NodeId, NodeId[]> = {
  root: ['gen', 'llm', 'doc', 'qa'],
  gen: ['img', 'motion'],
  llm: ['sllm'],
  doc: ['ir', 'rfp'],
  qa: ['eval'],
  img: [], motion: [], sllm: [], ir: [], rfp: [], eval: [],
}
const PARENT: Partial<Record<NodeId, NodeId>> = {
  gen: 'root', llm: 'root', doc: 'root', qa: 'root',
  img: 'gen', motion: 'gen', sllm: 'llm', ir: 'doc', rfp: 'doc', eval: 'qa',
}
const DEPTH: Record<NodeId, number> = {
  root: 0, gen: 1, llm: 1, doc: 1, qa: 1,
  img: 2, motion: 2, sllm: 2, ir: 2, rfp: 2, eval: 2,
}

const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<NodeId, VNode>

interface VisionSectionProps {
  active: boolean
}

export function VisionSection({ active }: VisionSectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)
  const H = frame.h / ratio

  const [hovered, setHovered] = useState<NodeId | null>(null)

  const redSet = useMemo(() => {
    const s = new Set<NodeId>(['root']) // 1뎁스(root)는 항상 빨강
    if (hovered && hovered !== 'root') {
      s.add(hovered)
      if (DEPTH[hovered] === 1) {
        // 2뎁스 호버 → 자식 3뎁스 모두
        CHILDREN[hovered].forEach((c) => s.add(c))
      } else if (DEPTH[hovered] === 2) {
        // 3뎁스 호버 → 부모 2뎁스 + 자신만(형제 제외)
        const p = PARENT[hovered]
        if (p) s.add(p)
      }
    }
    return s
  }, [hovered])

  const [widths, setWidths] = useState<Record<string, number>>({})
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // 노드 실폭 측정 → 선이 텍스트 끝에서 나가도록
  useLayoutEffect(() => {
    if (isMobile) return
    const measure = () => {
      const w: Record<string, number> = {}
      for (const n of NODES) {
        const el = nodeRefs.current[n.id]
        if (el) w[n.id] = el.offsetWidth
      }
      setWidths(w)
    }
    measure()
    document.fonts?.ready.then(measure)
  }, [isMobile])

  // 가용 높이에 맞춰 트리 축소 (타이틀≈176 + 패딩200 + 여백 고려)
  const treeScale = Math.min(1, (H - 420) / TREE_H)

  const edgePath = (s: VNode, t: VNode) => {
    const x1 = s.x - R + (widths[s.id] ?? 220) // 소스 우측 끝(텍스트 뒤)
    const y1 = s.y
    const x2 = t.x - R                          // 타겟 아이콘 좌측
    const y2 = t.y
    const k = Math.max(40, (x2 - x1) * 0.5)
    return `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`
  }

  const rise = (d: number) => ({
    variants: RISE,
    initial: 'hidden' as const,
    animate: active ? 'show' : 'hidden',
    transition: entryTransition(d),
  })

  const TitleBlock = (
    <div>
      <motion.p {...rise(0)} className="text-[20px] font-bold leading-[1.4] tracking-[-0.04em] text-[#FB3640]">
        OUR VISION
      </motion.p>
      <motion.p {...rise(0.06)} className="mt-[16px] text-[44px] font-bold leading-[1.5] tracking-normal text-white">
        AI와 함께 일하는 방식이 바뀌는 시대,<br />
        우리는 그 변화를 가장 깊이 만들어갑니다.
      </motion.p>
    </div>
  )

  if (isMobile) {
    return (
      <section id={def.id} className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
        <Container className="flex h-full flex-col pt-[88px]">
          <motion.p {...rise(0)} className="text-[15px] font-bold leading-[1.4] tracking-[-0.04em] text-[#FB3640]">
            OUR VISION
          </motion.p>
          <motion.p {...rise(0.06)} className="mt-4 text-[clamp(26px,7vw,36px)] font-bold leading-[1.5] text-white">
            AI와 함께 일하는 방식이 바뀌는 시대, 우리는 그 변화를 가장 깊이 만들어갑니다.
          </motion.p>
          {/* 모바일 아코디언은 3단계에서 */}
        </Container>
      </section>
    )
  }

  return (
    <section id={def.id} className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden">
      <div className="relative shrink-0" style={{ width: DESIGN_WIDTH, height: H, transform: `scale(${ratio})` }}>
        <div className="flex h-full flex-col justify-between py-[100px] px-[64px]">
          {TitleBlock}

          {/* 파이프라인 트리 */}
          <div className="flex justify-center" style={{ height: TREE_H * treeScale }}>
            <div
              className="relative"
              style={{ width: TREE_W, height: TREE_H, transform: `scale(${treeScale})`, transformOrigin: 'top center' }}
            >
              {/* 곡선 커넥터 (노드 뒤) */}
              <svg
                className="absolute inset-0 overflow-visible"
                width={TREE_W}
                height={TREE_H}
                viewBox={`0 0 ${TREE_W} ${TREE_H}`}
                fill="none"
              >
                {EDGES.map(([sid, tid], i) => {
                  const hot = redSet.has(sid) && redSet.has(tid) // 양 끝이 모두 빨강일 때만 선 빨강
                  return (
                    <motion.path
                      key={`${sid}-${tid}`}
                      d={edgePath(byId[sid], byId[tid])}
                      fill="none"
                      stroke={hot ? '#FB3640' : '#525252'}
                      strokeWidth={hot ? 2 : 1.5}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: active ? 1 : 0 }}
                      transition={{ duration: 0.7, ease: 'easeInOut', delay: (sid === 'root' ? 0.25 : 0.75) + i * 0.04 }}
                    />
                  )
                })}
              </svg>

              {/* 노드 */}
              {NODES.map((n, i) => {
                const hot = redSet.has(n.id)
                const delay = (n.x < 100 ? 0 : n.x < 700 ? 0.45 : 0.95) + i * 0.03
                return (
                  <motion.div
                    key={n.id}
                    ref={(el) => { nodeRefs.current[n.id] = el }}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="absolute flex cursor-default items-center"
                    style={{ left: n.x - R, top: n.y - R }}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
                  >
                    <div
                      className={`flex size-[56px] shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                        hot ? 'border-[#FB3640] bg-[#FB3640]/20' : 'border-white/50 bg-white/[0.08]'
                      }`}
                    >
                      <Bot className={`size-7 transition-colors duration-200 ${hot ? 'text-[#FB3640]' : 'text-neutral-400/80'}`} />
                    </div>
                    <div className="ml-[24px]">
                      <p className="whitespace-nowrap text-[20px] font-bold leading-[1.5] text-white">{n.title}</p>
                      <p className="mt-[4px] whitespace-nowrap text-[18px] font-normal leading-[1.5] text-neutral-400">{n.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
