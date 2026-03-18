import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!

// ── Telegram ─────────────────────────────────────────────

async function sendTelegram(text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })
}

// ── Lead tracking ────────────────────────────────────────

function extractSlugFromCampaign(campaignName: string): string {
  // "Evercreate — Construction" -> "construction"
  // "Evercreate — Financial Services" -> "financial-services"
  const match = campaignName.match(/Evercreate — (.+)/)
  if (!match) return ''
  return match[1].toLowerCase().replace(/\s&\s/g, '-').replace(/\s+/g, '-')
}

// Map campaign display names to actual slugs (for cases where they differ)
const SLUG_MAP: Record<string, string> = {
  'it': 'it',
  'health-&-wellness': 'health',
  'oil-&-energy': 'oil-energy',
  'food-&-beverages': 'food-beverages',
  'apparel-&-fashion': 'apparel-fashion',
}

function getIndustrySlug(campaignName: string): string {
  const raw = extractSlugFromCampaign(campaignName)
  return SLUG_MAP[raw] || raw
}

async function saveInterestedLead(data: Record<string, unknown>) {
  try {
    const leadEmail = (data.lead_email || data.email || '') as string
    const campaignName = (data.campaign_name || '') as string
    const slug = getIndustrySlug(campaignName)

    if (!leadEmail || !slug) return

    const supabase = createServiceClient()
    await supabase.from('interested_leads').upsert(
      {
        email: leadEmail.toLowerCase().trim(),
        slug,
        campaign_name: campaignName,
      },
      { onConflict: 'email' }
    )
  } catch (err) {
    console.error('Save interested lead failed:', err)
  }
}

// ── Format messages ──────────────────────────────────────

function formatReply(data: Record<string, unknown>) {
  const lead = data.lead_email || data.email || 'Unknown'
  const company = data.lead_company_name || data.company_name || ''
  const campaign = data.campaign_name || ''
  const subject = data.subject || data.email_subject || ''
  const body = data.body || data.text_body || data.reply_text || ''
  const preview = typeof body === 'string' ? body.slice(0, 300) : ''

  return [
    `<b>New Reply</b>`,
    `From: <b>${lead}</b>${company ? ` (${company})` : ''}`,
    campaign ? `Campaign: ${campaign}` : '',
    subject ? `Subject: ${subject}` : '',
    '',
    preview || '(no preview)',
  ].filter(Boolean).join('\n')
}

function formatInterested(data: Record<string, unknown>) {
  const lead = data.lead_email || data.email || 'Unknown'
  const company = data.lead_company_name || data.company_name || ''
  const campaign = data.campaign_name || ''
  return [
    `🟢 <b>Lead Interested</b>`,
    `From: <b>${lead}</b>${company ? ` (${company})` : ''}`,
    campaign ? `Campaign: ${campaign}` : '',
  ].filter(Boolean).join('\n')
}

// ── Main handler ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const eventType = payload.event_type || ''
    const data = payload.data || payload

    switch (eventType) {
      case 'reply_received':
        await sendTelegram(formatReply(data))
        break
      case 'lead_interested':
        await saveInterestedLead(data)
        await sendTelegram(formatInterested(data))
        break
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
