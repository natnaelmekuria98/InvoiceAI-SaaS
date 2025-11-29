import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createSupabaseServerClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  const svix_id = req.headers.get('svix-id')
  const svix_timestamp = req.headers.get('svix-timestamp')
  const svix_signature = req.headers.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: any

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const { type, data } = evt
  const supabase = createSupabaseServerClient()

  switch (type) {
    case 'user.created':
      // Create user in database
      const resetDate = new Date()
      resetDate.setMonth(resetDate.getMonth() + 1)

      await supabase.from('users').insert({
        clerk_id: data.id,
        email: data.email_addresses[0]?.email_address || '',
        plan: 'free',
        usage_count: 0,
        usage_reset_date: resetDate.toISOString(),
      })
      break

    case 'user.updated':
      // Update user in database
      await supabase
        .from('users')
        .update({
          email: data.email_addresses[0]?.email_address || '',
        })
        .eq('clerk_id', data.id)
      break

    case 'user.deleted':
      // Delete user from database
      await supabase.from('users').delete().eq('clerk_id', data.id)
      break
  }

  return NextResponse.json({ success: true })
}

