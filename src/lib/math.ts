/* 공용 수치 헬퍼. 여러 곳에서 쓰는 clamp를 한 곳으로 모은다. */

/** v를 [min, max]로 제한. */
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

/** v를 [0, 1]로 제한. */
export const clamp01 = (v: number) => clamp(v, 0, 1)
