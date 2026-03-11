import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LandingHero } from '@/components/landing/LandingHero'
import {
  getAllIndustrySlugs,
  getIndustryBySlug,
  LANDING_SUBLINE,
} from '@/lib/landing/industries'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllIndustrySlugs().map((slug) => ({ industry: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>
}): Promise<Metadata> {
  const { industry: slug } = await params
  const industry = getIndustryBySlug(slug)
  if (!industry) return {}

  return {
    title: `Evercreate — ${industry.name}`,
    description: `${industry.subtitle} ${LANDING_SUBLINE}`,
  }
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ industry: string }>
}) {
  const { industry: slug } = await params
  const industry = getIndustryBySlug(slug)

  if (!industry) {
    notFound()
  }

  return (
    <LandingHero
      headline={industry.headline}
      subtitle={industry.subtitle}
      subline={LANDING_SUBLINE}
      industry={industry.slug}
      badge={industry.name}
    />
  )
}
