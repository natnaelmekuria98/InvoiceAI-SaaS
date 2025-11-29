export interface User {
  id: string
  clerk_id: string
  email: string
  plan: 'free' | 'pro'
  usage_count: number
  usage_reset_date: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: string
  user_id: string
  po_number: string
  vendor: string
  total_amount: number
  issue_date: string
  items?: LineItem[]
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  file_name: string
  file_url: string
  file_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  extracted_data?: ExtractedData
  created_at: string
  updated_at: string
}

export interface ExtractedData {
  vendor: string
  invoice_number?: string
  date: string
  due_date?: string
  total: number
  subtotal?: number
  tax?: number
  items: LineItem[]
}

export interface LineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface AuditFlag {
  type: 'discrepancy' | 'duplicate' | 'fraud' | 'missing_po' | 'amount_mismatch'
  severity: 'low' | 'medium' | 'high'
  message: string
  details?: any
}

export interface Audit {
  id: string
  user_id: string
  invoice_id: string
  po_id?: string
  confidence_score: number
  flags: AuditFlag[]
  validation_results?: any
  report_url?: string
  created_at: string
}

export interface ValidationResult {
  passed: boolean
  checks: {
    amount_match: boolean
    vendor_match: boolean
    date_valid: boolean
    no_duplicate: boolean
    items_match: boolean
  }
  discrepancies: {
    field: string
    expected: any
    actual: any
    difference?: number
  }[]
}

