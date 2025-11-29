import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Shield, Zap, TrendingUp, FileSearch, AlertTriangle } from 'lucide-react'
import { PLAN_LIMITS } from '@/lib/config/constants'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">InvoiceAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="#features" className="text-sm hover:text-blue-600">
              Features
            </Link>
            <Link href="#pricing" className="text-sm hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Automate Invoice Auditing with AI
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Save 90% of time on AP processes. AI-powered extraction, validation, and fraud detection 
            with 95%+ accuracy. Built for SMBs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            No credit card required • 5 free audits per month
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
          <div>
            <div className="text-4xl font-bold text-blue-600">95%+</div>
            <div className="text-sm text-slate-600 mt-1">Extraction Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">90%</div>
            <div className="text-sm text-slate-600 mt-1">Time Saved</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">&lt;$0.01</div>
            <div className="text-sm text-slate-600 mt-1">Cost Per Audit</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for AP Teams
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything you need to streamline invoice processing and catch errors before they cost you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <FileSearch className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>AI Extraction</CardTitle>
              <CardDescription>
                Extract vendor, amounts, dates, and line items from PDFs and images using advanced RAG
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Fraud Detection</CardTitle>
              <CardDescription>
                Agentic validation catches duplicates, mismatches, and suspicious patterns automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Smart Reports</CardTitle>
              <CardDescription>
                Get detailed audit reports with confidence scores and actionable insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>PO Matching</CardTitle>
              <CardDescription>
                Automatically compare invoices against purchase orders and contracts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-600 mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Process invoices in seconds with Groq-powered AI infrastructure
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Real-time Alerts</CardTitle>
              <CardDescription>
                Get instant notifications for discrepancies, duplicates, and high-risk items
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for trying out the platform</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${PLAN_LIMITS.free.price}</span>
                <span className="text-slate-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full mb-6">
                  Get Started
                </Button>
              </Link>
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
          <Card className="border-blue-600 border-2 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For growing businesses</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${PLAN_LIMITS.pro.price}</span>
                <span className="text-slate-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/sign-up">
                <Button className="w-full mb-6">
                  Start Pro Trial
                </Button>
              </Link>
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
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-3xl md:text-4xl mb-4">
              Ready to Transform Your AP Process?
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg mb-6">
              Join hundreds of SMBs saving time and catching errors with AI
            </CardDescription>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          <p>&copy; 2025 InvoiceAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
