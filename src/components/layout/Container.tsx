import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  className?: string
  children: ReactNode
}

/**
 * 표준 좌우 거터를 가진 콘텐츠 래퍼. 섹션 안에서 콘텐츠 정렬을 맞추는 데 사용;
 * 풀블리드 배경은 이 바깥에 두어야 한다.
 */
export function Container({ className, children }: ContainerProps) {
  return (
    <div
      className={cn(
        'max-w-frame mx-auto w-full px-[clamp(32px,4.44vw,64px)] max-md:px-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
