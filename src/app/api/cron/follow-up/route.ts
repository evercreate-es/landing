import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY!
const INSTANTLY_API = 'https://api.instantly.ai/api/v2'
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!

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

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()

  // Find leads who were auto-replied 3+ days ago but haven't booked
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: leads, error } = await supabase
    .from('interested_leads')
    .select('*')
    .is('booked_at', null)
    .eq('followed_up', false)
    .lte('auto_replied_at', threeDaysAgo)

  if (error) {
    console.error('Cron — Supabase query error:', error)
    return NextResponse.json({ ok: false, error: error.message })
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ ok: true, followed_up: 0 })
  }

  let successCount = 0

  for (const lead of leads) {
    try {
      // Find the latest email thread with this lead
      const emails = await instantlyGet(
        `/emails?lead=${encodeURIComponent(lead.email)}&email_type=sent&limit=1&sort_order=desc`
      )

      const items = emails?.items || []
      if (items.length === 0) {
        // Mark as followed up even if we can't find the thread (avoid retrying forever)
        await supabase
          .from('interested_leads')
          .update({ followed_up: true })
          .eq('id', lead.id)
        continue
      }

      const latestEmail = items[0]
      const emailId = latestEmail.id
      const senderAccount = latestEmail.from_address_email
        || latestEmail.eaccount
        || latestEmail.from_address?.email

      if (!emailId || !senderAccount) {
        await supabase
          .from('interested_leads')
          .update({ followed_up: true })
          .eq('id', lead.id)
        continue
      }

      const code = getCampaignCode(lead.slug)
      const followUpBody = [
        `Hey! I sent you my calendar link a few days ago but haven't seen a booking come through yet.`,
        ``,
        `Here it is again in case it got buried: <a href="https://evercreate.co/${lead.slug}">evercreate.co/${lead.slug}</a>`,
        ``,
        `Code: <b>${code}</b>`,
        ``,
        `No pressure at all, just didn't want it to get lost in your inbox!`,
        ``,
        `Iñigo`,
      ].join('<br />')

      await instantlyPost('/emails/reply', {
        reply_to_uuid: emailId,
        eaccount: senderAccount,
        body: {
          html: followUpBody,
          text: followUpBody.replace(/<br \/>/g, '\n').replace(/<a[^>]*>([^<]*)<\/a>/g, '$1').replace(/<\/?b>/g, ''),
        },
      })

      // Mark as followed up
      await supabase
        .from('interested_leads')
        .update({ followed_up: true })
        .eq('id', lead.id)

      successCount++
    } catch (err) {
      console.error(`Follow-up failed for ${lead.email}:`, err)
    }
  }

  // Notify via Telegram
  if (successCount > 0) {
    await sendTelegram(
      `📬 <b>Follow-up cron</b>\nSent ${successCount} follow-up email${successCount > 1 ? 's' : ''} to interested leads who haven't booked yet.`
    )
  }

  return NextResponse.json({ ok: true, followed_up: successCount })
}
