import { PlaceholderSection } from '@/components/ui/PlaceholderSection'
import { SLIDES } from '@/config/slides'

const def = SLIDES[6]

// Placeholder for Contact + Footer — real content added later.
export function ContactSection() {
  return <PlaceholderSection id={def.id} label={def.label} theme={def.theme} />
}
