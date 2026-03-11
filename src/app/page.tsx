import type { Metadata } from 'next'
import { LandingHero } from '@/components/landing/LandingHero'
import { LANDING_SUBLINE } from '@/lib/landing/industries'

export const metadata: Metadata = {
  title: 'Evercreate — We build your custom platform',
  description: 'No upfront cost. You only pay a flat monthly fee if you use it. Cancel anytime.',
}

export default function HomePage() {
  return (
    <LandingHero
      headline="We build your company's custom platform."
      subtitle={LANDING_SUBLINE}
      subline=""
      industry={undefined}
    />
  )
}
