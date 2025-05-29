# Stripe Production Setup Checklist

## Quick Setup Guide

### Step 1: Create Products in Stripe Dashboard
Go to https://dashboard.stripe.com/products

Create these 4 products with recurring monthly prices:

1. **KitchenSync Home**
   - Price: $19.00/month
   - Description: Perfect for home users - Up to 3 staff members
   - ✅ Copy the price ID (starts with `price_`)

2. **KitchenSync Starter**
   - Price: $49.00/month
   - Description: Small restaurants - Up to 5 staff members
   - ✅ Copy the price ID

3. **KitchenSync Professional**
   - Price: $149.00/month
   - Description: Growing restaurants - Up to 20 staff members
   - ✅ Copy the price ID

4. **KitchenSync Enterprise**
   - Price: $299.00/month
   - Description: Large operations - Unlimited staff members
   - ✅ Copy the price ID

### Step 2: Set Up Webhook
Go to https://dashboard.stripe.com/webhooks

1. Click "Add endpoint"
2. Endpoint URL: `https://kitchen-sync-app.onrender.com/api/platform/webhooks/stripe`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. ✅ Copy the signing secret (starts with `whsec_`)

### Step 3: Configure Customer Portal
Go to https://dashboard.stripe.com/settings/billing/portal

1. Enable customer portal
2. Allow customers to:
   - ✅ Update payment methods
   - ✅ Download invoices
   - ✅ Cancel subscriptions
3. Set cancellation to "At end of billing period"
4. Save settings

### Step 4: Get API Keys
Go to https://dashboard.stripe.com/apikeys

✅ Copy your **Live Secret Key** (starts with `sk_live_`)

### Step 5: Update Render Environment Variables
Go to https://dashboard.render.com → Backend Service → Environment

Add these variables:

```
STRIPE_SECRET_KEY=sk_live_[your_actual_secret_key]
STRIPE_PRICE_HOME=price_[your_home_price_id]
STRIPE_PRICE_STARTER=price_[your_starter_price_id]
STRIPE_PRICE_PROFESSIONAL=price_[your_professional_price_id]
STRIPE_PRICE_ENTERPRISE=price_[your_enterprise_price_id]
STRIPE_WEBHOOK_SECRET=whsec_[your_webhook_secret]
```

Click "Save Changes" - this will trigger a redeploy (~5 minutes)

### Step 6: Verify Everything Works

1. **Test the webhook**:
   - In Stripe Dashboard → Webhooks → Your endpoint
   - Click "Send test webhook"
   - Select any event and send
   - Check it shows as successful

2. **Test a subscription**:
   - Log into KitchenSync as a restaurant owner
   - Go to Settings → Billing
   - Click "Upgrade" on any plan
   - Use test card: `4242 4242 4242 4242`
   - Complete the payment
   - Verify subscription is active

3. **Check the customer portal**:
   - In KitchenSync billing page, click "Manage Billing"
   - Verify you can see the Stripe customer portal

## Troubleshooting

### If upgrade button shows error:
- Check Render logs for specific error
- Verify all environment variables are set correctly
- Make sure price IDs are from LIVE mode, not TEST

### If webhook fails:
- Check the endpoint URL is exactly: `https://kitchen-sync-app.onrender.com/api/platform/webhooks/stripe`
- Verify webhook secret is copied correctly
- Check Render logs for webhook errors

### If payment fails:
- Ensure you're using a valid card
- Check if your Stripe account is fully activated
- Verify you're in the correct country/region

## Security Reminders

1. ✅ Never share your secret key
2. ✅ Enable 2FA on your Stripe account
3. ✅ Set up Radar rules for fraud prevention
4. ✅ Monitor failed payments regularly
5. ✅ Keep webhook endpoint secure

## Success Indicators

When everything is working:
- ✅ No errors when clicking "Upgrade" button
- ✅ Stripe checkout page loads with correct prices
- ✅ Successful payments create active subscriptions
- ✅ Webhooks show as successful in Stripe dashboard
- ✅ Customer portal is accessible
- ✅ Invoices are generated automatically

## Next Steps After Setup

1. **Monitor first real payment** closely
2. **Set up email notifications** in Stripe for important events
3. **Configure tax settings** if needed
4. **Plan for failed payment recovery**
5. **Set up revenue recognition** if required

## Support Contacts

- Stripe Support: https://support.stripe.com
- KitchenSync Issues: Create GitHub issue
- Urgent: Check Render logs first 