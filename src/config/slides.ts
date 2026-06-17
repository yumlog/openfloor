/* ---------------------------------------------------------------------------
   슬라이드 설정. 전체 경험은 단일 `slide` motion value(0, 1, 2 …)로 구동된다.
   섹션 추가 / 순서 변경은 여기서 한다 — 엔진, 배경 크로스페이드, 내비가 모두
   이 값을 읽는다.
--------------------------------------------------------------------------- */

export type SlideTheme = 'dark' | 'light'

export interface SlideDef {
  /** 안정적인 id, 섹션 엘리먼트 id로도 사용 */
  id: string
  /** 섹션이 구현되기 전까지 보여줄 플레이스홀더 라벨 */
  label: string
  /** 섹션이 올라가는 배경(bg 크로스페이드 + 텍스트 색을 결정) */
  theme: SlideTheme
  /**
   * 크로스페이드에서 테마 기본값을 덮어쓰는 선택적 명시 배경색(raw hex) —
   * 순백(#fff)이 아닌 오프화이트 위에 놓이는 라이트 섹션용. 섹션이 실제로
   * 칠하는 색과 동기화할 것.
   */
  bg?: string
}

/** 섹션 순서. 인덱스 === slide 값. */
export const SLIDES: SlideDef[] = [
  { id: 'hero', label: 'Hero', theme: 'dark' },
  { id: 'about', label: 'About', theme: 'dark' },
  { id: 'philosophy', label: 'Philosophy', theme: 'dark' },
  { id: 'portfolio', label: 'Portfolio', theme: 'dark' },
  { id: 'vision', label: 'Vision', theme: 'dark' },
  { id: 'manifesto', label: 'Manifesto', theme: 'dark' },
  { id: 'contact', label: 'Contact', theme: 'dark' },
]

export const TOTAL_SLIDES = SLIDES.length

/** 프레임 너비 — --container-frame 토큰과 동기화할 것. */
export const DESIGN_WIDTH = 1440

/** raw 배경색(--color-bg-* 토큰과 일치해야 함). */
export const BG_DARK = '#171717'
export const BG_LIGHT = '#ffffff'

/**
 * 배경 크로스페이드 정지점. 슬라이드당 하나씩 두어 `slide`가 정수 사이를
 * 오갈 때 배경색이 라이트 <-> 다크로 애니메이션된다. SLIDES가 늘어나면
 * 자동으로 확장된다.
 */
export const BG_STOPS: number[] = SLIDES.map((_, i) => i)
export const BG_COLORS: string[] = SLIDES.map(
  (s) => s.bg ?? (s.theme === 'dark' ? BG_DARK : BG_LIGHT)
)

/** 헤더 내비게이션 — 라벨을 스크롤 대상 슬라이드에 매핑. */
export interface NavItem {
  label: string
  index: number
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'About Us', index: 1 },
  { label: 'Philosophy', index: 2 },
  { label: 'Portfolio', index: 3 },
  { label: 'Vision', index: 4 },
]

/* 스냅 엔진 타이밍. */
export const SLIDE_DURATION = 1.05
export const SLIDE_EASE = [0.77, 0, 0.175, 1] as const
