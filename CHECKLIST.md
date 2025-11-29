# Pre-Launch Checklist

Use this checklist before deploying to production.

## ☐ Development Setup

- [ ] Installed dependencies: `npm install --legacy-peer-deps`
- [ ] Created `.env.local` with all keys
- [ ] Ran database schema in Supabase
- [ ] Added `match_documents` function in Supabase
- [ ] Tested local development: `npm run dev`
- [ ] Uploaded test invoice successfully
- [ ] Verified audit report generated
- [ ] Tested Stripe checkout (test mode)

## ☐ Third-Party Services

### Supabase
- [ ] Project created
- [ ] pgvector extension enabled
- [ ] Schema deployed (all tables created)
- [ ] Vector search function added
- [ ] API keys copied to `.env.local`
- [ ] Test query executed successfully

### Clerk
- [ ] Application created
- [ ] Email/password enabled
- [ ] API keys configured
- [ ] Test signup completed
- [ ] Test login successful
- [ ] User appears in Supabase `users` table

### Groq/OpenAI
- [ ] Groq API key obtained (free)
- [ ] OpenAI API key obtained (for embeddings)
- [ ] API keys added to `.env.local`
- [ ] Test extraction successful
- [ ] Cost monitoring enabled

### Uploadthing
- [ ] App created
- [ ] API keys configured
- [ ] Test file upload successful
- [ ] File appears in Uploadthing dashboard
- [ ] 10MB limit configured

### Stripe
- [ ] Account created
- [ ] Test mode enabled
- [ ] Product "Pro Plan" created ($29/month)
- [ ] Price ID copied
- [ ] Test checkout successful
- [ ] Test card payment processed

## ☐ Features Testing

### Authentication
- [ ] Sign up with email works
- [ ] Sign in with email works
- [ ] Sign out works
- [ ] Protected routes redirect to login
- [ ] User session persists

### Invoice Upload
- [ ] PDF upload works
- [ ] Image upload works
- [ ] File size validation (max 10MB)
- [ ] File type validation
- [ ] Progress indicator shows
- [ ] Error handling for invalid files

### AI Extraction
- [ ] PDF text extracted correctly
- [ ] Image OCR works (if testing image)
- [ ] Vendor name extracted
- [ ] Invoice date extracted
- [ ] Total amount extracted
- [ ] Line items extracted
- [ ] Processing completes in < 15 seconds

### Validation
- [ ] Confidence score displayed
- [ ] Flags generated for issues
- [ ] Duplicate detection works
- [ ] Fraud checks execute
- [ ] PO matching works (if PO exists)

### Reports
- [ ] Audit detail page loads
- [ ] Extracted data displayed
- [ ] Line items table shows
- [ ] Chart renders correctly
- [ ] Flags displayed with severity
- [ ] Download/print works
- [ ] View invoice link works

### Usage & Billing
- [ ] Free plan usage meter shows
- [ ] Usage count increments after audit
- [ ] Limit reached message shows (after 5 audits)
- [ ] Upgrade button works
- [ ] Stripe checkout opens
- [ ] Payment success upgrades plan
- [ ] Pro users see "Unlimited"

## ☐ Production Deployment

### Pre-Deployment
- [ ] Code committed to Git
- [ ] Pushed to GitHub/GitLab
- [ ] `.env.local` NOT committed (in .gitignore)
- [ ] README updated with your info

### Deployment Platform (choose one)

#### Vercel (Recommended)
- [ ] Repository imported
- [ ] Environment variables added
- [ ] Build settings configured: `npm run build`
- [ ] Install command: `npm install --legacy-peer-deps`
- [ ] Deployed successfully
- [ ] Production URL obtained

#### Railway
- [ ] Project initialized
- [ ] Environment variables set
- [ ] Deployed with `railway up`
- [ ] Domain configured

#### Docker
- [ ] Docker image built
- [ ] docker-compose configured
- [ ] Environment variables in compose file
- [ ] Containers running
- [ ] Reverse proxy configured (nginx)
- [ ] SSL certificate installed

### Post-Deployment
- [ ] Production URL accessible
- [ ] Landing page loads
- [ ] Sign up works in production
- [ ] Invoice upload works in production
- [ ] Audit completes successfully
- [ ] Stripe checkout works (switch to live mode)

## ☐ Webhooks Configuration

### Clerk Webhook
- [ ] Added endpoint: `https://your-domain.com/api/webhooks/clerk`
- [ ] Selected events: `user.created`, `user.updated`, `user.deleted`
- [ ] Signing secret copied to env vars
- [ ] Tested user creation
- [ ] User appears in Supabase

### Stripe Webhook
- [ ] Added endpoint: `https://your-domain.com/api/webhooks/stripe`
- [ ] Selected events: `checkout.session.completed`, `customer.subscription.*`
- [ ] Signing secret copied to env vars
- [ ] Tested payment
- [ ] Plan upgraded in database

## ☐ Production Configuration

### Environment Variables
- [ ] All keys updated to production values
- [ ] Clerk keys (production)
- [ ] Stripe keys (live mode)
- [ ] NEXT_PUBLIC_APP_URL set to production URL
- [ ] Webhook secrets configured

### Stripe Live Mode
- [ ] Switched to live mode
- [ ] Created live product
- [ ] Updated price ID
- [ ] Tested real payment (then refunded)

### Security
- [ ] HTTPS enabled
- [ ] Webhook signatures verified
- [ ] API routes protected
- [ ] Environment variables secure
- [ ] No secrets in code

## ☐ Monitoring & Analytics

- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking setup (Sentry - optional)
- [ ] Database monitoring (Supabase dashboard)
- [ ] Usage tracking works
- [ ] Stripe dashboard monitoring

## ☐ Documentation

- [ ] README updated with your branding
- [ ] Setup guide verified
- [ ] Deployment guide followed
- [ ] API documentation (if needed)
- [ ] User guide created (optional)

## ☐ Marketing & Launch

- [ ] Custom domain configured (optional)
- [ ] Logo/branding updated
- [ ] Landing page copy customized
- [ ] Pricing finalized
- [ ] Terms of Service added (optional)
- [ ] Privacy Policy added (optional)
- [ ] Support email configured

## ☐ User Testing

- [ ] Invited 5-10 beta users
- [ ] Collected feedback
- [ ] Fixed critical bugs
- [ ] Improved UX based on feedback
- [ ] Monitored first 50 audits

## ☐ Performance

- [ ] Page load time < 3 seconds
- [ ] Audit processing < 15 seconds
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No broken images/links

## ☐ Cost Monitoring

- [ ] Groq API usage tracked
- [ ] OpenAI costs monitored
- [ ] Supabase storage checked
- [ ] Uploadthing quota tracked
- [ ] Vercel bandwidth monitored

---

## Launch Day! 🚀

- [ ] Announced on social media
- [ ] Posted on Product Hunt (optional)
- [ ] Sent to beta users
- [ ] Monitoring dashboard open
- [ ] Ready to support users
- [ ] Champagne opened 🍾

---

**Congratulations! You're ready to launch!** 🎉

Remember:
- Start with test mode
- Monitor costs closely
- Respond to users quickly
- Iterate based on feedback
- Scale gradually

**Good luck with your SaaS! 🚀**

