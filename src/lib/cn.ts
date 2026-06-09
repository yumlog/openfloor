import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 조건부 클래스명을 병합하고 Tailwind 충돌을 해소한다
 * (뒤의 유틸리티가 이김, 예: `cn('p-2', 'p-4')` -> `p-4`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
