# KitchenSync Custom Domain Setup: kitchensync.restaurant

## Overview
This guide will walk you through setting up `kitchensync.restaurant` as your custom domain on Render.

## Phase 1: DNS Configuration

### Step 1: Add Custom Domain in Render
1. Go to https://dashboard.render.com
2. Select your **Backend Service** (kitchen-sync-app)
3. Click on "Settings" tab
4. Scroll to "Custom Domains"
5. Click "Add Custom Domain"
6. Enter: `api.kitchensync.restaurant`
7. Click "Save"

### Step 2: Configure DNS Records
Add these DNS records at your domain registrar:

#### For Backend API:
```
Type: CNAME
Name: api
Value: kitchen-sync-app.onrender.com
TTL: 300 (or lowest available)
```

#### For Frontend (if using static site):
```
Type: CNAME
Name: www
Value: kitchen-sync-frontend.onrender.com (or your frontend service URL)
TTL: 300
```

#### For Root Domain:
```
Type: A
Name: @ (or blank)
Value: 76.76.21.21 (Render's IP)
TTL: 300
```

### Step 3: SSL Certificate
- Render automatically provisions SSL certificates via Let's Encrypt
- This usually takes 10-30 minutes after DNS propagation

## Phase 2: Code Updates

### Backend Updates Needed:

#### 1. Update CORS Settings
File: `backend/src/server.ts`
```typescript
const corsOptions = {
  origin: [
    'https://kitchensync.restaurant',
    'https://www.kitchensync.restaurant',
    'https://api.kitchensync.restaurant',
    'http://localhost:5173',
    'http://localhost:5174',
    // Keep old domain during transition
    'https://kitchen-sync-app.onrender.com'
  ],
  credentials: true
};
```

#### 2. Update Environment Variables in Render
Add/Update these in your backend service:
```
FRONTEND_URL=https://kitchensync.restaurant
API_URL=https://api.kitchensync.restaurant
```

#### 3. Update Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Update endpoint URL to: `https://api.kitchensync.restaurant/api/platform/webhooks/stripe`
3. Copy new webhook signing secret
4. Update `STRIPE_WEBHOOK_SECRET` in Render

### Frontend Updates Needed:

#### 1. Update API Base URL
File: `frontend/src/services/apiService.ts`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.kitchensync.restaurant';
```

#### 2. Update Environment Variables
File: `frontend/.env.production`
```
VITE_API_URL=https://api.kitchensync.restaurant
VITE_APP_URL=https://kitchensync.restaurant
```

## Phase 3: External Service Updates

### 1. SendGrid
- Add `kitchensync.restaurant` as verified sender domain
- Update email templates with new domain
- Configure SPF, DKIM, and DMARC records

### 2. Cloudinary (if using)
- Add `kitchensync.restaurant` to allowed domains
- Update CORS settings

### 3. Google OAuth (if using)
- Add new redirect URIs:
  - `https://kitchensync.restaurant/auth/callback`
  - `https://api.kitchensync.restaurant/auth/google/callback`

## Phase 4: Testing Checklist

### Pre-Launch Testing:
- [ ] DNS records are propagated (check with `dig api.kitchensync.restaurant`)
- [ ] SSL certificates are active (green padlock)
- [ ] API responds at new domain
- [ ] Frontend loads at new domain
- [ ] CORS is working (no console errors)
- [ ] Authentication works
- [ ] Stripe checkout works
- [ ] Email sending works

### Post-Launch Testing:
- [ ] All API endpoints work
- [ ] File uploads work (if applicable)
- [ ] Webhooks are received
- [ ] Customer portal accessible
- [ ] Mobile responsive
- [ ] SEO meta tags updated

## Phase 5: Migration Strategy

### Recommended Approach:
1. **Set up new domain alongside old one** (both work)
2. **Test thoroughly** for 24-48 hours
3. **Update all references** in code
4. **Notify users** of domain change
5. **Set up redirects** from old to new domain
6. **Monitor for issues** for 1 week
7. **Deprecate old domain** after 30 days

### Redirect Setup (Optional):
Add to old backend service:
```javascript
// Redirect old domain to new
if (req.hostname === 'kitchen-sync-app.onrender.com') {
  return res.redirect(301, `https://api.kitchensync.restaurant${req.originalUrl}`);
}
```

## Common Issues & Solutions

### DNS Not Propagating:
- Use https://dnschecker.org to verify
- Clear DNS cache: `sudo dscacheutil -flushcache` (Mac)
- Wait up to 48 hours for full propagation

### SSL Certificate Errors:
- Ensure DNS is fully propagated first
- Check Render dashboard for certificate status
- Contact Render support if stuck

### CORS Errors:
- Double-check all domain variations are included
- Ensure credentials: true is set
- Check browser console for specific errors

### Stripe Webhooks Failing:
- Update webhook endpoint in Stripe
- Get new signing secret
- Test with Stripe CLI locally first

## Final Steps

1. **Update all documentation** with new domain
2. **Update README.md** files
3. **Update any hardcoded URLs** in the codebase
4. **Set up domain monitoring** (uptime, SSL expiry)
5. **Create DNS backup** documentation

## Support Contacts
- Render Support: https://render.com/support
- Domain Registrar Support: (varies)
- Stripe Support: https://support.stripe.com 