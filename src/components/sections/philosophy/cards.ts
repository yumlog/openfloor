/* ---------------------------------------------------------------------------
   Philosophy 카드 데이터. 위 -> 아래 순서로 쌓인다(마지막=빨강이 맨 위·확대 대상).
--------------------------------------------------------------------------- */

export interface PhilosophyCard {
  /** 안정적인 id */
  id: string
  /** 번호 라벨('01') */
  num: string
  /** 타이틀 */
  name: string
  /** 본문(\n = 줄바꿈) */
  body: string
  /** 카드 배경색 */
  bg: string
}

export const PHILOSOPHY_CARDS: PhilosophyCard[] = [
  {
    id: 'pride',
    num: '01',
    name: '자존심',
    body: '우리는 결과물에 자존심을 겁니다.\n자존심은 결과물의 완결성으로 증명됩니다.',
    bg: 'var(--color-card-deep)',
  },
  {
    id: 'collab',
    num: '02',
    name: '협동심',
    body: '우리는 역할은 나누고 정보는 열어둡니다.\n좋은 결과물은 개인의 전문성만이 아니라 연결된 맥락으로 완성됩니다.',
    bg: 'var(--color-muted)',
  },
  {
    id: 'system',
    num: '03',
    name: '연대심',
    body: '우리는 한 사람에게 전체 흐름을 의존하지 않습니다.\n일의 연속성은 공유된 지식, 역할, 책임의 구조로 유지됩니다..',
    bg: 'var(--color-accent)',
  },
]
