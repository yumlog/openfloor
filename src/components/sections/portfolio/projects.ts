/* ---------------------------------------------------------------------------
   Portfolio 프로젝트 데이터. 순서와 브랜드 컬러는 고정; 각 프로젝트는 세 개의
   플레이스홀더 콘텐츠 슬라이드를 갖는다(모달에 표시). 실제 커버/상세 이미지가
   나중에 평면 컬러 채움을 대체한다 — 그전까지 카드는 브랜드 컬러 + 이름뿐이다.
--------------------------------------------------------------------------- */

export interface ProjectSlide {
  /** 슬라이드 위 작은 라벨 — 프로젝트(브랜드) 이름. */
  label: string
  /** 슬라이드 헤드라인(실제 카피 전까지 플레이스홀더). */
  title: string
  /** 보조 카피(플레이스홀더; 아직 모달에 표시 안 함). */
  body: string
}

export interface Project {
  /** 안정적인 id, 카드 key로도 사용 */
  id: string
  /** 캐러셀 아래 + 모달 슬라이드 라벨로 표시되는 브랜드 이름 */
  name: string
  /** 브랜드 컬러 — 카드 채움과 모달 슬라이드 배경 */
  color: string
  /** 모달 콘텐츠 슬라이드(각 3개 플레이스홀더) */
  slides: ProjectSlide[]
}

const BODY =
  '프로젝트에 대한 설명이 들어갈 자리입니다. 추후 실제 콘텐츠로 교체됩니다.'

/** 한 브랜드의 플레이스홀더 슬라이드 3개. */
function placeholderSlides(name: string): ProjectSlide[] {
  return [1, 2, 3].map((n) => ({
    label: name,
    title: `프로젝트 타이틀 ${n}`,
    body: BODY,
  }))
}

interface Brand {
  id: string
  name: string
  color: string
}

// 고정 순서 + 컬러(스펙 참조). 슬라이드는 생성된 플레이스홀더.
const BRANDS: Brand[] = [
  { id: 'oliveyoung', name: '올리브영', color: '#D2F096' },
  { id: 'kb', name: 'KB금융지주', color: '#FFD745' },
  { id: 'samsung', name: '삼성', color: '#1428A0' },
  { id: 'lg', name: 'LG', color: '#C30036' },
  { id: 'shinhyup', name: '신협', color: '#08529B' },
  { id: 'dancesnap', name: '댄스냅', color: '#999999' },
  { id: 'kit', name: 'KIT', color: '#E11737' },
  { id: 'bizplay', name: '비즈플레이', color: '#0037FF' },
]

export const PROJECTS: Project[] = BRANDS.map((b) => ({
  ...b,
  slides: placeholderSlides(b.name),
}))
