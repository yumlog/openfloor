import { useEffect, useState } from 'react'
import { DESIGN_WIDTH } from '@/config/slides'

export interface FrameSize {
  w: number
  h: number
  /** 프레임 스케일 비율(w / DESIGN_WIDTH). w가 DESIGN_WIDTH로 캡되므로 항상 ≤ 1. */
  ratio: number
}

const measure = (): FrameSize => {
  const w =
    typeof window !== 'undefined'
      ? Math.min(window.innerWidth, DESIGN_WIDTH)
      : DESIGN_WIDTH
  const h = typeof window !== 'undefined' ? window.innerHeight : 900
  return { w, h, ratio: w / DESIGN_WIDTH }
}

/**
 * 디자인 프레임 크기를 추적한다. 너비는 DESIGN_WIDTH로 제한되어, 더 넓은
 * 뷰포트에서도 레이아웃(과 스크롤 구동 비디오 위치)이 화면이 1440px인 것처럼
 * 동작하고 나머지는 좌우 여백으로 보인다. `ratio`는 프레임 스케일(w/DESIGN_WIDTH).
 */
export function useFrameSize(): FrameSize {
  const [size, setSize] = useState<FrameSize>(measure)

  useEffect(() => {
    const update = () => setSize(measure())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}
