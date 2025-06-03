# Render Subdomain Quick Setup Checklist

## 🚀 Quick Steps for Render

### 1. In Render Dashboard
- [ ] Go to your service → Settings → Custom Domains
- [ ] Add `kitchensync.restaurant`
- [ ] Add `*.kitchensync.restaurant` (wildcard)
- [ ] Copy the IP addresses or CNAME provided

### 2. In Your DNS Provider (e.g., Cloudflare, GoDaddy)
- [ ] Add A record: `kitchensync.restaurant` → `[Render IP]`
- [ ] Add A record: `*.kitchensync.restaurant` → `[Same Render IP]`
- [ ] Or use CNAME if Render provides one

### 3. Database Updates (Run on Production DB)
```sql
-- Check restaurants have slugs
SELECT id, name, slug FROM restaurants;

-- Update missing slugs (example)
UPDATE restaurants SET slug = 'coqauvin' WHERE id = 2 AND slug IS NULL;

-- Enable website builder
UPDATE restaurants SET website_builder_enabled = true WHERE is_active = true;
```

### 4. Deploy Code Updates
- [ ] Commit and push the CORS updates in `backend/src/server.ts`
- [ ] Render will auto-deploy from your GitHub repo

### 5. Wait & Test
- [ ] Wait 10-15 minutes for SSL certificates
- [ ] Test main app: https://kitchensync.restaurant
- [ ] Test subdomain: https://coqauvin.kitchensync.restaurant

## 🔍 Verify It's Working

```bash
# Test with curl
curl -I https://coqauvin.kitchensync.restaurant

# Should see HTTP/2 200 and no SSL errors
```

## ⚠️ Common Issues

### "Safari Can't Connect"
- DNS not propagated yet (wait 5-30 min)
- SSL certificate still provisioning
- Check Render logs for errors

### CORS Errors
- Make sure you deployed the updated `server.ts`
- Check browser console for exact error

### Wrong Restaurant Loading
- Verify slug in database matches subdomain
- Check `restaurant_settings` table has entry

## 📱 Mobile Testing
Test on actual devices using the full subdomain URLs - localhost testing won't work for subdomains on mobile. 