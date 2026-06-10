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
  /** 호버 1번째 줄(브랜드명) */
  name: string
  /** 호버 2번째 줄(프로젝트명, placeholder) */
  project: string
  /** 브랜드 컬러 — 모달 슬라이드 배경에 계속 사용 */
  color: string
  /** 카드 이미지(public) */
  image: string
  /** 카드 아래 로고(public) */
  logo: string
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
  project: string
  color: string
  image: string
  logo: string
}

// 고정 순서 + 컬러(스펙 참조). 슬라이드는 생성된 플레이스홀더.
const BRANDS: Brand[] = [
  { id: 'oliveyoung', name: '올리브영', project: '프로젝트명 placeholder', color: '#D2F096', image: '/oliveyoung.png', logo: '/logo-oliveyoung.svg' },
  { id: 'kb', name: '국민은행', project: '프로젝트명 placeholder', color: '#FFD745', image: '/kb.png', logo: '/logo-kb.svg' },
  { id: 'samsung', name: '삼성', project: '프로젝트명 placeholder', color: '#1428A0', image: '/samsung.png', logo: '/logo-samsung.svg' },
  { id: 'lg', name: '엘지', project: '프로젝트명 placeholder', color: '#C30036', image: '/lg.png', logo: '/logo-lg.svg' },
  { id: 'shinhyup', name: '신협', project: '프로젝트명 placeholder', color: '#08529B', image: '/shinhyeob.svg.png', logo: '/logo-shinhyeob.svg' },
  { id: 'dancesnap', name: '댄스냅', project: '프로젝트명 placeholder', color: '#999999', image: '/dansnap.png', logo: '/logo-dansnap.svg' },
  { id: 'kit', name: '경남대', project: '프로젝트명 placeholder', color: '#E11737', image: '/kit.png', logo: '/logo-kit.svg' },
  { id: 'bizplay', name: '비즈플레이', project: '토탈 솔루션 개발 및 운영', color: '#0037FF', image: '/bizplay.png', logo: '/logo-bizplay.png' },
]

export const PROJECTS: Project[] = BRANDS.map((b) => ({
  ...b,
  slides: placeholderSlides(b.name),
}))
