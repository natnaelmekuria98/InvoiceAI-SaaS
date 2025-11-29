# InvoiceAI - AI-Powered Invoice Auditor SaaS

A production-ready, full-stack Next.js 15 application that automates invoice auditing using AI. Built for SMBs with 95%+ accuracy goal, featuring RAG-based extraction, agentic validation, and fraud detection.

## 🚀 Features

- **AI Invoice Extraction**: Extract vendor, amounts, dates, and line items from PDFs/images using RAG pipeline
- **Agentic Validation**: LangGraph-powered multi-step validation with fraud detection
- **PO Matching**: Automatic comparison against purchase orders and contracts
- **Real-time Processing**: Upload → Extract → Validate → Report in seconds
- **Freemium Model**: 5 free audits/month, $29/month unlimited pro
- **Modern UI**: Tailwind CSS with shadcn/ui components
- **Authentication**: Clerk for secure user management
- **Payments**: Stripe integration for subscriptions
- **Database**: Supabase Postgres with pgvector for embeddings

## 📋 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Database**: Supabase (Postgres + pgvector)
- **AI/LLM**: Groq (Llama3-70B) / OpenAI (GPT-4o-mini)
- **RAG**: LangChain.js + OpenAI Embeddings
- **Agents**: LangGraph.js
- **File Upload**: Uploadthing
- **Payments**: Stripe
- **UI Components**: shadcn/ui, Recharts
- **Deployment**: Docker, Vercel-ready

## 🛠️ Setup

### Prerequisites

- Node.js 20+ (recommended, works with 18+)
- npm or yarn
- Supabase account
- Clerk account
- Groq/OpenAI API key
- Uploadthing account
- Stripe account

### Environment Variables

Create a `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# AI/LLM
GROQ_API_KEY=gsk_xxx
OPENAI_API_KEY=sk-xxx

# Uploadthing
UPLOADTHING_SECRET=sk_live_xxx
UPLOADTHING_APP_ID=xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a Supabase project
2. Enable pgvector extension in SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the schema from `lib/supabase/schema.sql`
4. Create a match_documents function (required for vector search):
   ```sql
   CREATE OR REPLACE FUNCTION match_documents (
     query_embedding vector(1536),
     match_count int DEFAULT 5
   ) RETURNS TABLE (
     id uuid,
     content text,
     metadata jsonb,
     similarity float
   )
   LANGUAGE plpgsql
   AS $$
   BEGIN
     RETURN QUERY
     SELECT
       document_embeddings.id,
       document_embeddings.content,
       document_embeddings.metadata,
       1 - (document_embeddings.embedding <=> query_embedding) as similarity
     FROM document_embeddings
     ORDER BY document_embeddings.embedding <=> query_embedding
     LIMIT match_count;
   END;
   $$;
   ```

### Installation

```bash
cd invoice-auditor
npm install --legacy-peer-deps
npm run dev
```

Visit `http://localhost:3000`

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build standalone
docker build -t invoice-auditor .
docker run -p 3000:3000 --env-file .env.local invoice-auditor
```

## 📦 Project Structure

```
invoice-auditor/
├── app/
│   ├── api/
│   │   ├── audit/          # Main audit endpoint
│   │   ├── checkout/       # Stripe checkout
│   │   ├── uploadthing/    # File upload config
│   │   ├── usage/          # Usage tracking
│   │   └── webhooks/       # Clerk & Stripe webhooks
│   ├── audit/[id]/         # Audit detail page
│   ├── billing/            # Billing & plans
│   ├── dashboard/          # Main dashboard
│   ├── sign-in/            # Clerk sign-in
│   ├── sign-up/            # Clerk sign-up
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── upload-zone.tsx     # File upload component
├── lib/
│   ├── ai/
│   │   ├── extraction.ts   # RAG pipeline
│   │   └── validation.ts   # LangGraph agent
│   ├── supabase/
│   │   ├── client.ts       # Supabase client
│   │   └── schema.sql      # Database schema
│   ├── config/
│   │   └── constants.ts    # App constants
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔄 Workflows

### Invoice Audit Pipeline

1. **Upload**: User uploads invoice (PDF/image) via Uploadthing
2. **Extract**: 
   - PDF → Extract text with pdf-parse
   - Image → OCR with OpenAI Vision
   - RAG: Chunk text → OpenAI embeddings → Supabase pgvector
   - LLM: Groq Llama3-70B extracts structured data
3. **Validate**: LangGraph agent runs validation tools:
   - `validate_amount`: Compare with PO
   - `check_duplicate`: Search for duplicates
   - `fraud_check`: Detect suspicious patterns
   - `check_po_match`: Match line items
4. **Report**: Generate audit with confidence score and flags
5. **Store**: Save to Supabase, increment usage

## 🎯 API Endpoints

- `POST /api/audit` - Process invoice
- `GET /api/audit` - Get audit history
- `GET /api/audit/[id]` - Get audit detail
- `GET /api/usage` - Check usage limits
- `POST /api/checkout` - Create Stripe checkout
- `POST /api/webhooks/clerk` - Clerk user webhooks
- `POST /api/webhooks/stripe` - Stripe payment webhooks

## 💰 Pricing

- **Free**: 5 audits/month
- **Pro**: $29/month, unlimited audits + advanced features

## 🔐 Security

- Clerk handles authentication
- Supabase Row Level Security (configure in Supabase dashboard)
- API routes protected by auth middleware
- Webhook signature verification
- Environment variables for secrets

## 🚀 Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Railway

```bash
railway init
railway add
railway up
```

### Self-hosted

Use Docker or build standalone:

```bash
npm run build
npm start
```

## 📊 Cost Estimation

Per audit (avg):
- Groq API: ~$0.001 (70B model)
- OpenAI Embeddings: ~$0.002
- Uploadthing: Free tier
- Supabase: Free tier
- **Total: < $0.01 per audit**

## 🛠️ Configuration

### Clerk

1. Create application in Clerk dashboard
2. Enable email/password auth
3. Add webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to `user.created`, `user.updated`, `user.deleted`

### Stripe

1. Create product "Pro Plan" at $29/month
2. Get price ID
3. Add webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Subscribe to `checkout.session.completed`, `customer.subscription.*`

### Uploadthing

1. Create app at uploadthing.com
2. Get API keys
3. Configure file size/type limits

## 📝 License

MIT

## 🤝 Contributing

Issues and PRs welcome!

## 📧 Support

For issues, open a GitHub issue or contact support@invoiceai.com (example)

---

Built with ❤️ using Next.js, LangChain, and modern AI
# InvoiceAI-SaaS
