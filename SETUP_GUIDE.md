# InvoiceAI Setup Guide

Complete step-by-step guide to get your Invoice Auditor SaaS running.

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd invoice-auditor
npm install --legacy-peer-deps
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (~2 minutes)
3. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

4. Go to **SQL Editor** and run:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Run the entire schema from lib/supabase/schema.sql
-- Copy and paste the contents of that file here

-- Add the vector search function
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

### 3. Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Choose **Email** and **Password** as authentication methods
3. Go to **API Keys** and copy:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`

4. Set up webhook (for production):
   - Go to **Webhooks** → **Add Endpoint**
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy signing secret → `CLERK_WEBHOOK_SECRET`

### 4. Get AI API Keys

**Option A: Groq (Recommended - Free tier, very fast)**
1. Go to [groq.com](https://console.groq.com)
2. Create account and get API key → `GROQ_API_KEY`

**Option B: OpenAI**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key → `OPENAI_API_KEY`

**For embeddings (required):**
- You need OpenAI API key for embeddings → `OPENAI_API_KEY`

### 5. Set Up Uploadthing

1. Go to [uploadthing.com](https://uploadthing.com)
2. Create a new app
3. Copy API keys:
   - Secret → `UPLOADTHING_SECRET`
   - App ID → `UPLOADTHING_APP_ID`

### 6. Set Up Stripe

1. Go to [stripe.com](https://dashboard.stripe.com)
2. Use test mode for development
3. Go to **API Keys**:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

4. Create a product:
   - Go to **Products** → **Add Product**
   - Name: "Pro Plan"
   - Price: $29/month recurring
   - Copy the price ID → `STRIPE_PRO_PRICE_ID`

5. Set up webhook (for production):
   - Go to **Developers** → **Webhooks** → **Add endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.*`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 7. Configure Environment Variables

Edit `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI (use both for full functionality)
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...

# Uploadthing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 8. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

## Testing the Application

### 1. Create an Account
- Go to `/sign-up`
- Create an account with email/password
- You'll be redirected to `/dashboard`

### 2. Upload an Invoice
- Drag & drop a PDF invoice or click to browse
- The system will:
  - Extract data using AI
  - Validate against rules
  - Generate an audit report
- View the report with confidence score and flags

### 3. Test Usage Limits
- Free plan: 5 audits per month
- Upload 6 invoices to trigger the limit
- See upgrade prompt

### 4. Test Pro Upgrade
- Go to `/billing`
- Click "Upgrade to Pro"
- Use Stripe test card: `4242 4242 4242 4242`
- Any future expiry date and CVC
- Complete checkout
- Your plan should upgrade to Pro

### 5. View Audit Details
- Click "View Report" on any audit
- See extracted data, line items chart, validation checks
- Download or print report

## Troubleshooting

### "User not found" error
- Check that Clerk webhook is set up and fired
- Or manually insert a user in Supabase:
```sql
INSERT INTO users (clerk_id, email, plan, usage_count)
VALUES ('your_clerk_user_id', 'your_email@example.com', 'free', 0);
```

### "Failed to extract text"
- Check GROQ_API_KEY or OPENAI_API_KEY is valid
- Check API quota/limits

### "Failed to upload file"
- Check UPLOADTHING_SECRET and UPLOADTHING_APP_ID
- Check file size < 10MB

### Stripe checkout not working
- Use test mode keys in development
- Check STRIPE_PRO_PRICE_ID is correct
- Webhook secret only needed in production

### Vector search not working
- Make sure pgvector extension is enabled
- Run the `match_documents` function SQL
- Check OpenAI embeddings API key

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add all environment variables
4. Deploy
5. Set up webhooks with production URLs
6. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL

### Docker

```bash
# Build
docker build -t invoice-auditor .

# Run
docker run -p 3000:3000 --env-file .env.local invoice-auditor

# Or use docker-compose
docker-compose up -d
```

### Railway

```bash
railway login
railway init
railway up
```

## API Testing

Use tools like Postman or curl:

```bash
# Get usage (requires auth)
curl -X GET http://localhost:3000/api/usage \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Process invoice
curl -X POST http://localhost:3000/api/audit \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "https://uploadthing.com/f/...",
    "fileName": "invoice.pdf",
    "fileType": "application/pdf"
  }'
```

## Cost Optimization

- Use Groq for LLM calls (free tier: 30 requests/min)
- OpenAI only for embeddings (~$0.002 per audit)
- Supabase free tier: 500MB database, 2GB bandwidth
- Uploadthing free tier: 2GB storage
- Vercel free tier: 100GB bandwidth

**Total cost for 1000 audits/month: ~$2-5**

## Next Steps

1. Customize the UI/branding
2. Add more validation rules
3. Implement ERP export (QuickBooks CSV)
4. Add batch upload for Pro users
5. Configure Row Level Security in Supabase
6. Set up monitoring (Vercel Analytics, Sentry)
7. Add email notifications
8. Create admin dashboard

## Support

For issues:
- Check this guide first
- Review README.md
- Check logs in Vercel/Railway dashboard
- Open a GitHub issue

Happy auditing! 🚀

