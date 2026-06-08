import { PlaceholderSection } from '@/components/ui/PlaceholderSection'
import { SLIDES } from '@/config/slides'

const def = SLIDES[3]

// Placeholder — real content added later.
export function VisionSection() {
  return <PlaceholderSection id={def.id} label={def.label} theme={def.theme} />
}
