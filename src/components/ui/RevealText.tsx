import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

interface RevealTextProps {
  /** 각 항목이 렌더되는 한 줄(미리 분할; 줄은 wrap되면 안 됨). 부분 스타일이 필요하면 JSX 가능. */
  lines: ReactNode[]
  /**
   * 소속 섹션의 활성 여부. reveal은 이 값이 false -> true로 바뀔 때마다 (재)재생되고
   * active가 true인 동안 드러난 상태를 유지한다; 나갔다 다시 들어오면 다시 재생.
   */
  active: boolean
  /** 렌더할 엘리먼트(h1 / h2 / p …). */
  as?: ElementType
  /** 감싸는 엘리먼트의 클래스(폰트 크기 / 색이 여기 있음). */
  className?: string
  /** 줄별 위 -> 아래 stagger, 초. */
  stagger?: number
  /** 첫 줄 전 지연, 초. */
  baseDelay?: number
}

/**
 * Hero와 About이 공유하는 부드러운 가장자리의 좌 -> 우 줄 reveal. 시각 효과는
 * 전부 `.hero-reveal-*`(keyframes.css)에 있다; 이 컴포넌트는 마크업과, 무엇보다
 * *재생* 트리거를 소유한다: 활성화될 때마다 run id를 올려 줄의 `key`로 쓰므로,
 * 섹션에 들어올 때마다 React가 span을 remount 하고 CSS 애니메이션이 처음부터
 * 다시 시작된다.
 *
 * 줄은 한 줄에 들어가도록 미리 분할해야 한다 — 마스크 sweep이 줄 박스 단위로
 * 크기가 정해지므로, wrap된 줄은 고르지 않게 드러난다.
 */
export function RevealText({
  lines,
  active,
  as: TagName = 'div',
  className,
  stagger = 0.27,
  baseDelay = 0,
}: RevealTextProps) {
  // false -> true 활성화마다 run id를 올린다; 줄 key로 써서 React가 span을
  // remount 하고 CSS sweep이 깔끔히 다시 시작되게 한다. 비활성일 땐 줄에서
  // .is-playing이 빠지고 숨김 기본값에 머문다(keyframes 참조).
  const wasActive = useRef(active)
  const [runId, setRunId] = useState(active ? 1 : 0)

  useEffect(() => {
    if (active && !wasActive.current) setRunId((n) => n + 1)
    wasActive.current = active
  }, [active])

  // R3F가 전역 JSX.IntrinsicElements를 확장하면서 동적 `ElementType` 태그의
  // children 추론이 깨진다 — 받는 props를 명시해 다시 ReactNode로 고정.
  const Tag = TagName as ElementType<{
    className?: string
    children?: ReactNode
  }>

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span
          key={`${runId}-${i}`}
          // .is-playing이 sweep을 게이트한다 — 없으면 줄이 숨김 기본값을 유지해,
          // 비활성 섹션이 드러난 텍스트를 깜빡 비추는 일이 없다.
          className={cn('hero-reveal-line', active && 'is-playing')}
          style={
            { '--line-delay': `${baseDelay + i * stagger}s` } as CSSProperties
          }
        >
          <span className="hero-reveal-clean">{line}</span>
          <span className="hero-reveal-edge" aria-hidden="true">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  )
}
