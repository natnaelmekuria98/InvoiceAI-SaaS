'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, AlertCircle, CheckCircle2, Download, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AuditDetail {
  id: string
  confidence_score: number
  flags: any[]
  validation_results: any
  created_at: string
  invoices: {
    id: string
    file_name: string
    file_url: string
    extracted_data: any
    created_at: string
  }
  purchase_orders?: {
    po_number: string
    vendor: string
    total_amount: number
  }
}

export default function AuditDetailPage() {
  const params = useParams()
  const [audit, setAudit] = useState<AuditDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAudit()
  }, [params.id])

  const fetchAudit = async () => {
    try {
      const response = await fetch(`/api/audit/${params.id}`)
      const data = await response.json()
      setAudit(data.audit)
    } catch (error) {
      console.error('Failed to fetch audit:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading audit report...</p>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">Audit not found</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const extracted = audit.invoices.extracted_data || {}
  const chartData = extracted.items?.slice(0, 5).map((item: any) => ({
    name: item.description?.substring(0, 20) || 'Item',
    amount: item.total || 0,
  })) || []

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'secondary'
      default:
        return 'default'
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

      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Audit Report</h1>
          <p className="text-slate-600">
            {audit.invoices.file_name} • {formatDate(audit.created_at)}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Confidence Score */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Confidence Score</CardTitle>
                    <CardDescription>Overall audit confidence</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{audit.confidence_score}%</div>
                    {audit.confidence_score >= 85 ? (
                      <Badge variant="success" className="mt-2">High Confidence</Badge>
                    ) : audit.confidence_score >= 70 ? (
                      <Badge variant="warning" className="mt-2">Medium Confidence</Badge>
                    ) : (
                      <Badge variant="destructive" className="mt-2">Low Confidence</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Flags */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Flags</CardTitle>
                <CardDescription>
                  {audit.flags.length === 0 ? 'No issues detected' : `${audit.flags.length} issue(s) found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {audit.flags.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">All validation checks passed</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {audit.flags.map((flag: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 border rounded-lg"
                      >
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getSeverityColor(flag.severity)}>
                              {flag.type}
                            </Badge>
                            <span className="text-xs text-slate-500 uppercase">
                              {flag.severity} severity
                            </span>
                          </div>
                          <p className="text-sm font-medium">{flag.message}</p>
                          {flag.details && (
                            <pre className="text-xs bg-slate-50 p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(flag.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Extracted Data */}
            <Card>
              <CardHeader>
                <CardTitle>Extracted Data</CardTitle>
                <CardDescription>AI-extracted invoice information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Vendor</p>
                    <p className="font-semibold">{extracted.vendor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Invoice Number</p>
                    <p className="font-semibold">{extracted.invoice_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-semibold">{extracted.date ? formatDate(extracted.date) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Due Date</p>
                    <p className="font-semibold">{extracted.due_date ? formatDate(extracted.due_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Subtotal</p>
                    <p className="font-semibold">
                      {extracted.subtotal ? formatCurrency(extracted.subtotal) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tax</p>
                    <p className="font-semibold">
                      {extracted.tax ? formatCurrency(extracted.tax) : 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {extracted.total ? formatCurrency(extracted.total) : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Line Items Breakdown</CardTitle>
                  <CardDescription>Top 5 items by amount</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="amount" fill="#3b82f6" name="Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Line Items Table */}
            {extracted.items && extracted.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>{extracted.items.length} items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                            Unit Price
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {extracted.items.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-semibold">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href={audit.invoices.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="h-4 w-4" />
                    View Invoice
                  </Button>
                </a>
                <Button variant="outline" className="w-full gap-2" onClick={() => window.print()}>
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>

            {/* PO Comparison */}
            {audit.purchase_orders && (
              <Card>
                <CardHeader>
                  <CardTitle>PO Comparison</CardTitle>
                  <CardDescription>Purchase Order #{audit.purchase_orders.po_number}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">PO Vendor</p>
                      <p className="font-semibold">{audit.purchase_orders.vendor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">PO Amount</p>
                      <p className="font-semibold">
                        {formatCurrency(audit.purchase_orders.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Invoice Amount</p>
                      <p className="font-semibold">{formatCurrency(extracted.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Difference</p>
                      <p className={`font-semibold ${
                        Math.abs(extracted.total - audit.purchase_orders.total_amount) > 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {formatCurrency(Math.abs(extracted.total - audit.purchase_orders.total_amount))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validation Checks */}
            {audit.validation_results?.checks && (
              <Card>
                <CardHeader>
                  <CardTitle>Validation Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(audit.validation_results.checks).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{key.replace(/_/g, ' ')}</span>
                        {value ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

