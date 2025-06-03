# API Subdomain Fix

## Add this DNS record in Squarespace:

- Host: `api`
- Type: `CNAME`
- Data: `kitchen-sync-api.onrender.com`
- TTL: `4 hrs`

This will route api.kitchensync.restaurant to your backend service.

## Alternative: Update Frontend Config

If you prefer not to add another DNS record, update `frontend/src/services/apiService.ts`:

```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://kitchen-sync-api.onrender.com/api'  // Use Render URL directly
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');
```

## After DNS Update:

1. Wait 5-10 minutes for DNS propagation
2. The Website Builder should start working
3. Customer portals at subdomains will also work 