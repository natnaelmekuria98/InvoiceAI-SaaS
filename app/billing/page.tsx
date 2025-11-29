'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle2, Zap, CreditCard } from 'lucide-react'
import { PLAN_LIMITS } from '@/lib/config/constants'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface UsageData {
  plan: string
  usage: number
  limit: number
  remaining: number
}

export default function BillingPage() {
  const { user } = useUser()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    const response = await fetch('/api/usage')
    const data = await response.json()
    setUsage(data)
  }

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
          <p className="text-slate-600">Manage your subscription and usage</p>
        </div>

        {/* Current Plan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>{user?.emailAddresses[0]?.emailAddress}</CardDescription>
              </div>
              <Badge variant={usage?.plan === 'pro' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                {usage?.plan?.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {usage && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Usage This Month</p>
                  <p className="text-2xl font-bold">
                    {usage.usage} {usage.plan === 'free' ? `/ ${usage.limit}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Remaining</p>
                  <p className="text-2xl font-bold">
                    {usage.plan === 'pro' ? 'Unlimited' : usage.remaining}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Monthly Cost</p>
                  <p className="text-2xl font-bold">
                    ${PLAN_LIMITS[usage.plan as 'free' | 'pro'].price}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans */}
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className={usage?.plan === 'free' ? 'border-blue-600 border-2' : ''}>
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for trying out the platform</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${PLAN_LIMITS.free.price}</span>
                <span className="text-slate-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              {usage?.plan === 'free' ? (
                <Button variant="outline" className="w-full mb-6" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" className="w-full mb-6" disabled>
                  Downgrade
                </Button>
              )}
              <ul className="space-y-3">
                {PLAN_LIMITS.free.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={usage?.plan === 'pro' ? 'border-blue-600 border-2' : 'border-blue-300'}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                Pro
                <Zap className="h-5 w-5 text-yellow-500" />
              </CardTitle>
              <CardDescription>For growing businesses</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${PLAN_LIMITS.pro.price}</span>
                <span className="text-slate-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              {usage?.plan === 'pro' ? (
                <Button variant="outline" className="w-full mb-6" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full mb-6 gap-2"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  <CreditCard className="h-4 w-4" />
                  {loading ? 'Processing...' : 'Upgrade to Pro'}
                </Button>
              )}
              <ul className="space-y-3">
                {PLAN_LIMITS.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">How does billing work?</h3>
              <p className="text-sm text-slate-600">
                Pro plans are billed monthly. You can cancel anytime and will retain access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">What payment methods do you accept?</h3>
              <p className="text-sm text-slate-600">
                We accept all major credit cards through Stripe's secure payment processing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Can I upgrade or downgrade anytime?</h3>
              <p className="text-sm text-slate-600">
                Yes! Upgrade to Pro instantly. Downgrades take effect at the end of your current billing period.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

