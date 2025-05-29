# KitchenSync Stripe Setup Guide

## Overview
This guide will help you set up Stripe for production to enable customer subscriptions and payments.

## Prerequisites
- Stripe account (create at https://stripe.com)
- Access to Render dashboard for environment variables
- Domain configured (for webhooks)

## Step 1: Stripe Dashboard Setup

### 1.1 Create Products and Prices
1. Log into Stripe Dashboard
2. Navigate to **Products** → **Add Product**
3. Create the following products:

#### HOME Plan
- **Name**: KitchenSync Home
- **Description**: Perfect for home users - Up to 3 staff members
- **Price**: $19.00/month
- **Price ID**: Copy this (looks like `price_1234...`)

#### STARTER Plan
- **Name**: KitchenSync Starter
- **Description**: Small restaurants - Up to 5 staff members
- **Price**: $49.00/month
- **Price ID**: Copy this

#### PROFESSIONAL Plan
- **Name**: KitchenSync Professional
- **Description**: Growing restaurants - Up to 20 staff members
- **Price**: $149.00/month
- **Price ID**: Copy this

#### ENTERPRISE Plan
- **Name**: KitchenSync Enterprise
- **Description**: Large operations - Unlimited staff members
- **Price**: $299.00/month
- **Price ID**: Copy this

### 1.2 Configure Customer Portal
1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable the following features:
   - Update payment methods
   - View invoices
   - Cancel subscriptions
3. Set cancellation policy to "At end of billing period"
4. Save settings

### 1.3 Set Up Webhooks
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://api.kitchensync.restaurant/api/platform/webhooks/stripe`
   (Use your current domain for now)
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

## Step 2: Environment Variables

### 2.1 Get Your API Keys
1. Go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_live_`)
3. Copy your **Secret key** (starts with `sk_live_`)

### 2.2 Update Render Environment Variables
Add these to your backend service on Render:

```bash
# Stripe Core
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Price IDs (from Step 1.1)
STRIPE_PRICE_HOME=price_your_home_price_id
STRIPE_PRICE_STARTER=price_your_starter_price_id
STRIPE_PRICE_PROFESSIONAL=price_your_professional_price_id
STRIPE_PRICE_ENTERPRISE=price_your_enterprise_price_id

# Optional: For testing
STRIPE_TEST_MODE=false
```

## Step 3: Test Your Configuration

### 3.1 Local Testing (Optional)
For local testing, create `backend/.env.local` with test keys:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_HOME=price_test_...
# etc.
```

### 3.2 Verify Price IDs
Run this script to verify your configuration:

```javascript
// backend/scripts/verify-stripe-config.js
require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function verifyStripeConfig() {
  console.log('Verifying Stripe configuration...\n');
  
  // Check API key
  try {
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe API Key is valid');
    console.log(`   Account: ${account.email}`);
  } catch (error) {
    console.log('❌ Invalid Stripe API Key');
    return;
  }

  // Check price IDs
  const priceIds = {
    HOME: process.env.STRIPE_PRICE_HOME,
    STARTER: process.env.STRIPE_PRICE_STARTER,
    PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
    ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE
  };

  for (const [plan, priceId] of Object.entries(priceIds)) {
    try {
      if (!priceId) {
        console.log(`❌ ${plan}: Price ID not set`);
        continue;
      }
      
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product);
      
      console.log(`✅ ${plan}: ${product.name} - $${price.unit_amount / 100}/${price.recurring.interval}`);
    } catch (error) {
      console.log(`❌ ${plan}: Invalid price ID (${priceId})`);
    }
  }
}

verifyStripeConfig();
```

## Step 4: Production Deployment

### 4.1 Deploy Code Changes
1. Ensure all Stripe integration code is committed
2. Push to main branch: `git push origin main`
3. Render will auto-deploy

### 4.2 Verify Webhook Endpoint
1. After deployment, go to Stripe → Webhooks
2. Send a test webhook to verify it's receiving properly
3. Check Render logs for webhook activity

### 4.3 Test End-to-End Flow
1. Create a test restaurant account
2. Try to upgrade from trial
3. Complete payment with test card: `4242 4242 4242 4242`
4. Verify subscription is active in database
5. Check Stripe dashboard for payment

## Step 5: Monitoring and Maintenance

### 5.1 Set Up Alerts
In Stripe Dashboard:
1. Go to **Settings** → **Notifications**
2. Enable email alerts for:
   - Failed payments
   - Disputes
   - Successful payments (optional)

### 5.2 Regular Checks
- Monitor failed payments weekly
- Review subscription metrics monthly
- Check webhook failures in Stripe dashboard

## Troubleshooting

### Common Issues:

1. **"No such price" error**
   - Verify price IDs are copied correctly
   - Ensure you're using live vs test mode consistently

2. **Webhook failures**
   - Check Render logs for errors
   - Verify webhook secret is correct
   - Ensure endpoint URL is accessible

3. **Payment failures**
   - Check customer's card details
   - Look for Stripe error codes
   - Verify account is in good standing

### Debug Checklist:
- [ ] API keys are for correct mode (live/test)
- [ ] All price IDs are set in environment variables
- [ ] Webhook endpoint is publicly accessible
- [ ] Database has subscription table
- [ ] Frontend has error handling for payment failures

## Security Notes

1. **Never commit API keys** to git
2. **Use environment variables** for all sensitive data
3. **Validate webhooks** using signing secret
4. **Enable 2FA** on your Stripe account
5. **Restrict API key permissions** if possible

## Support Resources

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- API Reference: https://stripe.com/docs/api
- Testing Cards: https://stripe.com/docs/testing

## Next Steps

Once Stripe is configured:
1. Test with a real card in production
2. Set up revenue reporting
3. Configure tax settings if needed
4. Plan for international payments
5. Set up Stripe Radar for fraud protection 