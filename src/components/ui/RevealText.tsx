import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from 'react'

interface RevealTextProps {
  /** Each entry is one rendered line (pre-split; lines must not wrap). */
  lines: string[]
  /**
   * Whether the owning section is active. The reveal (re)plays each time this
   * flips false -> true and holds its revealed state while active stays true;
   * leaving and re-entering replays it.
   */
  active: boolean
  /** Element to render as (h1 / h2 / p …). */
  as?: ElementType
  /** Classes for the wrapping element (font size / color live here). */
  className?: string
  /** Per-line top -> bottom stagger, seconds. */
  stagger?: number
  /** Delay before the first line, seconds. */
  baseDelay?: number
}

/**
 * Soft-edged left -> right line reveal, shared by Hero and About. The visual
 * effect lives entirely in `.hero-reveal-*` (keyframes.css); this component owns
 * the markup and, crucially, the *replay* trigger: a run id is bumped on every
 * activation and used as the line `key`, so React remounts the spans and the CSS
 * animation restarts from the start each time the section is entered.
 *
 * Lines must be pre-split to fit on a single line — the mask sweep is sized per
 * line box, so a wrapped line would reveal unevenly.
 */
export function RevealText({
  lines,
  active,
  as: Tag = 'div',
  className,
  stagger = 0.27,
  baseDelay = 0,
}: RevealTextProps) {
  // Start "played" when already active on mount (Hero), otherwise wait for the
  // first activation (About). The initial off-screen play for an inactive
  // section is never seen; only activation-triggered plays are visible.
  const wasActive = useRef(active)
  const [runId, setRunId] = useState(active ? 1 : 0)

  useEffect(() => {
    if (active && !wasActive.current) setRunId((n) => n + 1)
    wasActive.current = active
  }, [active])

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span
          key={`${runId}-${i}`}
          className="hero-reveal-line"
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
