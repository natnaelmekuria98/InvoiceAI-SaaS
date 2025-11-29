# 🔑 API Keys Collection Template

Use this as a worksheet while setting up your services. Copy the keys directly into `.env.local`.

---

## 1. Supabase (Database)

🔗 [https://supabase.com](https://supabase.com)

**Steps:**
1. Create new project → Wait 2 minutes for setup
2. Go to Settings → API

**Keys Needed:**
```
Project URL: https://__________________.supabase.co
Anon/Public Key: eyJ____________________________________
Service Role Key: eyJ____________________________________
```

**Action:** Run SQL from `lib/supabase/schema.sql` in SQL Editor

---

## 2. Clerk (Authentication)

🔗 [https://clerk.com](https://clerk.com)

**Steps:**
1. Create Application → Choose "Email" + "Password"
2. Go to API Keys

**Keys Needed:**
```
Publishable Key: pk_test_____________________________
Secret Key: sk_test_____________________________
```

**For Production Webhooks (later):**
```
Webhook Signing Secret: whsec_____________________________
```

---

## 3. Groq (AI - FREE Tier!)

🔗 [https://console.groq.com](https://console.groq.com)

**Steps:**
1. Sign up (free)
2. Go to API Keys → Create Key

**Keys Needed:**
```
API Key: gsk_____________________________
```

**Free Tier:** 30 requests/minute (plenty for MVP!)

---

## 4. OpenAI (Embeddings & Vision)

🔗 [https://platform.openai.com](https://platform.openai.com)

**Steps:**
1. Create account → Add payment method ($5 credit free)
2. Go to API Keys → Create Key

**Keys Needed:**
```
API Key: sk-_____________________________
```

**Cost:** ~$0.002 per audit (embeddings)

---

## 5. Uploadthing (File Upload)

🔗 [https://uploadthing.com](https://uploadthing.com)

**Steps:**
1. Sign up → Create new app
2. Copy keys from dashboard

**Keys Needed:**
```
Secret: sk_live_____________________________
App ID: _____________________________
```

**Free Tier:** 2GB storage

---

## 6. Stripe (Payments)

🔗 [https://dashboard.stripe.com](https://dashboard.stripe.com)

**Steps:**
1. Create account → Use **Test Mode** for development
2. Go to Developers → API Keys

**Keys Needed (Test Mode):**
```
Publishable Key: pk_test_____________________________
Secret Key: sk_test_____________________________
```

**Create Product:**
1. Products → Add Product
2. Name: "Pro Plan"
3. Price: $29.00 USD / month (recurring)
4. Copy Price ID:
```
Price ID: price_____________________________
```

**For Production Webhooks (later):**
```
Webhook Signing Secret: whsec_____________________________
```

**Test Card:** 4242 4242 4242 4242 (any future expiry, any CVC)

---

## ✅ Checklist

Before running the app:

- [ ] All 6 services created
- [ ] All keys copied
- [ ] Keys pasted into `.env.local`
- [ ] Supabase SQL schema executed
- [ ] Supabase vector function added
- [ ] Stripe product created
- [ ] Ready to run `npm run dev`!

---

## 📝 Your `.env.local` File

Once you have all keys, your `.env.local` should look like:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key
CLERK_SECRET_KEY=sk_test_your_actual_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJyour_actual_key
SUPABASE_SERVICE_ROLE_KEY=eyJyour_actual_key

# AI
GROQ_API_KEY=gsk_your_actual_key
OPENAI_API_KEY=sk-your_actual_key

# Uploadthing
UPLOADTHING_SECRET=sk_live_your_actual_key
UPLOADTHING_APP_ID=your_app_id

# Stripe
STRIPE_SECRET_KEY=sk_test_your_actual_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
STRIPE_PRO_PRICE_ID=price_your_actual_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚨 Important Notes

### Test vs Production

**Development:**
- Use Stripe **test mode** keys
- Use test credit card: 4242 4242 4242 4242
- Webhooks not required initially

**Production:**
- Switch Stripe to **live mode**
- Get production keys from all services
- Set up webhooks (CHECKLIST.md has steps)
- Update `NEXT_PUBLIC_APP_URL` to your domain

### Security

- ✅ Never commit `.env.local` (it's in .gitignore)
- ✅ Use different keys for dev/prod
- ✅ Rotate keys if exposed
- ✅ Use environment variables in CI/CD

### Free Tiers

All services have generous free tiers:
- **Groq:** 30 req/min (free forever!)
- **Supabase:** 500MB DB, 2GB bandwidth
- **Uploadthing:** 2GB storage
- **Clerk:** 10K MAU
- **OpenAI:** $5 credit (covers ~2500 audits)
- **Vercel:** 100GB bandwidth

**You can run this for months on free tiers!**

---

## ⏱️ Time Estimate

Setting up all 6 services: **15-20 minutes**

| Service | Time |
|---------|------|
| Supabase | 5 min |
| Clerk | 2 min |
| Groq | 1 min |
| OpenAI | 2 min |
| Uploadthing | 2 min |
| Stripe | 5 min |

**Total:** ~20 minutes, then you're ready to launch! 🚀

---

## 🆘 Troubleshooting

**Can't find keys?**
- Supabase: Settings → API
- Clerk: Configure → API Keys
- Groq: Console → API Keys
- OpenAI: Settings → API Keys
- Uploadthing: Dashboard (visible immediately)
- Stripe: Developers → API Keys

**Keys not working?**
- Check for extra spaces when copying
- Verify you're using the correct environment (test vs live)
- Make sure keys are enabled/active
- Check API quotas/limits

---

## ✨ Next Steps

1. Fill in this template with your keys
2. Copy to `.env.local`
3. Run database schema in Supabase
4. Execute `npm run dev`
5. Open http://localhost:3000
6. Sign up and test! 🎉

---

**Need detailed setup instructions?** → Read **QUICK_START.md**

**Ready to deploy?** → Read **DEPLOYMENT.md**

**Want to understand the architecture?** → Read **PROJECT_SUMMARY.md**

---

**Pro Tip:** Bookmark the dashboards for each service. You'll be checking them often! 📊

