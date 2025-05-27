# KitchenSync Deployment Guide

## Prerequisites

1. **Stripe Account**
   - Sign up at https://stripe.com
   - Get your API keys from the Stripe Dashboard
   - Set up webhook endpoints
   - Create subscription products and prices

2. **SendGrid Account** (for email)
   - Sign up at https://sendgrid.com
   - Verify your sender domain
   - Get your API key

3. **Production Database**
   - PostgreSQL 14+ recommended
   - Ensure SSL is enabled
   - Have connection string ready

4. **Hosting Services**
   - Backend: Render, Railway, or Heroku
   - Frontend: Vercel, Netlify, or Render
   - Database: Render PostgreSQL, Supabase, or Neon

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/kitchensync?schema=public&sslmode=require"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="<generate-secret>"
JWT_REFRESH_SECRET="<generate-secret>"
CUSTOMER_JWT_SECRET="<generate-secret>"
CUSTOMER_JWT_REFRESH_SECRET="<generate-secret>"
PLATFORM_JWT_SECRET="<generate-secret>"

# Frontend URLs
FRONTEND_URL="https://your-app.com"
CUSTOMER_PORTAL_URL="https://your-app.com/customer"

# Email Service
SENDGRID_API_KEY="SG.your-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="KitchenSync"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_live_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
STRIPE_PRICE_STARTER="price_starter_id"
STRIPE_PRICE_PROFESSIONAL="price_professional_id"
STRIPE_PRICE_ENTERPRISE="price_enterprise_id"

# Server Configuration
PORT=3001
NODE_ENV=production

# Platform Settings
PLATFORM_NAME="KitchenSync"
PLATFORM_URL="https://your-platform.com"
SUPPORT_EMAIL="support@yourdomain.com"
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-api.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
```

## Stripe Setup

### 1. Create Products and Prices

In your Stripe Dashboard:

1. Go to Products → Create Product
2. Create three products:
   - **Starter Plan** ($49/month)
     - Name: KitchenSync Starter
     - Description: Perfect for small restaurants
     - Features: Up to 5 staff members, basic features
   - **Professional Plan** ($149/month)
     - Name: KitchenSync Professional
     - Description: For growing restaurants
     - Features: Up to 20 staff members, all features
   - **Enterprise Plan** (Custom pricing)
     - Name: KitchenSync Enterprise
     - Description: For restaurant chains
     - Features: Unlimited staff, custom features

3. For each product, create a monthly price
4. Note down the price IDs (price_xxxxx)

### 2. Set Up Webhooks

1. Go to Developers → Webhooks
2. Add endpoint:
   - URL: `https://your-api.com/api/webhooks/stripe`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.trial_will_end`
3. Note down the webhook signing secret

### 3. Configure Customer Portal

1. Go to Settings → Billing → Customer portal
2. Configure:
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Allow customers to update billing address
3. Note down the configuration ID

## Database Migrations

### Production Migration

1. **Backup your database first!**
   ```bash
   pg_dump $PRODUCTION_DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Run migrations**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. **Seed platform admin (if needed)**
   ```bash
   npx prisma db seed
   ```

## Deployment Steps

### 1. Deploy Backend (Render)

1. **Create New Web Service**
   - Connect GitHub repository
   - Branch: main
   - Root Directory: backend
   - Build Command: `npm install && npm run build && npx prisma migrate deploy`
   - Start Command: `npm run start`

2. **Add Environment Variables**
   - Add all backend environment variables
   - Ensure DATABASE_URL is set

3. **Set Up Health Check**
   - Path: `/health`
   - Expected status: 200

### 2. Deploy Frontend (Vercel)

1. **Import Project**
   - Connect GitHub repository
   - Framework: Vite
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Add Environment Variables**
   - Add frontend environment variables
   - Deploy

### 3. Post-Deployment

1. **Verify Stripe Webhook**
   - Send test webhook from Stripe Dashboard
   - Check logs for successful processing

2. **Create Platform Admin**
   ```sql
   INSERT INTO platform_admins (email, password, name, role)
   VALUES ('admin@yourdomain.com', '$2b$10$...', 'Admin Name', 'SUPER_ADMIN');
   ```

3. **Test Critical Flows**
   - Restaurant registration
   - Subscription creation
   - Customer portal access
   - Platform admin login

## Security Checklist

- [ ] All secrets are strong and unique
- [ ] Database has SSL enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] File upload restrictions are in place
- [ ] XSS protection headers are set
- [ ] HTTPS is enforced

## Monitoring

1. **Set Up Error Tracking**
   - Sentry or similar service
   - Add DSN to environment variables

2. **Set Up Logging**
   - Use a service like LogDNA or Papertrail
   - Monitor for errors and warnings

3. **Set Up Uptime Monitoring**
   - Use services like UptimeRobot or Pingdom
   - Monitor both frontend and backend

## Troubleshooting

### Common Issues

1. **Stripe Webhooks Failing**
   - Check webhook signing secret
   - Verify endpoint URL
   - Check for raw body parsing

2. **Database Connection Issues**
   - Verify SSL mode
   - Check connection pool settings
   - Ensure database is accessible

3. **CORS Errors**
   - Verify FRONTEND_URL is correct
   - Check allowed origins in backend

### Support

For deployment support, contact: support@kitchensync.io 