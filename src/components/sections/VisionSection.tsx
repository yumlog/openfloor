import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Bot, ChevronDown } from 'lucide-react'
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

const MID_IDS: NodeId[] = ['gen', 'llm', 'doc', 'qa']
const RIGHT_IDS: NodeId[] = ['img', 'motion', 'sllm', 'ir', 'rfp', 'eval']

interface VisionSectionProps {
  active: boolean
}

export function VisionSection({ active }: VisionSectionProps) {
  const frame = useFrameSize()
  const isMobile = frame.w < 768
  const ratio = Math.min(1, frame.w / DESIGN_WIDTH)
  const H = frame.h / ratio

  const [hovered, setHovered] = useState<NodeId | null>(null)
  const [openId, setOpenId] = useState<NodeId | null>(null) // 모바일 아코디언

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

  // 2뎁스 라인 공통 시작 x = 가장 긴 2뎁스 노드의 우측 끝
  const midExit = useMemo(() => {
    let m = 0
    for (const id of MID_IDS) {
      const w = widths[id]
      if (w) m = Math.max(m, byId[id].x - R + w)
    }
    return m || 760
  }, [widths])

  // 3뎁스 컬럼 x = 가장 긴 3뎁스 노드 우측이 트리 우측 끝(=우측 패딩 64)에 닿도록
  const maxRightW = useMemo(() => {
    let m = 0
    for (const id of RIGHT_IDS) {
      const w = widths[id]
      if (w) m = Math.max(m, w)
    }
    return m || 380
  }, [widths])
  const rightX = TREE_W - maxRightW + R

  const effX = (id: NodeId) => (RIGHT_IDS.includes(id) ? rightX : byId[id].x)

  const edgePath = (sid: NodeId, tid: NodeId) => {
    const s = byId[sid]
    const t = byId[tid]
    const x1 = MID_IDS.includes(sid) ? midExit : s.x - R + (widths[sid] ?? 220) // 2뎁스는 공통, root는 자기 텍스트 끝
    const y1 = s.y
    const x2 = effX(tid) - R // 타겟 아이콘 좌측
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
    const SLOT_W = 32
    const ROW_H = 52
    const cy = ROW_H / 2 // 26
    const CR = 12 // 코너 반지름
    const GRAY = '#525252'
    const RED = '#FB3640'

    // 활성(빨강): root는 항상 + 열린 2뎁스와 그 자식
    const mRed = new Set<NodeId>(['root'])
    if (openId) {
      mRed.add(openId)
      CHILDREN[openId].forEach((c) => mRed.add(c))
    }

    // 보이는 행 구성
    type TreeRow = { id: NodeId; depth: number; isLast: boolean; parentLast: boolean; open: boolean }
    const rows: TreeRow[] = [{ id: 'root', depth: 0, isLast: true, parentLast: true, open: false }]
    MID_IDS.forEach((mid, i) => {
      const midLast = i === MID_IDS.length - 1
      const open = openId === mid
      rows.push({ id: mid, depth: 1, isLast: midLast, parentLast: true, open })
      if (open) {
        CHILDREN[mid].forEach((kid, j) => {
          rows.push({ id: kid, depth: 2, isLast: j === CHILDREN[mid].length - 1, parentLast: midLast, open: false })
        })
      }
    })

    return (
      <section id={def.id} className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
        <Container className="flex h-full flex-col pt-[88px] pb-[24px]">
          <motion.p {...rise(0)} className="text-[14px] font-bold leading-[1.4] tracking-[-0.04em] text-[#FB3640]">
            OUR VISION
          </motion.p>
          <motion.p {...rise(0.06)} className="mt-3 text-[clamp(20px,5.5vw,28px)] font-bold leading-[1.35] text-white">
            AI와 함께 일하는 방식이 바뀌는 시대, 우리는 그 변화를 가장 깊이 만들어갑니다.
          </motion.p>

          {/* 세로 트리 + 좌측 곡선 커넥터 */}
          <motion.div {...rise(0.12)} className="mt-6 flex flex-col">
            {rows.map((row) => {
              const node = byId[row.id]
              const d = row.depth
              const isRed = mRed.has(row.id)
              const gutterW = d * SLOT_W
              const ex = d * SLOT_W - SLOT_W / 2 // 엘보/서브트렁크 x (16, 48)
              const elbowRed = d === 2 || row.open
              const isMid = d === 1

              const NodeInner = (
                <>
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                      isRed ? 'border-[#FB3640] bg-[#FB3640]/20' : 'border-white/50 bg-white/[0.08]'
                    }`}
                  >
                    <Bot className={`size-4 transition-colors duration-200 ${isRed ? 'text-[#FB3640]' : 'text-neutral-400/80'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold leading-tight text-white">{node.title}</p>
                    <p className="truncate text-[11px] leading-tight text-neutral-400">{node.desc}</p>
                  </div>
                  {isMid && (
                    <ChevronDown
                      className={`size-4 shrink-0 transition-transform duration-200 ${row.open ? 'rotate-180 text-[#FB3640]' : 'text-neutral-500'}`}
                    />
                  )}
                </>
              )

              return (
                <div key={row.id} className="relative flex items-stretch" style={{ height: ROW_H }}>
                  {/* root 하강 스텁(회색) */}
                  {d === 0 && (
                    <span className="absolute" style={{ left: SLOT_W / 2 - 1, top: cy, width: 2, height: ROW_H - cy, background: GRAY }} />
                  )}

                  {/* 커넥터 거터 */}
                  {d > 0 && (
                    <svg width={gutterW} height={ROW_H} className="shrink-0" style={{ overflow: 'visible' }}>
                      {/* 루트 트렁크 세로(회색) */}
                      {d === 1 && (
                        <line x1={SLOT_W / 2} y1={0} x2={SLOT_W / 2} y2={row.isLast ? cy : ROW_H} stroke={GRAY} strokeWidth={1.5} />
                      )}
                      {/* 3뎁스: 부모 트렁크 통과(회색, 부모가 막내 아닐 때만) */}
                      {d === 2 && !row.parentLast && (
                        <line x1={SLOT_W / 2} y1={0} x2={SLOT_W / 2} y2={ROW_H} stroke={GRAY} strokeWidth={1.5} />
                      )}
                      {/* 3뎁스: 자식 서브트렁크 세로(빨강) */}
                      {d === 2 && (
                        <line x1={ex} y1={0} x2={ex} y2={row.isLast ? cy : ROW_H} stroke={RED} strokeWidth={2} />
                      )}
                      {/* 엘보 곡선 */}
                      <path
                        d={`M ${ex} ${cy - CR} Q ${ex} ${cy} ${ex + CR} ${cy} H ${gutterW}`}
                        fill="none"
                        stroke={elbowRed ? RED : GRAY}
                        strokeWidth={elbowRed ? 2 : 1.5}
                        strokeLinecap="round"
                      />
                      {/* 열린 2뎁스: 자식으로 내려가는 빨강 스텁(자기 아이콘 아래 x48) */}
                      {d === 1 && row.open && (
                        <line x1={SLOT_W + SLOT_W / 2} y1={cy} x2={SLOT_W + SLOT_W / 2} y2={ROW_H} stroke={RED} strokeWidth={2} />
                      )}
                    </svg>
                  )}

                  {/* 노드 내용 */}
                  {isMid ? (
                    <button type="button" onClick={() => setOpenId(row.open ? null : row.id)} className="flex flex-1 items-center gap-3 text-left">
                      {NodeInner}
                    </button>
                  ) : (
                    <div className="flex flex-1 items-center gap-3">{NodeInner}</div>
                  )}
                </div>
              )
            })}
          </motion.div>
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
                {/* 회색 베이스 — 전부 먼저(아래 레이어) */}
                {EDGES.map(([sid, tid], i) => (
                  <motion.path
                    key={`base-${sid}-${tid}`}
                    d={edgePath(sid, tid)}
                    fill="none"
                    stroke="#525252"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: active ? 1 : 0 }}
                    transition={{ duration: 0.7, ease: 'easeInOut', delay: (sid === 'root' ? 0.25 : 0.75) + i * 0.04 }}
                  />
                ))}
                {/* 빨강 오버레이 — 전부 나중(위 레이어). opacity로 비호버 시 점 숨김 */}
                {EDGES.map(([sid, tid]) => {
                  const hot = redSet.has(sid) && redSet.has(tid)
                  return (
                    <motion.path
                      key={`red-${sid}-${tid}`}
                      d={edgePath(sid, tid)}
                      fill="none"
                      stroke="#FB3640"
                      strokeWidth={2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: hot ? 1 : 0, opacity: hot ? 1 : 0 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.2 } }}
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
                    style={{ left: effX(n.id) - R, top: n.y - R }}
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
                      <p className="mt-[4px] whitespace-nowrap text-[14px] font-normal leading-[1.5] text-neutral-400">{n.desc}</p>
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
