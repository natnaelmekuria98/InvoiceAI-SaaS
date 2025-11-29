import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase/client'
import { extractTextFromPDF, extractTextFromImage, extractInvoiceData } from '@/lib/ai/extraction'
import { validateInvoice } from '@/lib/ai/validation'
import { PLAN_LIMITS } from '@/lib/config/constants'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fileUrl, fileName, fileType, poId } = body

    const supabase = createSupabaseServerClient()

    // Check user and usage limits
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check usage limits for free users
    if (user.plan === 'free') {
      const resetDate = new Date(user.usage_reset_date)
      const now = new Date()
      
      // Reset usage if month has passed
      if (now > resetDate) {
        await supabase
          .from('users')
          .update({
            usage_count: 0,
            usage_reset_date: new Date(now.setMonth(now.getMonth() + 1)).toISOString(),
          })
          .eq('id', user.id)
        user.usage_count = 0
      }

      if (user.usage_count >= PLAN_LIMITS.free.audits_per_month) {
        return NextResponse.json(
          { error: 'Monthly audit limit reached. Upgrade to Pro for unlimited audits.' },
          { status: 403 }
        )
      }
    }

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        status: 'processing',
      })
      .select()
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Failed to create invoice record' }, { status: 500 })
    }

    // Extract text from file
    let text: string
    try {
      if (fileType === 'application/pdf') {
        const response = await fetch(fileUrl)
        const buffer = Buffer.from(await response.arrayBuffer())
        text = await extractTextFromPDF(buffer)
      } else {
        text = await extractTextFromImage(fileUrl)
      }
    } catch (error) {
      await supabase
        .from('invoices')
        .update({ status: 'failed' })
        .eq('id', invoice.id)
      
      return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 500 })
    }

    // Extract structured data using RAG
    let extractedData
    try {
      extractedData = await extractInvoiceData(text, invoice.id)
      
      await supabase
        .from('invoices')
        .update({
          extracted_data: extractedData,
          status: 'completed',
        })
        .eq('id', invoice.id)
    } catch (error) {
      await supabase
        .from('invoices')
        .update({ status: 'failed' })
        .eq('id', invoice.id)
      
      return NextResponse.json({ error: 'Failed to extract invoice data' }, { status: 500 })
    }

    // Get PO if provided
    let po = null
    if (poId) {
      const { data: poData } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', poId)
        .eq('user_id', user.id)
        .single()
      po = poData
    }

    // Validate using LangGraph agent
    const { flags, confidence, validationResults } = await validateInvoice(
      extractedData,
      user.id,
      po || undefined
    )

    // Create audit record
    const { data: audit } = await supabase
      .from('audits')
      .insert({
        user_id: user.id,
        invoice_id: invoice.id,
        po_id: poId || null,
        confidence_score: confidence,
        flags,
        validation_results: validationResults,
      })
      .select()
      .single()

    // Increment usage count
    await supabase
      .from('users')
      .update({ usage_count: user.usage_count + 1 })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      audit: {
        id: audit.id,
        invoice_id: invoice.id,
        confidence_score: confidence,
        flags,
        extracted_data: extractedData,
      },
    })
  } catch (error) {
    console.error('Audit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get user's audits with invoice data
    const { data: audits } = await supabase
      .from('audits')
      .select(`
        *,
        invoices (
          id,
          file_name,
          file_url,
          extracted_data,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ audits })
  } catch (error) {
    console.error('Fetch audits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

