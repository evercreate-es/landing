import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!
const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY!
const INSTANTLY_API = 'https://api.instantly.ai/api/v2'

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

// ── Instantly API helpers ────────────────────────────────

async function instantlyGet(endpoint: string) {
  const resp = await fetch(`${INSTANTLY_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${INSTANTLY_API_KEY}` },
  })
  return resp.json()
}

async function instantlyPost(endpoint: string, body: Record<string, unknown>) {
  const resp = await fetch(`${INSTANTLY_API}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return resp.json()
}

// ── Auto-reply to interested leads ───────────────────────

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

async function autoReplyInterested(data: Record<string, unknown>) {
  try {
    const leadEmail = (data.lead_email || data.email || '') as string
    const campaignName = (data.campaign_name || '') as string
    const slug = getIndustrySlug(campaignName)

    if (!leadEmail || !slug) return false

    // Find the latest email thread with this lead
    const emails = await instantlyGet(
      `/emails?lead=${encodeURIComponent(leadEmail)}&email_type=received&limit=1&sort_order=desc`
    )

    const items = emails?.items || []
    if (items.length === 0) return false

    const latestEmail = items[0]
    const emailId = latestEmail.id
    const senderAccount = latestEmail.to_address_email_list?.[0]
      || latestEmail.eaccount
      || latestEmail.to_address?.[0]?.email

    if (!emailId || !senderAccount) return false

    // Send auto-reply with calendar link
    const replyBody = [
      `Hi!`,
      ``,
      `Thanks so much for getting back to me — really appreciate it.`,
      ``,
      `Here's my calendar so you can pick a time that works for you: <a href="https://evercreate.co/${slug}">evercreate.co/${slug}</a>`,
      ``,
      `You'll need this code to book: <b>${getCampaignCode(slug)}</b>`,
      ``,
      `Looking forward to it!`,
      ``,
      `Iñigo`,
    ].join('<br />')

    await instantlyPost('/emails/reply', {
      reply_to_uuid: emailId,
      eaccount: senderAccount,
      body: {
        html: replyBody,
        text: replyBody.replace(/<br \/>/g, '\n').replace(/<\/?b>/g, ''),
      },
    })

    // Save to Supabase for follow-up tracking
    const supabase = createServiceClient()
    await supabase.from('interested_leads').upsert(
      {
        email: leadEmail.toLowerCase().trim(),
        slug,
        campaign_name: campaignName,
        auto_replied_at: new Date().toISOString(),
        followed_up: false,
      },
      { onConflict: 'email' }
    )

    return true
  } catch (err) {
    console.error('Auto-reply failed:', err)
    return false
  }
}

function getCampaignCode(slug: string): string {
  const codes: Record<string, string> = {
    'construction': 'CONSTRUCTION-VIP',
    'insurance': 'INSURANCE-VIP',
    'staffing': 'STAFFING-VIP',
    'law': 'LAW-VIP',
    'accounting': 'ACCOUNTING-VIP',
    'marketing': 'MARKETING-VIP',
    'architecture': 'ARCHITECTURE-VIP',
    'health': 'HEALTH-VIP',
    'automotive': 'AUTOMOTIVE-VIP',
    'medical': 'MEDICAL-VIP',
    'financial-services': 'FINANCE-VIP',
    'it': 'IT-VIP',
    'consulting': 'CONSULTING-VIP',
    'hospitality': 'HOSPITALITY-VIP',
    'logistics': 'LOGISTICS-VIP',
    'environmental': 'ENVIRONMENTAL-VIP',
    'education': 'EDUCATION-VIP',
    'telecom': 'TELECOM-VIP',
    'oil-energy': 'ENERGY-VIP',
    'retail': 'RETAIL-VIP',
    'food-beverages': 'FOOD-VIP',
    'investment-management': 'INVESTMENT-VIP',
    'real-estate': 'REALESTATE-VIP',
    'transportation': 'TRANSPORT-VIP',
    'venture-capital': 'VC-VIP',
    'civil-engineering': 'CIVILENG-VIP',
    'entertainment': 'ENTERTAINMENT-VIP',
    'biotechnology': 'BIOTECH-VIP',
    'consumer-goods': 'CPG-VIP',
    'apparel-fashion': 'FASHION-VIP',
    'nonprofit': 'NONPROFIT-VIP',
    'medical-devices': 'MEDDEVICE-VIP',
    'pharmaceuticals': 'PHARMA-VIP',
    'internet': 'INTERNET-VIP',
    'computer-software': 'SOFTWARE-VIP',
    'investment-banking': 'IB-VIP',
  }
  return codes[slug] || ''
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

function formatBounce(data: Record<string, unknown>) {
  const lead = data.lead_email || data.email || 'Unknown'
  const campaign = data.campaign_name || ''
  return [
    `<b>Bounce</b>`,
    `Email: ${lead}`,
    campaign ? `Campaign: ${campaign}` : '',
  ].filter(Boolean).join('\n')
}

function formatInterested(data: Record<string, unknown>, positive: boolean, autoReplied: boolean) {
  const lead = data.lead_email || data.email || 'Unknown'
  const company = data.lead_company_name || data.company_name || ''
  const campaign = data.campaign_name || ''
  const label = positive ? 'Interested' : 'Not Interested'
  const lines = [
    `${positive ? '🟢' : '🔴'} <b>Lead ${label}</b>`,
    `From: <b>${lead}</b>${company ? ` (${company})` : ''}`,
    campaign ? `Campaign: ${campaign}` : '',
  ]
  if (positive && autoReplied) {
    lines.push('', '✅ Auto-replied with calendar link')
  } else if (positive && !autoReplied) {
    lines.push('', '⚠️ Auto-reply failed — reply manually!')
  }
  return lines.filter(Boolean).join('\n')
}

// ── Main handler ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const eventType = payload.event_type || ''
    const data = payload.data || payload

    let message = ''

    switch (eventType) {
      case 'reply_received':
        message = formatReply(data)
        break
      case 'email_bounced':
        message = formatBounce(data)
        break
      case 'lead_interested': {
        const autoReplied = await autoReplyInterested(data)
        message = formatInterested(data, true, autoReplied)
        break
      }
      case 'lead_not_interested':
        message = formatInterested(data, false, false)
        break
      default:
        message = `<b>${eventType || 'Unknown event'}</b>\n${JSON.stringify(data).slice(0, 400)}`
    }

    await sendTelegram(message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
