/* ---------------------------------------------------------------------------
   Portfolio project data. Order and brand colors are fixed; each project has
   three placeholder content slides (shown in the modal). Real cover/detail
   imagery replaces the flat color fills in a later pass — until then a card is
   just its brand color + name.
--------------------------------------------------------------------------- */

export interface ProjectSlide {
  /** Small label over the slide — the project (brand) name. */
  label: string
  /** Slide headline (placeholder until real copy lands). */
  title: string
  /** Supporting copy (placeholder; not yet shown in the modal). */
  body: string
}

export interface Project {
  /** stable id, also the card key */
  id: string
  /** brand name shown below the carousel + as the modal slide label */
  name: string
  /** brand color — the card fill and modal slide background */
  color: string
  /** modal content slides (3 placeholders each) */
  slides: ProjectSlide[]
}

const BODY =
  '프로젝트에 대한 설명이 들어갈 자리입니다. 추후 실제 콘텐츠로 교체됩니다.'

/** Three placeholder slides for a brand. */
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

// Fixed order + colors (see spec). Slides are generated placeholders.
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
