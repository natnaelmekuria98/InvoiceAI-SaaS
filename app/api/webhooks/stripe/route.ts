import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      
      // Upgrade user to pro
      if (session.metadata?.userId) {
        await supabase
          .from('users')
          .update({ plan: 'pro' })
          .eq('clerk_id', session.metadata.userId)
      }
      break

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription
      
      // Handle subscription changes
      const customerId = subscription.customer as string
      const isActive = subscription.status === 'active'

      // Find user by Stripe customer ID (you'd need to store this)
      // For simplicity, we'll skip this part
      break

    case 'invoice.payment_failed':
      const invoice = event.data.object as Stripe.Invoice
      
      // Downgrade user to free if payment fails
      // Would need to track customer_id -> user_id mapping
      break
  }

  return NextResponse.json({ received: true })
}

