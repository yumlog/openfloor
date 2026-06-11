import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'motion/react'
import type { Project } from './projects'

/* ---------------------------------------------------------------------------
   Portfolio 캐러셀 — 동일한 카드들의 아크 "휠".

   하나의 연속 motion value `rotation`이 전부를 구동한다. 카드 i의 중심 기준
   오프셋은 N개 카드 링 위에서의 최단 wrap 거리 p = wrap(i - rotation)이라, 휠이
   양방향으로 무한 루프한다. 그 다음 각 카드를 반지름 R의 원에 슬롯당 ANG°씩
   stepping 하며 배치한다:

       x      = R · sin(p·ANG)        (좌/우로 부채꼴)
       y      = R · (1 − cos(p·ANG))  (옆 카드는 똑바로 선 가운데 카드보다 내려감)
       rotate = p·ANG                 (기울기만 — 모든 카드는 크기 유지)
       zIndex = 100 − |p|·10          (가운데가 맨 위)

   R≈1280 / ANG≈14°에선 가운데 카드가 똑바로 서고 ±1이 옆에, ±2가 프레임
   가장자리에 클립되어 살짝 보인다(5장 가시); |p|가 ~2.4를 넘으면 페이드 아웃.

   모든 값은 1440-디자인 px로, 부모가 transform:scale(ratio)하는 고정 캔버스에
   작성된다 — Philosophy 덱과 같은 방식.
--------------------------------------------------------------------------- */

const CANVAS_W = 1440
const CANVAS_H = 600
const CARD_W = 320
const CARD_H = 420

// R이 카드 간 간격을 정한다(인접 중심 사이 ≈ R·sin(ANG)); 원래 1280에선
// ~310px < 320 카드 너비라 이웃이 겹쳤다. 1680 → ~406px 간격, 카드 사이가
// 넉넉히 벌어진다(5.png 참조).
const R = 1680
const ANG = 14 // 슬롯당 각도
const ANG_RAD = (ANG * Math.PI) / 180

const PX_PER_STEP = 320 // 드래그한 화면 px ≈ 카드 한 칸
const CLICK_SLOP = 8 // 이(px) 미만 이동은 드래그가 아니라 클릭으로 침
const AUTO_MS = 2000 // 자동 넘김 간격

const SPRING = { type: 'spring', stiffness: 140, damping: 22 } as const
const AUTO_TWEEN = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const

/** 크기 `n`의 링 위에서 `d`의 최단 부호 거리 → (-n/2, n/2]. */
function wrap(d: number, n: number) {
  const m = ((d % n) + n) % n
  return m > n / 2 ? m - n : m
}

interface PortfolioCardProps {
  project: Project
  index: number
  count: number
  rotation: MotionValue<number>
  onPointerDownCard: (e: ReactPointerEvent, index: number) => void
}

/** 카드 한 장, 공유 `rotation` 값만으로 아크 위에 위치. */
function PortfolioCard({
  project,
  index,
  count,
  rotation,
  onPointerDownCard,
}: PortfolioCardProps) {
  const p = useTransform(rotation, (r) => wrap(index - r, count))
  const x = useTransform(p, (v) => R * Math.sin(v * ANG_RAD))
  const y = useTransform(p, (v) => R * (1 - Math.cos(v * ANG_RAD)))
  const rotate = useTransform(p, (v) => v * ANG)
  const zIndex = useTransform(p, (v) => Math.round(100 - Math.abs(v) * 10))
  // 가시 아크를 벗어나 도는 카드를 페이드; 안 보이는 카드가 클릭을 가로채지
  // 못하도록 pointer 이벤트도 끈다. 보이는 카드는 INHERIT(부모의 active 게이팅이
  // 휠 상호작용 여부를 결정).
  const opacity = useTransform(p, [-2.6, -2.2, 2.2, 2.6], [0, 1, 1, 0])
  const pointerEvents = useTransform(opacity, (o) =>
    o < 0.05 ? 'none' : 'inherit'
  )

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 cursor-pointer select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        marginLeft: -CARD_W / 2,
        marginTop: -CARD_H / 2,
        x,
        y,
        rotate,
        zIndex,
        opacity,
        pointerEvents,
      }}
      onPointerDown={(e) => onPointerDownCard(e, index)}
    >
      {/* 카드 = 프로젝트 이미지 + 호버 dim/텍스트 */}
      <div className="group relative h-full w-full overflow-hidden rounded-[16px] shadow-[0_0_25px_-4px_rgba(0,0,0,0.1)]">
        <img
          src={project.image}
          alt={project.name}
          draggable={false}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-[4px] bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-[14px] leading-[1.4] font-normal text-white">
            {project.name}
          </p>
          <p className="text-[20px] leading-[1.4] font-bold whitespace-pre-line text-center text-white">
            {project.project}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

interface PortfolioCarouselProps {
  projects: Project[]
  /** Portfolio가 활성 슬라이드인 동안 true — 자동 회전 + 상호작용을 게이트. */
  active: boolean
  /** 상세 모달이 열린 동안 true — 열린 카드에서 휠을 고정. */
  modalOpen: boolean
  /** frame.w / 1440 (<=1) — 전체 디자인 캔버스를 유동 스케일. */
  ratio: number
  /** `index`(클릭/가운데 카드)의 상세 모달을 연다. */
  onOpen: (index: number) => void
}

