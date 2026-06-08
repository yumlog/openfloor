import { PlaceholderSection } from '@/components/ui/PlaceholderSection'
import { SLIDES } from '@/config/slides'

const def = SLIDES[0]

// Placeholder. The central video floats above this section (see App); real
// hero content is added in a later step.
export function HeroSection() {
  return <PlaceholderSection id={def.id} label={def.label} theme={def.theme} />
}
