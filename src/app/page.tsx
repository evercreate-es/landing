import type { Metadata } from 'next'
import { LandingHero } from '@/components/landing/LandingHero'
import { LANDING_SUBTITLE, LANDING_SUBLINE } from '@/lib/landing/industries'

export const metadata: Metadata = {
  title: 'Evercreate — Your custom platform, built for how your company actually works',
  description: 'All the risk is on us. Your platform gets built with no cost, and you only pay a flat monthly fee if you use it. Cancel anytime.',
}

export default function HomePage() {
  return (
    <LandingHero
      headline="Your custom platform, built for how your company actually works."
      subtitle={LANDING_SUBTITLE}
      subline={LANDING_SUBLINE}
      industry={undefined}
      badge="Exclusive Early Access"
    />
  )
}
