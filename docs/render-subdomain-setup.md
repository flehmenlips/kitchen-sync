# Render Subdomain Setup Guide

## Prerequisites
- Render account with deployed KitchenSync app
- Access to DNS management for your domain
- Restaurant records with proper slugs in database

## Step 1: Add Custom Domains in Render

### For the Main App
1. Go to your Render service dashboard
2. Navigate to "Settings" → "Custom Domains"
3. Add your main domain:
   ```
   kitchensync.restaurant
   ```

### For Wildcard Subdomains
4. Add a wildcard domain:
   ```
   *.kitchensync.restaurant
   ```

## Step 2: Configure DNS

Add these DNS records to your domain provider:

```
# Main domain
A     kitchensync.restaurant    → [Render IP from dashboard]
AAAA  kitchensync.restaurant    → [Render IPv6 from dashboard]

# Wildcard for all subdomains
A     *.kitchensync.restaurant  → [Same Render IP]
AAAA  *.kitchensync.restaurant  → [Same Render IPv6]

# Or use CNAME if Render provides one
CNAME *.kitchensync.restaurant  → [your-app].onrender.com
```

## Step 3: SSL Certificate

Render automatically provisions SSL certificates for custom domains:
- Single certificate for main domain
- Wildcard certificate for `*.kitchensync.restaurant`

Wait 10-15 minutes for SSL provisioning after adding domains.

## Step 4: Environment Variables

Ensure these are set in Render:

```bash
NODE_ENV=production
DATABASE_URL=[your-production-db-url]
JWT_SECRET=[your-secret]
FRONTEND_URL=https://kitchensync.restaurant
# Add any other required env vars
```

## Step 5: Update Application Code

### Backend Updates

1. Ensure CORS allows subdomain origins:

```typescript
// backend/src/server.ts
const corsOptions = {
  origin: function (origin: string | undefined, callback: any) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow any subdomain of kitchensync.restaurant
    const allowedPattern = /^https:\/\/([a-z0-9-]+\.)?kitchensync\.restaurant$/;
    
    if (allowedPattern.test(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // Allow localhost in development
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

2. Add middleware to log subdomains (optional):

```typescript
// Subdomain logging middleware
app.use((req, res, next) => {
  const host = req.get('host');
  const subdomain = host?.split('.')[0];
  if (subdomain && subdomain !== 'kitchensync' && subdomain !== 'www') {
    console.log(`Request from subdomain: ${subdomain}`);
  }
  next();
});
```

### Frontend Updates

The frontend code already handles subdomains properly, but verify:

1. `frontend/src/utils/subdomain.ts` works with production domains
2. `buildRestaurantUrl()` generates correct production URLs

## Step 6: Database Migration

Before going live, ensure your production database has:

1. All restaurants have unique slugs:
```sql
-- Check for missing slugs
SELECT id, name, slug FROM restaurants WHERE slug IS NULL OR slug = '';

-- Generate slugs if needed
UPDATE restaurants 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', ''))
WHERE slug IS NULL OR slug = '';
```

2. Enable website builder for restaurants:
```sql
UPDATE restaurants 
SET website_builder_enabled = true 
WHERE id IN (1, 2, 3); -- Your restaurant IDs
```

## Step 7: Testing

After deployment, test each subdomain:

1. **Main App**: https://kitchensync.restaurant
2. **Restaurant Portals**: 
   - https://coqauvin.kitchensync.restaurant
   - https://[other-slugs].kitchensync.restaurant

### Testing Checklist:
- [ ] Main domain loads staff portal
- [ ] Subdomain loads customer portal
- [ ] Correct restaurant branding appears
- [ ] API calls work from subdomains
- [ ] SSL certificates are valid
- [ ] Mobile responsive on all domains

## Step 8: Monitoring

Set up monitoring in Render:
1. Health checks for main domain
2. Alerts for SSL certificate expiry
3. Log aggregation to track subdomain usage

## Troubleshooting

### SSL Certificate Issues
- Wait 15-30 minutes after adding domains
- Check Render dashboard for certificate status
- Ensure DNS propagation is complete

### Subdomain Not Loading
- Verify DNS records are correct
- Check restaurant slug exists in database
- Look at Render logs for errors
- Test with `curl -I https://subdomain.kitchensync.restaurant`

### CORS Errors
- Check backend CORS configuration
- Ensure credentials are included in API calls
- Verify allowed origins pattern matches

## Production Considerations

1. **Rate Limiting**: Consider adding rate limiting per subdomain
2. **Analytics**: Track usage per restaurant subdomain
3. **Caching**: Implement caching for restaurant settings
4. **SEO**: Add proper meta tags for each restaurant
5. **Monitoring**: Set up uptime monitoring for critical restaurant subdomains 