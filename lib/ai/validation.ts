import { StateGraph, END } from "@langchain/langgraph"
import { ChatGroq } from "@langchain/groq"
import { ExtractedData, PurchaseOrder, AuditFlag, ValidationResult } from "@/lib/types"
import { AUDIT_THRESHOLDS } from "@/lib/config/constants"
import { calculateDiscrepancy } from "@/lib/utils"
import { createSupabaseServerClient } from "@/lib/supabase/client"

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-70b-8192",
  temperature: 0,
})

interface AgentState {
  invoice: ExtractedData
  po?: PurchaseOrder
  userId: string
  flags: AuditFlag[]
  validationResults: ValidationResult
  confidence: number
}

/**
 * Tool: Validate amount against PO
 */
async function validateAmount(state: AgentState): Promise<Partial<AgentState>> {
  const { invoice, po } = state
  const flags: AuditFlag[] = [...state.flags]
  
  if (!po) {
    flags.push({
      type: "missing_po",
      severity: "medium",
      message: "No purchase order found for validation",
    })
    return { flags }
  }

  const discrepancy = calculateDiscrepancy(po.total_amount, invoice.total)
  
  if (discrepancy > AUDIT_THRESHOLDS.DISCREPANCY_PERCENT) {
    flags.push({
      type: "amount_mismatch",
      severity: discrepancy > 10 ? "high" : "medium",
      message: `Amount mismatch: Invoice $${invoice.total} vs PO $${po.total_amount} (${discrepancy.toFixed(1)}% difference)`,
      details: {
        invoice_amount: invoice.total,
        po_amount: po.total_amount,
        discrepancy_percent: discrepancy,
      },
    })
  }

  return { flags }
}

/**
 * Tool: Check for duplicate invoices
 */
