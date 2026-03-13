import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, reason: 'invalid' },
        { status: 400 }
      )
    }

    // Internal test code — bypasses DB, no usage tracked
    const testCode = process.env.TEST_CODE
    if (testCode && code.toUpperCase().trim() === testCode.trim().toUpperCase()) {
      return NextResponse.json({ valid: true, industry: 'test' })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase.rpc('validate_promo_code', {
      code_input: code.toUpperCase().trim(),
    })

    if (error || !data || data.length === 0) {
      return NextResponse.json({ valid: false, reason: 'invalid' })
    }

    const result = data[0]

    if (!result.success) {
      return NextResponse.json({
        valid: false,
        reason: result.reason as 'invalid' | 'exhausted',
      })
    }

    await supabase.from('code_redemptions').insert({
      code: code.toUpperCase().trim(),
      industry: result.industry,
    })

    return NextResponse.json({ valid: true, industry: result.industry })
  } catch {
    return NextResponse.json(
      { valid: false, reason: 'invalid' },
      { status: 500 }
    )
  }
}
