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
  { id: 'oliveyoung', name: '올리브영', project: '프로젝트명 placeholder', color: '#D2F096', image: '/images/oliveyoung.png', logo: '/images/logo-oliveyoung.svg' },
  { id: 'kb', name: 'KB 금융지주', project: 'IR 활동 기반\n인사이트 분석 시스템', color: '#FFD745', image: '/images/kb.png', logo: '/images/logo-kb.svg' },
  { id: 'samsung', name: '삼성전자', project: 'SEO 고도화', color: '#1428A0', image: '/images/samsung.png', logo: '/images/logo-samsung.svg' },
  { id: 'lg', name: 'LG전자', project: '커머스 글로벌', color: '#C30036', image: '/images/lg.png', logo: '/images/logo-lg.svg' },
  { id: 'shinhyup', name: '신협중앙회', project: '기업 전자 금융 채널', color: '#08529B', image: '/images/shinhyeob.svg.png', logo: '/images/logo-shinhyeob.svg' },
  { id: 'dancesnap', name: '텐씨엘', project: '운영 플랫폼 개발', color: '#999999', image: '/images/dansnap.png', logo: '/images/logo-dansnap.svg' },
  { id: 'kit', name: 'KIT 경남정보대학교', project: '유학생 통합 관리 시스템', color: '#E11737', image: '/images/kit.png', logo: '/images/logo-kit.svg' },
  { id: 'bizplay', name: '비즈플레이', project: '토탈 솔루션 개발 및 운영', color: '#0037FF', image: '/images/bizplay.png', logo: '/images/logo-bizplay.png' },
]

export const PROJECTS: Project[] = BRANDS.map((b) => ({
  ...b,
  slides: placeholderSlides(b.name),
}))
