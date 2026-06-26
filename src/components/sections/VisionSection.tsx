import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { AnimatePresence, motion, useSpring } from 'motion/react'
import {
  Bot,
  BrainCircuit,
  ChevronDown,
  Clapperboard,
  Cpu,
  FileSearch,
  FlaskConicalOff,
  ImagePlay,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { RevealText } from '@/components/ui/RevealText'
import { RISE, entryTransition } from '@/lib/motion'
import { useFrameSize } from '@/hooks/useFrameSize'
import { clamp } from '@/lib/math'
import { DESIGN_WIDTH, SLIDES } from '@/config/slides'

const def = SLIDES[4]

/* --- 트리 데이터 (좌표 = 원 중심, 트리 박스 기준 디자인 px) --- */
type NodeId =
  | 'root'
  | 'gen'
  | 'llm'
  | 'doc'
  | 'qa'
  | 'img'
  | 'motion'
  | 'sllm'
  | 'ir'
  | 'rfp'
  | 'eval'
interface VNode {
  id: NodeId
  title: string
  desc: string
  x: number
  y: number
  icon: LucideIcon
}

const TREE_W = 1312
const TREE_H = 660
const R = 28 // 원 반지름

// 컬럼 x: root=28, 중간=560, 오른쪽=동적(rightX) / y: 중간 4개 164 간격, 오른쪽 6개 균등 배치
const NODES: VNode[] = [
  {
    id: 'root',
    title: '통제 가능한 실전 AI',
    desc: '신뢰성과 제어 가능성을 갖춘 업무형 AI 구조',
    x: 28,
    y: 356,
    icon: Bot,
  },
  {
    id: 'gen',
    title: '생성형 비주얼 AI',
    desc: '이미지·영상 생성 파이프라인',
    x: 560,
    y: 110,
    icon: ImagePlay,
  },
  {
    id: 'llm',
    title: '온프레미스 LLM 최적화',
    desc: '보안 환경에 맞춘 도메인 모델 구축',
    x: 560,
    y: 274,
    icon: Cpu,
  },
  {
    id: 'doc',
    title: '비정형 문서 분석',
    desc: '문서를 분석 가능한 데이터로 전환',
    x: 560,
    y: 438,
    icon: FileSearch,
  },
  {
    id: 'qa',
    title: 'AI 평가·검증',
    desc: '성능 평가와 회귀 방어 체계',
    x: 560,
    y: 602,
    icon: ShieldCheck,
  },
  {
    id: 'img',
    title: '이미지 생성 파이프라인',
    desc: '자체 R&D 기반 구축·운영',
    x: 940,
    y: 55,
    icon: WandSparkles,
  },
  {
    id: 'motion',
    title: '영상 모션 전이·페이스스왑',
    desc: '고객 프로젝트 기반 적용·검증',
    x: 940,
    y: 165,
    icon: Clapperboard,
  },
  {
    id: 'sllm',
    title: '도메인 맞춤형 sLLM 파인튜닝',
    desc: '고객 프로젝트 기반 적용·검증',
    x: 940,
    y: 274,
    icon: BrainCircuit,
  },
  {
    id: 'ir',
    title: '금융 IR 텍스트·감성 분석 엔진',
    desc: '고객 프로젝트 기반 구축·운영',
    x: 940,
    y: 383,
    icon: TrendingUp,
  },
  {
    id: 'rfp',
    title: '공공조달 RFP 분석 파이프라인',
    desc: '자체 R&D 기반 구축·운영',
    x: 940,
    y: 493,
    icon: ScrollText,
  },
  {
    id: 'eval',
    title: 'AI 평가·회귀 검증 체계',
    desc: '자체 R&D 기반 설계',
    x: 940,
    y: 602,
    icon: FlaskConicalOff,
  },
]

const EDGES: [NodeId, NodeId][] = [
  ['root', 'gen'],
  ['root', 'llm'],
  ['root', 'doc'],
  ['root', 'qa'],
  ['gen', 'img'],
  ['gen', 'motion'],
  ['llm', 'sllm'],
  ['doc', 'ir'],
  ['doc', 'rfp'],
  ['qa', 'eval'],
]

const CHILDREN: Record<NodeId, NodeId[]> = {
  root: ['gen', 'llm', 'doc', 'qa'],
  gen: ['img', 'motion'],
  llm: ['sllm'],
  doc: ['ir', 'rfp'],
  qa: ['eval'],
  img: [],
  motion: [],
  sllm: [],
  ir: [],
  rfp: [],
  eval: [],
}
const PARENT: Partial<Record<NodeId, NodeId>> = {
  gen: 'root',
  llm: 'root',
  doc: 'root',
  qa: 'root',
  img: 'gen',
  motion: 'gen',
  sllm: 'llm',
  ir: 'doc',
  rfp: 'doc',
  eval: 'qa',
}
const DEPTH: Record<NodeId, number> = {
  root: 0,
  gen: 1,
  llm: 1,
  doc: 1,
  qa: 1,
  img: 2,
  motion: 2,
  sllm: 2,
  ir: 2,
  rfp: 2,
  eval: 2,
}

const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<
  NodeId,
  VNode
>

const MID_IDS: NodeId[] = ['gen', 'llm', 'doc', 'qa']
const RIGHT_IDS: NodeId[] = ['img', 'motion', 'sllm', 'ir', 'rfp', 'eval']

interface VisionSectionProps {
  active: boolean
}

// 마우스 기반 트리 3D 틸트 — 최대 기울기(도)와 원근. 작게(슬쩍) + 부드러운 스프링(뉘엿).
const TILT_MAX = 7
const TILT_PERSPECTIVE = 1400

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

  // 마우스 위치에 따라 트리 전체가 슬쩍 기울고, 스프링이 뉘엿뉘엿 따라온다(데스크탑).
  const sectionRef = useRef<HTMLElement>(null)
  const tiltX = useSpring(0, { stiffness: 50, damping: 12 })
  const tiltY = useSpring(0, { stiffness: 50, damping: 12 })
  const handleTilt = (e: ReactPointerEvent<HTMLElement>) => {
    const el = sectionRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    tiltY.set(clamp(nx, -1, 1) * TILT_MAX)
    tiltX.set(clamp(-ny, -1, 1) * TILT_MAX)
  }
  const resetTilt = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

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

  // 세로(y)만 압축해 가용 높이에 맞춤 — 가로는 풀폭 유지(좌우 패딩 64px 고정)
  const vScale = Math.min(1, (H - 400) / TREE_H)
  const effY = (y: number) => y * vScale

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
    const GAP = 24
    const x1 =
      (MID_IDS.includes(sid) ? midExit : s.x - R + (widths[sid] ?? 220)) + GAP // 노드~선 간격
    const y1 = effY(s.y)
    const x2 = effX(tid) - R // 타겟 아이콘 좌측(붙임)
    const y2 = effY(t.y)
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
      <motion.p
        {...rise(0)}
        className="text-accent text-[20px] leading-[1.4] font-bold tracking-[-0.04em] max-md:text-[14px]"
      >
        OUR VISION
      </motion.p>
      <RevealText
        as="p"
        active={active}
        lines={[
          <><span className="tracking-[-0.04em]">AI</span>가 일의 방식을 바꾸는 시대,</>,
          <><span className="tracking-[-0.04em]">OPENFLOOR</span>는 통제 가능한 실전 <span className="tracking-[-0.04em]">AI</span>를 만듭니다.</>,
        ]}
        baseDelay={0.1}
        className="text-title-on-dark mt-4 text-[44px] leading-normal font-bold tracking-[-0.02em] break-keep max-md:mt-3 max-md:text-[20px] max-md:leading-[1.35] max-md:tracking-[-0.015em]"
      />
    </div>
  )

  if (isMobile) {
    const SLOT_W = 32
    const ROW_H = 58
    const cy = ROW_H / 2 // 26
    const ICON_R = 16
    const CR = 12
    const GRAY = 'var(--color-line)'
    const RED = 'var(--color-accent)'

    const openIdx = openId ? MID_IDS.indexOf(openId) : -1

    const mRed = new Set<NodeId>(['root'])
    if (openId) {
      mRed.add(openId)
      CHILDREN[openId].forEach((c) => mRed.add(c))
    }

    const renderRow = (
      row: {
        id: NodeId
        depth: number
        isLast: boolean
        parentLast: boolean
        open: boolean
        index?: number
      },
      onToggle?: () => void
    ) => {
      const node = byId[row.id]
      const d = row.depth
      const isRed = mRed.has(row.id)
      const gutterW = d * SLOT_W
      const ex = (d - 1) * SLOT_W + ICON_R
      const elbowD = `M ${ex} ${cy - CR} Q ${ex} ${cy} ${ex + CR} ${cy} H ${gutterW}`
      const isMid = d === 1
      const i = row.index ?? 0
      const onPathAbove = openIdx >= 0 && i < openIdx
      const isOpenMid = openIdx >= 0 && i === openIdx
      const isPlainGray = d === 1 && !onPathAbove && !isOpenMid
      const entryIdx = d === 0 ? 0 : i + 1
      const entryDelay = active ? 0.1 + entryIdx * 0.1 : 0

      const inner = (
        <>
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${isRed ? 'border-accent bg-accent/20' : 'border-title-on-dark/50 bg-title-on-dark/8'}`}
          >
            <node.icon
              className={`size-5 transition-colors duration-200 ${isRed ? 'text-accent' : 'text-text-on-dark/80'}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-title-on-dark truncate text-[14px] leading-tight font-medium">
              {node.title}
            </p>
            <p className="text-text-on-dark mt-1 truncate text-[14px] leading-tight">
              {node.desc}
            </p>
          </div>
          {isMid && (
            <ChevronDown
              className={`size-4 shrink-0 transition-transform duration-200 ${row.open ? 'text-accent rotate-180' : 'text-muted'}`}
            />
          )}
        </>
      )

      return (
        <div
          key={row.id}
          className="relative flex items-stretch"
          style={{ height: ROW_H }}
        >
          {d === 0 && (
            <motion.span
              className="absolute"
              style={{
                left: ICON_R - 1,
                top: cy + ICON_R,
                width: 2,
                height: ROW_H - (cy + ICON_R),
                background: openIdx >= 0 ? RED : GRAY,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: entryDelay }}
            />
          )}

          {d > 0 && (
            <motion.svg
              width={gutterW}
              height={ROW_H}
              className="shrink-0"
              style={{ overflow: 'visible' }}
              initial={d < 2 ? { opacity: 0 } : false}
              animate={d < 2 ? { opacity: active ? 1 : 0 } : undefined}
              transition={
                d < 2
                  ? { duration: 0.4, ease: 'easeOut', delay: entryDelay }
                  : undefined
              }
            >
              {/* ===== 회색 먼저(아래 레이어) ===== */}
              {d === 1 && onPathAbove && (
                <path
                  d={elbowD}
                  fill="none"
                  stroke={GRAY}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )}
              {d === 1 && isOpenMid && !row.isLast && (
                <line
                  x1={ICON_R}
                  y1={cy - CR}
                  x2={ICON_R}
                  y2={ROW_H}
                  stroke={GRAY}
                  strokeWidth={1.5}
                />
              )}
              {isPlainGray && (
                <>
                  <line
                    x1={ICON_R}
                    y1={0}
                    x2={ICON_R}
                    y2={row.isLast ? cy - CR : ROW_H}
                    stroke={GRAY}
                    strokeWidth={1.5}
                  />
                  <path
                    d={elbowD}
                    fill="none"
                    stroke={GRAY}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </>
              )}
              {d === 2 && !row.parentLast && (
                <line
                  x1={ICON_R}
                  y1={0}
                  x2={ICON_R}
                  y2={ROW_H}
                  stroke={GRAY}
                  strokeWidth={1.5}
                />
              )}

              {/* ===== 빨강 나중(위 레이어) ===== */}
              {d === 1 && onPathAbove && (
                <line
                  x1={ICON_R}
                  y1={0}
                  x2={ICON_R}
                  y2={ROW_H}
                  stroke={RED}
                  strokeWidth={2}
                />
              )}
              {d === 1 && isOpenMid && (
                <>
                  <line
                    x1={ICON_R}
                    y1={0}
                    x2={ICON_R}
                    y2={cy - CR}
                    stroke={RED}
                    strokeWidth={2}
                  />
                  <path
                    d={elbowD}
                    fill="none"
                    stroke={RED}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </>
              )}
              {d === 1 && row.open && (
                <line
                  x1={SLOT_W + ICON_R}
                  y1={cy + ICON_R}
                  x2={SLOT_W + ICON_R}
                  y2={ROW_H}
                  stroke={RED}
                  strokeWidth={2}
                />
              )}
              {d === 2 && (
                <>
                  <line
                    x1={ex}
                    y1={0}
                    x2={ex}
                    y2={row.isLast ? cy - CR : ROW_H}
                    stroke={RED}
                    strokeWidth={2}
                  />
                  <path
                    d={elbowD}
                    fill="none"
                    stroke={RED}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </>
              )}
            </motion.svg>
          )}

          {isMid ? (
            <motion.button
              type="button"
              onClick={onToggle}
              className="flex flex-1 items-center gap-3 text-left"
              style={{ transformOrigin: 'left center' }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={
                active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }
              }
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 22,
                delay: entryDelay,
              }}
            >
              {inner}
            </motion.button>
          ) : (
            <motion.div
              className="flex flex-1 items-center gap-3"
              style={{ transformOrigin: 'left center' }}
              initial={d < 2 ? { opacity: 0, scale: 0.85 } : false}
              animate={
                d < 2
                  ? active
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.85 }
                  : undefined
              }
              transition={
                d < 2
                  ? {
                      type: 'spring',
                      stiffness: 500,
                      damping: 22,
                      delay: entryDelay,
                    }
                  : undefined
              }
            >
              {inner}
            </motion.div>
          )}
        </div>
      )
    }

    return (
      <section
        id={def.id}
        className="relative flex h-dvh w-full flex-col overflow-hidden"
      >
        <Container className="flex h-full flex-col pt-22 pb-6">
          {TitleBlock}

          <div className="mt-6 flex flex-col">
            {renderRow({
              id: 'root',
              depth: 0,
              isLast: true,
              parentLast: true,
              open: false,
            })}
            {MID_IDS.map((mid, i) => {
              const midLast = i === MID_IDS.length - 1
              const open = openId === mid
              return (
                <div key={mid}>
                  {renderRow(
                    {
                      id: mid,
                      depth: 1,
                      isLast: midLast,
                      parentLast: true,
                      open,
                      index: i,
                    },
                    () => setOpenId(open ? null : mid)
                  )}
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        {CHILDREN[mid].map((kid, j) =>
                          renderRow({
                            id: kid,
                            depth: 2,
                            isLast: j === CHILDREN[mid].length - 1,
                            parentLast: midLast,
                            open: false,
                          })
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section
      id={def.id}
      ref={sectionRef}
      onPointerMove={handleTilt}
      onPointerLeave={resetTilt}
      className="relative flex h-dvh w-full items-center justify-center overflow-hidden"
    >
      <div
        className="relative shrink-0"
        style={{ width: DESIGN_WIDTH, height: H, transform: `scale(${ratio})` }}
      >
        <div className="flex h-full flex-col justify-between px-16 py-25">
          {TitleBlock}

          {/* 파이프라인 트리 */}
          <div style={{ height: TREE_H * vScale }}>
            <motion.div
              className="relative"
              style={{
                width: TREE_W,
                height: TREE_H * vScale,
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: TILT_PERSPECTIVE,
              }}
            >
              {/* 곡선 커넥터 (노드 뒤) */}
              <svg
                className="absolute inset-0 overflow-visible"
                width={TREE_W}
                height={TREE_H * vScale}
                viewBox={`0 0 ${TREE_W} ${TREE_H * vScale}`}
                fill="none"
              >
                {/* 회색 베이스 — 전부 먼저(아래 레이어) */}
                {EDGES.map(([sid, tid], i) => (
                  <motion.path
                    key={`base-${sid}-${tid}`}
                    d={edgePath(sid, tid)}
                    fill="none"
                    stroke="var(--color-line)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: active ? 1 : 0 }}
                    transition={{
                      duration: 0.7,
                      ease: 'easeInOut',
                      delay: (sid === 'root' ? 0.25 : 0.75) + i * 0.04,
                    }}
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
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: hot ? 1 : 0,
                        opacity: hot ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.55,
                        ease: [0.22, 1, 0.36, 1],
                        opacity: { duration: 0.2 },
                      }}
                    />
                  )
                })}
              </svg>

              {/* 노드 */}
              {NODES.map((n, i) => {
                const hot = redSet.has(n.id)
                const delay =
                  (n.x < 100 ? 0 : n.x < 700 ? 0.45 : 0.95) + i * 0.03
                return (
                  <motion.div
                    key={n.id}
                    ref={(el) => {
                      nodeRefs.current[n.id] = el
                    }}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="absolute flex cursor-default items-center"
                    style={{ left: effX(n.id) - R, top: effY(n.y) - R }}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={
                      active
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.92 }
                    }
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                      delay,
                    }}
                  >
                    <div
                      className={`flex size-14 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                        hot
                          ? 'border-accent bg-accent/20'
                          : 'border-title-on-dark/50 bg-title-on-dark/8'
                      }`}
                    >
                      <n.icon
                        className={`size-7 transition-colors duration-200 ${hot ? 'text-accent' : 'text-text-on-dark/80'}`}
                      />
                    </div>
                    <div className="ml-6">
                      <p className="text-title-on-dark text-[20px] leading-normal font-medium tracking-[-0.015em] whitespace-nowrap">
                        {n.title}
                      </p>
                      <p className="text-text-on-dark mt-1 text-[16px] leading-normal font-normal whitespace-nowrap">
                        {n.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
