import { PlaceholderSection } from '@/components/ui/PlaceholderSection'
import { SLIDES } from '@/config/slides'

const def = SLIDES[6]

// Contact + Footer 플레이스홀더 — 실제 콘텐츠는 나중에 추가.
export function ContactSection() {
  return <PlaceholderSection id={def.id} label={def.label} theme={def.theme} />
}
