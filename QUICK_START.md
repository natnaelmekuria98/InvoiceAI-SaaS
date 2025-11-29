# 🚀 Quick Start - InvoiceAI

Get up and running in **5 minutes**!

## Step 1: Install Dependencies (1 min)

```bash
cd invoice-auditor
npm install --legacy-peer-deps
```

## Step 2: Set Up Services (3 min)

### Supabase (Database)
1. Go to [supabase.com](https://supabase.com) → Create project
2. Copy: URL, anon key, service role key
3. Go to SQL Editor → Run `lib/supabase/schema.sql`

### Clerk (Auth)
1. Go to [clerk.com](https://clerk.com) → Create app
2. Choose Email + Password
3. Copy: Publishable key, Secret key

### Groq (AI - Free!)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up → Get API key

### OpenAI (Embeddings)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key

### Uploadthing (File Upload)
1. Go to [uploadthing.com](https://uploadthing.com)
2. Create app → Copy Secret & App ID

### Stripe (Payments)
1. Go to [stripe.com](https://dashboard.stripe.com)
2. Use **test mode**
3. Copy: Publishable key, Secret key
4. Create product ($29/month) → Copy price ID

## Step 3: Configure Environment (1 min)

Edit `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...

# Uploadthing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Run! (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Step 5: Test (1 min)

1. Click "Get Started"
2. Sign up with email
3. Upload a test invoice PDF
4. See the audit report!

---

## Test Credit Card (Stripe)

```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

---

## Need Help?

- 📖 Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
- 📚 Check [README.md](./README.md) for full documentation
- 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- 📊 Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture

---

**That's it! You're ready to audit invoices with AI! 🎯**

