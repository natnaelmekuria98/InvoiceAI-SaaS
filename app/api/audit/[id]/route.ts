import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: audit } = await supabase
      .from('audits')
      .select(`
        *,
        invoices (
          id,
          file_name,
          file_url,
          extracted_data,
          created_at
        ),
        purchase_orders (
          po_number,
          vendor,
          total_amount
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    return NextResponse.json({ audit })
  } catch (error) {
    console.error('Fetch audit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

