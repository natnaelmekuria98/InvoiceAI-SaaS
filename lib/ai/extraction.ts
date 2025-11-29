import { ChatGroq } from "@langchain/groq"
import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { JsonOutputParser } from "@langchain/core/output_parsers"
import { ExtractedData } from "@/lib/types"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { OpenAIEmbeddings } from "@langchain/openai"
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { createSupabaseServerClient } from "@/lib/supabase/client"
import pdf from 'pdf-parse'

// Use Groq for speed and cost efficiency
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-70b-8192",
  temperature: 0,
})

// Fallback to OpenAI if needed
const openaiModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
})

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-small",
})

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error("Error extracting PDF text:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

/**
 * Extract invoice data using RAG pipeline
 */
export async function extractInvoiceData(
  text: string,
  invoiceId: string
): Promise<ExtractedData> {
  // Chunk the document
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  const chunks = await textSplitter.createDocuments([text])

  // Store embeddings in Supabase
  const supabase = createSupabaseServerClient()
  const vectorStore = await SupabaseVectorStore.fromDocuments(
    chunks,
    embeddings,
    {
      client: supabase,
      tableName: "document_embeddings",
      queryName: "match_documents",
    }
  )

  // Retrieve relevant chunks
  const retriever = vectorStore.asRetriever({ k: 5 })
  const relevantDocs = await retriever.invoke(
    "Extract vendor, invoice number, dates, amounts, and line items"
  )
  
  const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")

  // Extraction prompt
  const extractionPrompt = PromptTemplate.fromTemplate(`
You are an expert invoice data extractor. Extract structured data from the following invoice text.

Invoice Text:
{context}

Extract and return ONLY valid JSON with this exact structure:
{{
  "vendor": "string",
  "invoice_number": "string or null",
  "date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD or null",
  "total": number,
  "subtotal": number or null,
  "tax": number or null,
  "items": [
    {{
      "description": "string",
      "quantity": number,
      "unit_price": number,
      "total": number
    }}
  ]
}}

Important:
- All amounts must be numbers (no currency symbols)
- Dates must be in YYYY-MM-DD format
- If a field is not found, use null
- Items array can be empty if no line items found
- Ensure total equals sum of item totals (or subtotal + tax)
`)

  const parser = new JsonOutputParser()
  const chain = extractionPrompt.pipe(model).pipe(parser)

  try {
    const result = await chain.invoke({ context })
    
    // Validate and sanitize the result
    const extractedData: ExtractedData = {
      vendor: result.vendor || "Unknown Vendor",
      invoice_number: result.invoice_number,
      date: result.date || new Date().toISOString().split('T')[0],
      due_date: result.due_date,
      total: parseFloat(result.total) || 0,
      subtotal: result.subtotal ? parseFloat(result.subtotal) : undefined,
      tax: result.tax ? parseFloat(result.tax) : undefined,
      items: Array.isArray(result.items) ? result.items.map((item: any) => ({
        description: item.description || "",
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        total: parseFloat(item.total) || 0,
      })) : [],
    }

    return extractedData
  } catch (error) {
    console.error("Extraction error:", error)
    throw new Error("Failed to extract invoice data")
  }
}

/**
 * Extract text from image (OCR via OpenAI vision)
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  const visionModel = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  })

  const prompt = `Extract all text from this invoice image. Return the raw text content including:
- Vendor name
- Invoice number
- Dates
- Line items with descriptions, quantities, and amounts
- Totals and subtotals

Format the output as plain text, preserving the structure.`

  const response = await visionModel.invoke([
    {
      type: "text",
      text: prompt,
    },
    {
      type: "image_url",
      image_url: {
        url: imageUrl,
      },
    },
  ] as any)

  return response.content as string
}

