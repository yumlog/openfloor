/* ---------------------------------------------------------------------------
   Philosophy card data. Left -> right order is the canonical order used by the
   deck/expanded state machine (others fill the side slots preserving it).
--------------------------------------------------------------------------- */

export interface PhilosophyCard {
  /** stable id */
  id: string
  /** name shown below the card (expanded) / bottom-right (standing hover) */
  name: string
  /** body shown only when the card is the centered (selected) one */
  body: string
  /** placeholder image tone — distinguishes the cards until real art lands */
  tint: string
}

export const PHILOSOPHY_CARDS: PhilosophyCard[] = [
  {
    id: 'pride',
    name: '결과물에 대한 자존심',
    body: '부끄럽지 않은 결과물을 만들고 싶다는 것이 우리가 일하는 이유입니다. 완결성이 곧 기준입니다.',
    tint: 'bg-stone-400',
  },
  {
    id: 'collab',
    name: '열린 협업 구조',
    body: '부서와 직무의 경계를 넘어 자유롭게 의견을 공유하고 함께 문제를 해결합니다.',
    tint: 'bg-neutral-600',
  },
  {
    id: 'system',
    name: '연결된 시스템',
    body: '업무와 데이터가 유기적으로 연계되어 효율적인 운영과 의사결정을 지원합니다.',
    tint: 'bg-lime-600',
  },
]
