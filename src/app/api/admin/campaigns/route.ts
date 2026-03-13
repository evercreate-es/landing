import { NextRequest, NextResponse } from 'next/server'
import { instantlyGet } from '@/lib/instantly'

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tagId = req.nextUrl.searchParams.get('tag_id')

  // Mode 1: Return campaign groups (tags)
  if (!tagId) {
    try {
      const tags = await instantlyGet('/custom-tags')
      const groups = (tags?.items || tags || [])
        .filter((t: Record<string, unknown>) => t.name && t.id)
        .map((t: Record<string, unknown>) => ({ id: t.id, name: t.name }))
      return NextResponse.json({ groups })
    } catch {
      return NextResponse.json({ groups: [], error: 'Failed to fetch campaign groups' })
    }
  }

  // Mode 2: Return analytics for a specific campaign group
  try {
    // Step 1: List all campaigns with this tag (paginated)
    const campaignIds: string[] = []
    let cursor: string | undefined
    do {
      const params = new URLSearchParams({ tag_ids: tagId, limit: '100' })
      if (cursor) params.set('starting_after', cursor)
      const res = await instantlyGet(`/campaigns?${params}`)
      const items = res?.items || res?.data || []
      for (const c of items) {
        if (c.id) campaignIds.push(c.id)
      }
      cursor = res?.next_starting_after
    } while (cursor)

    if (campaignIds.length === 0) {
      return NextResponse.json({
        groupTotals: { total_leads: 0, sent: 0, contacted: 0, opens: 0, replies: 0, bounced: 0, interested: 0, open_rate: 0, reply_rate: 0, bounce_rate: 0 },
        campaigns: [],
      })
    }

    // Step 2: Fetch analytics in batches of 20
    const BATCH_SIZE = 20
    const allAnalytics: Record<string, unknown>[] = []
    for (let i = 0; i < campaignIds.length; i += BATCH_SIZE) {
      const batch = campaignIds.slice(i, i + BATCH_SIZE)
      const idsParam = batch.map(id => `ids=${id}`).join('&')
      const analytics = await instantlyGet(`/campaigns/analytics?${idsParam}`)
      const items = Array.isArray(analytics) ? analytics : analytics?.items || analytics?.data || []
      allAnalytics.push(...items)
    }

    // Step 3: Map to response shape
    const campaigns = allAnalytics.map((c: Record<string, unknown>) => ({
      name: (c.campaign_name as string) || '',
      campaign_id: (c.campaign_id as string) || '',
      leads: (c.leads_count as number) ?? 0,
      sent: (c.sent as number) ?? 0,
      contacted: (c.contacted as number) ?? 0,
      opens: (c.opens as number) ?? 0,
      unique_opens: (c.unique_opens as number) ?? 0,
      replies: (c.replies as number) ?? 0,
      unique_replies: (c.unique_replies as number) ?? 0,
      bounced: (c.bounced as number) ?? 0,
      interested: (c.interested as number) ?? 0,
    }))

    // Step 4: Aggregate totals
    const groupTotals = {
      total_leads: campaigns.reduce((s, c) => s + c.leads, 0),
      sent: campaigns.reduce((s, c) => s + c.sent, 0),
      contacted: campaigns.reduce((s, c) => s + c.contacted, 0),
      opens: campaigns.reduce((s, c) => s + c.opens, 0),
      replies: campaigns.reduce((s, c) => s + c.replies, 0),
      bounced: campaigns.reduce((s, c) => s + c.bounced, 0),
      interested: campaigns.reduce((s, c) => s + c.interested, 0),
      open_rate: 0,
      reply_rate: 0,
      bounce_rate: 0,
    }
    if (groupTotals.sent > 0) {
      groupTotals.open_rate = Math.round((groupTotals.opens / groupTotals.sent) * 1000) / 10
      groupTotals.reply_rate = Math.round((groupTotals.replies / groupTotals.sent) * 1000) / 10
      groupTotals.bounce_rate = Math.round((groupTotals.bounced / groupTotals.sent) * 1000) / 10
    }

    return NextResponse.json({ groupTotals, campaigns })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics' },
      { status: 500 }
    )
  }
}