export function PortfolioCarousel({
  projects,
  active,
  modalOpen,
  ratio,
  onOpen,
}: PortfolioCarouselProps) {
  const count = projects.length
  const rotation = useMotionValue(0)
  const [centerIndex, setCenterIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const controls = useRef<ReturnType<typeof animate> | null>(null)
  const drag = useRef<{
    startX: number
    startRot: number
    index: number
    moved: number
  } | null>(null)

  // 상호작용 중 / 모달 열림 / 화면 밖일 땐 자동 회전 일시정지.
  const paused = hovered || dragging || modalOpen || !active

  // 반올림된 가운데 카드를 추적(휠 아래 브랜드 이름용).
  useMotionValueEvent(rotation, 'change', (v) => {
    const idx = ((Math.round(v) % count) + count) % count
    setCenterIndex((prev) => (prev === idx ? prev : idx))
  })

  // 해당 카드를 가운데로 스냅한 뒤 모달을 연다.
  const focusAndOpen = (index: number) => {
    const base = rotation.get()
    controls.current?.stop()
    controls.current = animate(
      rotation,
      base + wrap(index - base, count),
      SPRING
    )
    onOpen(index)
  }

  // 안정적인 window 리스너(pointer-down에 추가, up에 제거). ref가 최신 클로저를
  // 들고 있어 리스너 정체성이 제거를 위해 일정하게 유지된다.
  const moveRef = useRef<(e: PointerEvent) => void>(() => {})
  const upRef = useRef<(e: PointerEvent) => void>(() => {})
  const moveListener = useRef((e: PointerEvent) => moveRef.current(e)).current
  const upListener = useRef((e: PointerEvent) => upRef.current(e)).current

  moveRef.current = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    d.moved = Math.max(d.moved, Math.abs(dx))
    if (d.moved > CLICK_SLOP && !dragging) setDragging(true)
    rotation.set(d.startRot - dx / PX_PER_STEP)
  }

  upRef.current = () => {
    window.removeEventListener('pointermove', moveListener)
    window.removeEventListener('pointerup', upListener)
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (!d) return
    if (d.moved <= CLICK_SLOP) {
      // 클릭(실제 드래그 없음) → 그 카드를 가운데로 두고 연다.
      focusAndOpen(d.index)
    } else {
      // 드래그 → 가장 가까운 카드에 안착.
      controls.current?.stop()
      controls.current = animate(rotation, Math.round(rotation.get()), SPRING)
    }
  }

  const onPointerDownCard = (e: ReactPointerEvent, index: number) => {
    controls.current?.stop()
    drag.current = {
      startX: e.clientX,
      startRot: rotation.get(),
      index,
      moved: 0,
    }
    window.addEventListener('pointermove', moveListener)
    window.addEventListener('pointerup', upListener)
  }

  // 동작 중엔 AUTO_MS마다 카드 한 장씩 자동 넘김.
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      controls.current?.stop()
      controls.current = animate(
        rotation,
        Math.round(rotation.get()) + 1,
        AUTO_TWEEN
      )
    }, AUTO_MS)
    return () => clearInterval(id)
  }, [paused, rotation])

  // 언마운트 시 남은 window 리스너 정리.
  useEffect(
    () => () => {
      window.removeEventListener('pointermove', moveListener)
      window.removeEventListener('pointerup', upListener)
    },
    [moveListener, upListener]
  )

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      {/* 휠 밴드 — 상호작용 표면(호버-일시정지 + 카드 pointer 이벤트가 여기서
          흐른다). 타이틀 스페이서 아래에 있어, active일 때 pointer 이벤트를 켜도
          위의 헤더/내비를 덮지 않는다; 레이어 전체의 opacity 페이드는 섹션의 포털
          루트에 있다. */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        style={{ pointerEvents: active ? 'auto' : 'none' }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* 스테이지: 카드는 뷰포트 중심 둘레의 고정-px 아크에 놓이고 좁은
            화면(ratio<=1)에서만 축소된다. 포털 레이어는 overflow hidden인
            풀뷰포트라, 바깥 카드가 1440 프레임이 아니라 실제 화면 끝에서 클립된다. */}
        <div
          className="relative shrink-0"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${ratio})`,
            pointerEvents: 'inherit',
          }}
        >
          {projects.map((proj, i) => (
            <PortfolioCard
              key={proj.id}
              project={proj}
              index={i}
              count={count}
              rotation={rotation}
              onPointerDownCard={onPointerDownCard}
            />
          ))}
        </div>
      </div>

      {/* 가운데 브랜드 이름 — 휠과 분리. 가운데 카드가 바뀌면 교차된다(옛 것은
          위로 / 새 것은 아래에서). 아래쪽이 슬라이드 끝에서 섹션 하단 마진
          (100px) 위에 놓인다. */}
      <div className="pointer-events-none relative flex min-h-[clamp(28px,2.78vw,40px)] shrink-0 items-start justify-center pb-[clamp(58px,6.94vw,100px)]">
        <AnimatePresence>
          <motion.img
            key={centerIndex}
            src={projects[centerIndex].logo}
            alt={projects[centerIndex].name}
            draggable={false}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="absolute left-1/2 h-[36px] w-auto -translate-x-1/2"
          />
        </AnimatePresence>
      </div>
    </div>
  )
}
