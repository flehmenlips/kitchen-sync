# KitchenSync Domain Migration Action Plan

## Current Status
- Domain purchased: `kitchensync.restaurant` ✅
- Current production URL: `kitchen-sync-app.onrender.com`
- Stripe integration: Working ✅

## Phase 1: Immediate Actions (Do Now)

### 1. Set Up DNS Records at Your Domain Registrar
Add these DNS records:

```
Type: CNAME
Name: api
Value: kitchen-sync-app.onrender.com
TTL: 300

Type: A
Name: @ (or blank for root)
Value: 76.76.21.21
TTL: 300

Type: CNAME
Name: www
Value: kitchen-sync-app.onrender.com
TTL: 300
```

### 2. Add Custom Domain in Render
1. Go to https://dashboard.render.com
2. Click on your backend service (kitchen-sync-app)
3. Go to Settings → Custom Domains
4. Add: `api.kitchensync.restaurant`
5. Add: `kitchensync.restaurant`
6. Add: `www.kitchensync.restaurant`

## Phase 2: Code Updates (After DNS Propagates)

### 1. Update Backend CORS (backend/src/server.ts)
```typescript
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://kitchen-sync-app.onrender.com',
    'https://kitchensync.app',
    // Add new domains
    'https://kitchensync.restaurant',
    'https://www.kitchensync.restaurant',
    'https://api.kitchensync.restaurant'
];
```

### 2. Update Frontend API URL (frontend/src/services/apiService.ts)
```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://api.kitchensync.restaurant/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');
```

### 3. Update Environment Variables in Render
Backend service:
```
FRONTEND_URL=https://kitchensync.restaurant
API_URL=https://api.kitchensync.restaurant
```

## Phase 3: External Services

### 1. Stripe (Critical)
1. Go to https://dashboard.stripe.com/webhooks
2. Add NEW webhook endpoint: `https://api.kitchensync.restaurant/api/platform/webhooks/stripe`
3. Select same events as before
4. Copy new webhook signing secret
5. Add to Render: `STRIPE_WEBHOOK_SECRET_NEW=whsec_...`
6. Keep BOTH webhooks active during transition

### 2. SendGrid
1. Add sender domain verification for `kitchensync.restaurant`
2. Add these DNS records (from SendGrid):
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)

## Phase 4: Testing Checklist

### DNS Verification (Wait 30 mins - 2 hours)
```bash
# Check DNS propagation
dig api.kitchensync.restaurant
dig kitchensync.restaurant

# Check SSL certificate
curl -I https://api.kitchensync.restaurant
```

### Functionality Testing
- [ ] Main site loads at https://kitchensync.restaurant
- [ ] API responds at https://api.kitchensync.restaurant
- [ ] Login works
- [ ] Stripe checkout works
- [ ] Email sending works

## Phase 5: Final Migration

### 1. Update All References
- README files
- Documentation
- Email templates
- Any marketing materials

### 2. Set Up Redirects (Optional)
Add to Render environment variables:
```
REDIRECT_TO_NEW_DOMAIN=true
NEW_DOMAIN=https://kitchensync.restaurant
```

### 3. Monitor for 48 Hours
- Check Render logs for errors
- Monitor Stripe webhooks
- Check email delivery

## Timeline
- **Day 1**: DNS setup + Render configuration
- **Day 2**: Code updates + testing
- **Day 3**: External services + full testing
- **Day 4-7**: Monitor and fix issues
- **Week 2**: Consider deprecating old domain

## Rollback Plan
If issues occur:
1. Remove custom domain from Render
2. Revert code changes
3. Update Stripe webhook back to old URL
4. DNS changes will auto-revert when removed 