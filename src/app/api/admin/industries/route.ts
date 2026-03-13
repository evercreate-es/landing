import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { industries } from '@/lib/landing/industries'

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const [codesRes, waitlistRes, redemptionsRes] = await Promise.all([
    supabase.from('promo_codes').select('*').order('industry'),
    supabase.from('waitlist').select('*').order('created_at', { ascending: false }),
    supabase
      .from('code_redemptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  // Build industry map with static data + DB stats
  const codesByIndustry = new Map(
    (codesRes.data ?? []).map((c) => [c.industry, c])
  )

  const waitlistByIndustry = new Map<string, number>()
  for (const w of waitlistRes.data ?? []) {
    const ind = w.industry ?? 'unknown'
    waitlistByIndustry.set(ind, (waitlistByIndustry.get(ind) ?? 0) + 1)
  }

  const rows = industries.map((ind) => {
    const code = codesByIndustry.get(ind.slug)
    return {
      slug: ind.slug,
      name: ind.name,
      url: `/${ind.slug}`,
      code: ind.code,
      currentUses: code?.current_uses ?? 0,
      maxUses: code?.max_uses ?? 50,
      active: code?.active ?? false,
      codeInDb: !!code,
      waitlistCount: waitlistByIndustry.get(ind.slug) ?? 0,
    }
  })

  return NextResponse.json({
    industries: rows,
    totals: {
      totalRedemptions: rows.reduce((s, r) => s + r.currentUses, 0),
      totalWaitlist: waitlistRes.data?.length ?? 0,
      totalIndustries: rows.length,
      industriesWithCode: rows.filter((r) => r.codeInDb).length,
    },
    recentRedemptions: (redemptionsRes.data ?? []).slice(0, 20),
    recentWaitlist: (waitlistRes.data ?? []).slice(0, 20).map((w) => ({
      email: w.email,
      industry: w.industry,
      created_at: w.created_at,
    })),
  })
}
