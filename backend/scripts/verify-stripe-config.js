require('dotenv').config({ path: '.env.local' });

// Check if Stripe is available
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.error('❌ Failed to initialize Stripe. Check your STRIPE_SECRET_KEY');
  process.exit(1);
}

async function verifyStripeConfig() {
  console.log('Verifying Stripe configuration...\n');
  
  // Check if we have the key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY is not set');
    return;
  }

  console.log(`Mode: ${process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'}\n`);
  
  // Check API key
  try {
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe API Key is valid');
    console.log(`   Account: ${account.email || account.business_profile?.name || 'Unknown'}`);
    console.log(`   Country: ${account.country}`);
    console.log('');
  } catch (error) {
    console.log('❌ Invalid Stripe API Key:', error.message);
    return;
  }

  // Check webhook secret
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('✅ Webhook secret is configured');
  } else {
    console.log('⚠️  Webhook secret is not set (STRIPE_WEBHOOK_SECRET)');
  }
  console.log('');

  // Check price IDs
  console.log('Checking Price IDs:\n');
  const priceIds = {
    HOME: process.env.STRIPE_PRICE_HOME,
    STARTER: process.env.STRIPE_PRICE_STARTER,
    PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
    ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE
  };

  let allPricesValid = true;
  for (const [plan, priceId] of Object.entries(priceIds)) {
    try {
      if (!priceId) {
        console.log(`❌ ${plan}: Price ID not set in environment variables`);
        allPricesValid = false;
        continue;
      }
      
      if (priceId.startsWith('price_') && priceId.length < 30) {
        console.log(`⚠️  ${plan}: Using placeholder price ID (${priceId})`);
        allPricesValid = false;
        continue;
      }
      
      const price = await stripe.prices.retrieve(priceId);
      const product = typeof price.product === 'string' 
        ? await stripe.products.retrieve(price.product)
        : price.product;
      
      const amount = price.unit_amount ? `$${price.unit_amount / 100}` : 'Custom';
      const interval = price.recurring?.interval || 'one-time';
      
      console.log(`✅ ${plan}: ${product.name}`);
      console.log(`   Price: ${amount}/${interval}`);
      console.log(`   ID: ${priceId}`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${plan}: Invalid price ID (${priceId})`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      allPricesValid = false;
    }
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  if (allPricesValid && process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('✅ Stripe is fully configured and ready for production!');
  } else {
    console.log('⚠️  Some configuration is missing:');
    if (!allPricesValid) {
      console.log('   - Set up all price IDs in Stripe Dashboard');
      console.log('   - Update environment variables with actual price IDs');
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('   - Configure webhook endpoint in Stripe Dashboard');
      console.log('   - Set STRIPE_WEBHOOK_SECRET environment variable');
    }
  }

  // Test recommendations
  console.log('\n=== NEXT STEPS ===');
  if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.log('1. You are using TEST mode - great for development!');
    console.log('2. Test the full payment flow with card: 4242 4242 4242 4242');
    console.log('3. When ready, switch to LIVE mode keys in production');
  } else {
    console.log('1. You are using LIVE mode - be careful with testing!');
    console.log('2. Consider using TEST mode for development');
    console.log('3. Ensure webhook endpoint is accessible publicly');
  }
}

// Run the verification
verifyStripeConfig().catch(console.error); 