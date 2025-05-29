# Quick Fix: Production Stripe Configuration

## The Issue
Your production environment is returning 503 errors because the Stripe environment variables are not set in Render.

## Quick Check
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to "Environment" tab
4. Check if these variables exist:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_HOME`
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_PROFESSIONAL`
   - `STRIPE_PRICE_ENTERPRISE`
   - `STRIPE_WEBHOOK_SECRET`

## If Variables Are Missing

### 1. Get Your Price IDs from Stripe
Go to https://dashboard.stripe.com/products

For each product (Home, Starter, Professional, Enterprise):
- Click on the product
- Find the price ID (looks like: `price_1PQN8xKlGdPk...`)
- Copy it

### 2. Add to Render
In Render Environment tab, add:

```
STRIPE_SECRET_KEY=sk_live_51P5x9tKlGdPk... (your live secret key)
STRIPE_PRICE_HOME=price_1PQN8xKlGdPk... (your HOME price ID)
STRIPE_PRICE_STARTER=price_1PQN9yKlGdPk... (your STARTER price ID)
STRIPE_PRICE_PROFESSIONAL=price_1PQNAzKlGdPk... (your PROFESSIONAL price ID)
STRIPE_PRICE_ENTERPRISE=price_1PQNBaKlGdPk... (your ENTERPRISE price ID)
STRIPE_WEBHOOK_SECRET=whsec_... (from webhook setup)
```

### 3. Save & Deploy
Click "Save Changes" - this triggers a redeploy (~5 minutes)

## Verify It's Working

After deployment completes:
1. Go to https://kitchen-sync-app.onrender.com/settings/billing
2. Click any "Upgrade" button
3. You should see the Stripe checkout page

## If Still Not Working

Check Render logs for the exact error:
1. In Render, go to "Logs" tab
2. Look for "Error creating checkout session"
3. The error will tell you what's missing

## Common Issues

1. **Wrong mode**: Make sure you're using LIVE keys, not TEST keys
2. **Typos**: Price IDs are case-sensitive
3. **Missing webhook**: The webhook secret is optional but recommended

## Need the Price IDs?

If you need to find your price IDs again:
1. Go to https://dashboard.stripe.com/products
2. Click on each product
3. The price ID is shown under the price (starts with `price_`) 