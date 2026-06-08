import { useEffect, useState } from 'react'
import { animate } from 'motion/react'

/**
 * Counts from 0 up to `target` (ease-out) whenever `active` is true, and resets
 * to 0 when it isn't — so the count-up replays each time the owning section is
 * (re)entered. Returns the current rounded value; callers append any suffix
 * ("+", "%") themselves.
 */
export function useCountUp(target: number, active: boolean, duration = 1.3) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [active, target, duration])

  return value
}
