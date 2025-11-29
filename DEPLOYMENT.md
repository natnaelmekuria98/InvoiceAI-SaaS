# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- All third-party services configured (Clerk, Supabase, etc.)

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/invoice-auditor.git
git push -u origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Configure build settings:
  - Framework Preset: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install --legacy-peer-deps`

3. **Add Environment Variables**
In Vercel dashboard, add all variables from `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GROQ_API_KEY=...
OPENAI_API_KEY=...
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRO_PRICE_ID=...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

4. **Deploy**
- Click "Deploy"
- Wait for build (~2-3 minutes)
- Get your production URL

5. **Configure Webhooks**

**Clerk Webhook:**
- Go to Clerk Dashboard → Webhooks
- Add endpoint: `https://your-app.vercel.app/api/webhooks/clerk`
- Select events: `user.created`, `user.updated`, `user.deleted`
- Copy signing secret and update `CLERK_WEBHOOK_SECRET` in Vercel

**Stripe Webhook:**
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
- Select events: `checkout.session.completed`, `customer.subscription.*`
- Copy signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

6. **Test Production**
- Visit your Vercel URL
- Sign up for an account
- Upload a test invoice
- Verify audit works

## Railway Deployment

### Prerequisites
- Railway account
- Railway CLI installed: `npm install -g railway`

### Steps

```bash
# Login
railway login

# Initialize project
railway init

# Link to project
railway link

# Add environment variables
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# ... add all other variables

# Deploy
railway up

# Get URL
railway open
```

## Docker Deployment

### Local Docker

```bash
# Build image
docker build -t invoice-auditor .

# Run container
docker run -p 3000:3000 \
  --env-file .env.local \
  invoice-auditor
```

### Docker Compose

```bash
# Start all services (app + postgres)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker on VPS (DigitalOcean, AWS, etc.)

```bash
# SSH into server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose

# Clone repository
git clone https://github.com/yourusername/invoice-auditor.git
cd invoice-auditor

# Create .env.local with production values
nano .env.local

# Start services
docker-compose up -d

# Set up nginx reverse proxy (optional)
apt install nginx
nano /etc/nginx/sites-available/invoice-auditor

# Add nginx config:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site and restart nginx
ln -s /etc/nginx/sites-available/invoice-auditor /etc/nginx/sites-enabled/
systemctl restart nginx

# Set up SSL with Let's Encrypt
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

## Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Webhooks configured with production URLs
- [ ] Test user signup/login
- [ ] Test invoice upload and audit
- [ ] Test Stripe checkout (use test card in test mode)
- [ ] Monitor error logs in Vercel/Railway dashboard
- [ ] Set up custom domain (optional)
- [ ] Configure CORS if needed
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up error monitoring (Sentry, LogRocket)

## Monitoring & Maintenance

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Monitoring (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Logging
- Vercel: Built-in logging in dashboard
- Railway: `railway logs`
- Docker: `docker-compose logs -f app`

## Scaling Considerations

### Database
- Upgrade Supabase plan if needed
- Enable connection pooling
- Add database indexes
- Consider read replicas for heavy loads

### AI API Limits
- Monitor Groq/OpenAI usage
- Implement rate limiting
- Add retry logic
- Consider caching extracted data

### File Storage
- Upgrade Uploadthing plan
- Consider CDN for file delivery
- Implement file cleanup for old audits

### Compute
- Vercel Pro for better performance
- Railway Pro for more resources
- Add more Docker replicas
- Use load balancer for multiple instances

## Backup Strategy

### Database Backups
- Supabase: Automatic daily backups (paid plans)
- Manual: Use `pg_dump` for exports
- Store backups in S3 or similar

### Code Backups
- GitHub repository
- Multiple branches for staging/production
- Tag releases

## Rollback Plan

### Vercel
- Click "Rollback" on previous deployment
- Or redeploy specific commit

### Railway
```bash
railway up --service [service-id]
```

### Docker
```bash
docker-compose down
git checkout previous-commit
docker-compose up -d
```

## Common Issues

### "Webhook verification failed"
- Check webhook secrets are correct
- Verify webhook URL is accessible
- Check request logs in third-party dashboards

### "Database connection failed"
- Verify Supabase credentials
- Check IP allowlist in Supabase
- Ensure service role key is used for server actions

### "File upload fails"
- Check Uploadthing keys
- Verify file size limits
- Check CORS configuration

### "AI extraction timeout"
- Increase Vercel function timeout (60s max on hobby)
- Consider background job processing
- Split into smaller chunks

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

**Ready to deploy? Follow the Vercel steps above for the easiest deployment! 🚀**

