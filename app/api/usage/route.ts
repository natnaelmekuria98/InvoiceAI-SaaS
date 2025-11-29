import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase/client'
import { PLAN_LIMITS } from '@/lib/config/constants'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseServerClient()

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const planLimit = PLAN_LIMITS[user.plan]
    const remaining =
      user.plan === 'pro'
        ? -1 // unlimited
        : Math.max(0, planLimit.audits_per_month - user.usage_count)

    return NextResponse.json({
      plan: user.plan,
      usage: user.usage_count,
      limit: planLimit.audits_per_month,
      remaining,
      reset_date: user.usage_reset_date,
    })
  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

