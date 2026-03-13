import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('interested_leads')
    .select('email, slug, campaign_name, auto_replied_at, booked_at, followed_up')
    .order('auto_replied_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const leads = (data ?? []).map((l) => ({
    email: l.email,
    slug: l.slug,
    campaign_name: l.campaign_name,
    auto_replied_at: l.auto_replied_at,
    booked_at: l.booked_at,
    followed_up: l.followed_up,
  }))

  return NextResponse.json({ leads, total: leads.length })
}
