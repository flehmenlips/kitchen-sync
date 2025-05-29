// This script checks the production Stripe configuration
// Run it locally to see what's in production

const https = require('https');

async function checkProductionStripe() {
  console.log('Checking production Stripe configuration...\n');

  const productionUrl = 'https://kitchen-sync-app.onrender.com';
  
  // Try to get subscription info (this will show if Stripe is configured)
  const testEndpoints = [
    '/api/subscription',
    '/api/subscription/checkout'
  ];

  console.log(`Testing against: ${productionUrl}\n`);

  // Check if the billing page loads
  try {
    const response = await fetch(`${productionUrl}/settings/billing`);
    if (response.ok) {
      console.log('✅ Billing page is accessible');
    } else {
      console.log(`⚠️  Billing page returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Could not reach billing page:', error.message);
  }

  console.log('\n=== What to do next ===\n');
  console.log('1. Log into your Stripe Dashboard at https://dashboard.stripe.com');
  console.log('2. Create the 4 products and prices as outlined in STRIPE_SETUP_GUIDE.md');
  console.log('3. Copy all the price IDs (they look like: price_1PxxxxxxxxxxxxxxxxxxxxHk)');
  console.log('4. Go to Render.com → Backend Service → Environment');
  console.log('5. Add these environment variables:');
  console.log('   - STRIPE_SECRET_KEY (from Stripe API keys)');
  console.log('   - STRIPE_PRICE_HOME (price ID for $19 plan)');
  console.log('   - STRIPE_PRICE_STARTER (price ID for $49 plan)');
  console.log('   - STRIPE_PRICE_PROFESSIONAL (price ID for $149 plan)');
  console.log('   - STRIPE_PRICE_ENTERPRISE (price ID for $299 plan)');
  console.log('   - STRIPE_WEBHOOK_SECRET (from webhook setup)');
  console.log('6. Save and deploy');
  console.log('\nThe deployment will take about 5 minutes.');
}

checkProductionStripe(); 