async function checkDuplicate(state: AgentState): Promise<Partial<AgentState>> {
  const { invoice, userId } = state
  const flags: AuditFlag[] = [...state.flags]
  const supabase = createSupabaseServerClient()

  // Check for duplicate by vendor + date + amount
  const { data: duplicates } = await supabase
    .from("invoices")
    .select("id, file_name, created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .filter("extracted_data->>vendor", "eq", invoice.vendor)
    .filter("extracted_data->>date", "eq", invoice.date)
    .filter("extracted_data->>total", "eq", invoice.total.toString())
    .limit(5)

  if (duplicates && duplicates.length > 0) {
    flags.push({
      type: "duplicate",
      severity: "high",
      message: `Potential duplicate invoice detected (${duplicates.length} similar found)`,
      details: {
        similar_invoices: duplicates,
      },
    })
  }

  return { flags }
}

/**
 * Tool: Fraud detection checks
 */
async function fraudCheck(state: AgentState): Promise<Partial<AgentState>> {
  const { invoice, po } = state
  const flags: AuditFlag[] = [...state.flags]

  // Check 1: Unusual date patterns (weekend, future date)
  const invoiceDate = new Date(invoice.date)
  const today = new Date()
  
  if (invoiceDate > today) {
    flags.push({
      type: "fraud",
      severity: "high",
      message: "Invoice dated in the future",
      details: { invoice_date: invoice.date },
    })
  }

  // Check 2: Round number amounts (potential fraud indicator)
  if (invoice.total % 100 === 0 && invoice.total >= 1000) {
    flags.push({
      type: "fraud",
      severity: "low",
      message: "Suspicious round number amount",
      details: { amount: invoice.total },
    })
  }

  // Check 3: Vendor mismatch with PO
  if (po && invoice.vendor.toLowerCase() !== po.vendor.toLowerCase()) {
    const similarity = calculateStringSimilarity(
      invoice.vendor.toLowerCase(),
      po.vendor.toLowerCase()
    )
    
    if (similarity < 0.7) {
      flags.push({
        type: "fraud",
        severity: "high",
        message: `Vendor mismatch: Invoice "${invoice.vendor}" vs PO "${po.vendor}"`,
        details: {
          invoice_vendor: invoice.vendor,
          po_vendor: po.vendor,
        },
      })
    }
  }

  // Check 4: Items total mismatch
  if (invoice.items.length > 0) {
    const itemsTotal = invoice.items.reduce((sum, item) => sum + item.total, 0)
    const expectedTotal = invoice.subtotal || invoice.total
    const itemDiscrepancy = calculateDiscrepancy(expectedTotal, itemsTotal)
    
    if (itemDiscrepancy > 5) {
      flags.push({
        type: "discrepancy",
        severity: "medium",
        message: `Line items total ($${itemsTotal}) doesn't match invoice total ($${expectedTotal})`,
        details: {
          items_total: itemsTotal,
          invoice_total: expectedTotal,
          discrepancy: itemDiscrepancy,
        },
      })
    }
  }

  return { flags }
}

/**
 * Tool: Match PO items
 */
async function checkPOMatch(state: AgentState): Promise<Partial<AgentState>> {
  const { invoice, po } = state
  const flags: AuditFlag[] = [...state.flags]

  if (!po || !po.items || po.items.length === 0) {
    return { flags }
  }

  // Simple item matching (can be enhanced with fuzzy matching)
  const invoiceItems = invoice.items
  const poItems = po.items

  if (invoiceItems.length !== poItems.length) {
    flags.push({
      type: "discrepancy",
      severity: "low",
      message: `Item count mismatch: Invoice has ${invoiceItems.length} items, PO has ${poItems.length}`,
    })
  }

  return { flags }
}

/**
 * Calculate confidence score based on flags
 */
function calculateConfidence(flags: AuditFlag[]): number {
  let confidence = 100
  
  flags.forEach(flag => {
    switch (flag.severity) {
      case "high":
        confidence -= 15
        break
      case "medium":
        confidence -= 8
        break
      case "low":
        confidence -= 3
        break
    }
  })

  return Math.max(0, confidence)
}

/**
 * LangGraph agentic validation workflow
 */
export async function validateInvoice(
  invoice: ExtractedData,
  userId: string,
  po?: PurchaseOrder
): Promise<{ flags: AuditFlag[]; confidence: number; validationResults: ValidationResult }> {
  
  // Define the agent state graph
  const workflow = new StateGraph<AgentState>({
    channels: {
      invoice: null,
      po: null,
      userId: null,
      flags: null,
      validationResults: null,
      confidence: null,
    },
  })

  // Add nodes (tools)
  workflow.addNode("validate_amount", validateAmount)
  workflow.addNode("check_duplicate", checkDuplicate)
  workflow.addNode("fraud_check", fraudCheck)
  workflow.addNode("check_po_match", checkPOMatch)
  
  // Define edges (workflow)
  workflow.addEdge("__start__", "validate_amount")
  workflow.addEdge("validate_amount", "check_duplicate")
  workflow.addEdge("check_duplicate", "fraud_check")
  workflow.addEdge("fraud_check", "check_po_match")
  workflow.addEdge("check_po_match", END)

  const app = workflow.compile()

  // Initialize state
  const initialState: AgentState = {
    invoice,
    po,
    userId,
    flags: [],
    confidence: 100,
    validationResults: {
      passed: true,
      checks: {
        amount_match: true,
        vendor_match: true,
        date_valid: true,
        no_duplicate: true,
        items_match: true,
      },
      discrepancies: [],
    },
  }

  // Run the agent
  const result = await app.invoke(initialState)
  
  // Calculate final confidence
  const confidence = calculateConfidence(result.flags)

  // Build validation results
  const validationResults: ValidationResult = {
    passed: confidence >= AUDIT_THRESHOLDS.LOW_CONFIDENCE,
    checks: {
      amount_match: !result.flags.some(f => f.type === "amount_mismatch"),
      vendor_match: !result.flags.some(f => f.type === "fraud" && f.message.includes("Vendor")),
      date_valid: !result.flags.some(f => f.message.includes("future")),
      no_duplicate: !result.flags.some(f => f.type === "duplicate"),
      items_match: !result.flags.some(f => f.message.includes("items")),
    },
    discrepancies: result.flags.map(f => ({
      field: f.type,
      expected: f.details?.po_amount || f.details?.po_vendor || null,
      actual: f.details?.invoice_amount || f.details?.invoice_vendor || null,
      difference: f.details?.discrepancy_percent || f.details?.discrepancy || 0,
    })),
  }

  return {
    flags: result.flags,
    confidence,
    validationResults,
  }
}

/**
 * Helper: Calculate string similarity (Levenshtein distance)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return 1 - distance / maxLen
}

