import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Cal.com sends triggerEvent at top level
    if (payload.triggerEvent !== 'BOOKING_CREATED') {
      return NextResponse.json({ ok: true })
    }

    const bookerEmail = (
      payload.payload?.responses?.email?.value ||
      payload.payload?.attendees?.[0]?.email ||
      ''
    ).toLowerCase().trim()

    if (!bookerEmail) {
      return NextResponse.json({ ok: true })
    }

    // Mark this lead as booked in Supabase
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('interested_leads')
      .update({ booked_at: new Date().toISOString() })
      .eq('email', bookerEmail)
      .is('booked_at', null)

    if (error) {
      console.error('Cal.com webhook — Supabase error:', error)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Cal.com webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
