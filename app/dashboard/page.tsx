'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { UploadZone } from '@/components/upload-zone'
import { FileText, AlertCircle, CheckCircle2, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface UsageData {
  plan: string
  usage: number
  limit: number
  remaining: number
  reset_date: string
}

interface Audit {
  id: string
  confidence_score: number
  flags: any[]
  created_at: string
  invoices: {
    id: string
    file_name: string
    file_url: string
    extracted_data: any
    created_at: string
  }
}

export default function DashboardPage() {
  const { user } = useUser()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [audits, setAudits] = useState<Audit[]>([])
  const [processing, setProcessing] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<{
    fileName: string
    fileUrl: string
    fileType: string
  } | null>(null)

  useEffect(() => {
    fetchUsage()
    fetchAudits()
  }, [])

  const fetchUsage = async () => {
    const response = await fetch('/api/usage')
    const data = await response.json()
    setUsage(data)
  }

  const fetchAudits = async () => {
    const response = await fetch('/api/audit')
    const data = await response.json()
    setAudits(data.audits || [])
  }

  const handleUploadComplete = async (fileUrl: string, fileName: string, fileType: string) => {
    setUploadingFile({ fileName, fileUrl, fileType })
    setProcessing(true)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, fileName, fileType }),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchAudits()
        await fetchUsage()
        alert('Audit completed successfully!')
      } else {
        alert(data.error || 'Audit failed')
      }
    } catch (error) {
      console.error('Audit error:', error)
      alert('Failed to process invoice')
    } finally {
      setProcessing(false)
      setUploadingFile(null)
    }
  }

  const usagePercent = usage ? (usage.usage / usage.limit) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">InvoiceAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.emailAddresses[0]?.emailAddress}
            </span>
            <Link href="/billing">
              <Button variant="outline" size="sm">
                Billing
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Usage Meter */}
        {usage && usage.plan === 'free' && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Usage This Month</CardTitle>
                  <CardDescription>
                    {usage.usage} of {usage.limit} audits used
                  </CardDescription>
                </div>
                {usage.remaining === 0 && (
                  <Link href="/billing">
                    <Button>Upgrade to Pro</Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={usagePercent} />
              <p className="text-sm text-slate-600 mt-2">
                Resets on {formatDate(usage.reset_date)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upload Invoice</h2>
          {processing ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  <div className="text-center">
                    <p className="font-semibold mb-2">Processing {uploadingFile?.fileName}</p>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>✓ Extracting data from invoice...</p>
                      <p>✓ Running validation checks...</p>
                      <p>✓ Generating audit report...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <UploadZone onUploadComplete={handleUploadComplete} />
          )}
        </div>

        {/* Audits Table */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Audit History</h2>
          <Card>
            <CardContent className="p-0">
              {audits.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600">No audits yet. Upload your first invoice!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Confidence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Flags
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {audits.map((audit) => (
                        <tr key={audit.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-medium">
                                {audit.invoices.file_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {audit.invoices.extracted_data?.vendor || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {audit.invoices.extracted_data?.total
                              ? formatCurrency(audit.invoices.extracted_data.total)
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {audit.confidence_score}%
                              </span>
                              {audit.confidence_score >= 85 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : audit.confidence_score >= 70 ? (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {audit.flags.length === 0 ? (
                              <Badge variant="success">No Issues</Badge>
                            ) : (
                              <Badge variant="destructive">
                                {audit.flags.length} {audit.flags.length === 1 ? 'Flag' : 'Flags'}
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatDate(audit.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/audit/${audit.id}`}>
                              <Button variant="ghost" size="sm">
                                View Report
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

