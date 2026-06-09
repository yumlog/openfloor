import { useEffect, useState } from 'react'
import { animate } from 'motion/react'

/**
 * `active`가 true일 때 0에서 `target`까지 세고(ease-out), 아니면 0으로 리셋한다
 * — 그래서 소속 섹션에 (재)진입할 때마다 카운트업이 다시 재생된다. `delay`는
 * 세기 전 0에서 대기(컬럼 캐스케이드에 맞추는 용도). 현재 반올림 값을 반환하며,
 * 접미사("+", "%")는 호출 측이 직접 붙인다.
 */
export function useCountUp(
  target: number,
  active: boolean,
  delay = 0,
  duration = 1.3
) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    const controls = animate(0, target, {
      duration,
      delay,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [active, target, delay, duration])

  return value
}
