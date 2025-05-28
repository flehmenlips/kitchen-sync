# Domain Migration Checklist for kitchensync.restaurant

## ✅ Completed Steps

### 1. DNS Configuration
- [x] Added `api` CNAME record → `kitchen-sync-app.onrender.com`
- [x] Added `@` A record → `76.76.21.21`
- [x] Added `www` CNAME record → `kitchen-sync-app.onrender.com`

### 2. Render Configuration
- [x] Added `api.kitchensync.restaurant` to backend service
- [x] Added `kitchensync.restaurant` to frontend service
- [x] Added `www.kitchensync.restaurant` to frontend service
- [x] All domains verified and SSL certificates issued

### 3. Code Updates
- [x] Updated backend CORS to include new domains
- [x] Updated frontend API URL to use `api.kitchensync.restaurant`

## 🔄 Next Steps

### 1. Deploy Code Changes
```bash
# Commit and push the changes
git add backend/src/server.ts frontend/src/services/apiService.ts
git commit -m "feat: Update domains to kitchensync.restaurant"
git push origin main
```

### 2. Update Environment Variables in Render

#### Backend Service:
Add/Update these environment variables:
```
FRONTEND_URL=https://kitchensync.restaurant
API_URL=https://api.kitchensync.restaurant
```

#### Frontend Service:
Add/Update these environment variables:
```
VITE_API_URL=https://api.kitchensync.restaurant
VITE_APP_URL=https://kitchensync.restaurant
```

### 3. Update External Services

#### Stripe:
1. Go to https://dashboard.stripe.com/webhooks
2. Add NEW webhook endpoint: `https://api.kitchensync.restaurant/api/platform/webhooks/stripe`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the signing secret
5. Add to Render backend: `STRIPE_WEBHOOK_SECRET_NEW=whsec_...`
6. Keep BOTH webhooks active during transition

#### SendGrid:
1. Add domain authentication for `kitchensync.restaurant`
2. Update sender email addresses
3. Add DNS records provided by SendGrid

### 4. Testing Checklist

After deployment completes (5-10 minutes):

- [ ] Frontend loads at https://kitchensync.restaurant
- [ ] Frontend loads at https://www.kitchensync.restaurant
- [ ] API responds at https://api.kitchensync.restaurant
- [ ] Login/authentication works
- [ ] Stripe checkout works
- [ ] Email sending works
- [ ] No CORS errors in console
- [ ] Customer portal works

### 5. Post-Migration Tasks

- [ ] Update README files with new domain
- [ ] Update any documentation
- [ ] Monitor logs for 24-48 hours
- [ ] Update Google OAuth redirect URLs (if applicable)
- [ ] Update any mobile app configurations

### 6. Clean Up (After 1 Week)

Once everything is stable:
- [ ] Remove old domain from CORS allowed origins
- [ ] Remove old Stripe webhook
- [ ] Update any remaining references to old domain
- [ ] Consider setting up redirects from old domain

## 🚨 Rollback Plan

If issues occur:
1. Revert environment variables in Render
2. Revert code changes: `git revert HEAD`
3. Push to trigger redeploy
4. Domains will continue working with old configuration 