// Try to load from .env first, then .env.local
try {
  require('dotenv').config({ path: '.env' });
} catch (e) {
  // If .env doesn't exist, try .env.local
  require('dotenv').config({ path: '.env.local' });
}

async function testStripeConnection() {
  console.log('Testing Stripe connection...\n');
  
  // Check if Stripe keys are set
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
    console.error('   Make sure you have a .env or .env.local file with STRIPE_SECRET_KEY set');
    return;
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET is not set - webhooks will not work');
  }
  
  console.log('✅ Stripe environment variables found');
  console.log('   Secret key:', process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...');
  
  // Test Stripe connection
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Try to list products
    const products = await stripe.products.list({ limit: 3 });
    console.log('\n✅ Stripe connection successful!');
    console.log(`   Found ${products.data.length} products:`);
    
    products.data.forEach(product => {
      console.log(`   - ${product.name} (${product.id})`);
    });
    
    // List prices
    console.log('\n📋 Checking prices:');
    const prices = await stripe.prices.list({ limit: 10, active: true });
    
    prices.data.forEach(price => {
      const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Custom';
      console.log(`   - ${price.id}: ${amount} ${price.recurring?.interval || 'one-time'}`);
    });
    
    // Check configured price IDs
    console.log('\n🔍 Checking configured price IDs:');
    const priceIds = {
      STARTER: process.env.STRIPE_PRICE_STARTER,
      PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
      HOME: process.env.STRIPE_PRICE_HOME,
    };
    
    for (const [plan, priceId] of Object.entries(priceIds)) {
      if (priceId) {
        try {
          const price = await stripe.prices.retrieve(priceId);
          console.log(`   ✅ ${plan}: ${priceId} - Valid`);
        } catch (error) {
          console.log(`   ❌ ${plan}: ${priceId} - Not found`);
        }
      } else {
        console.log(`   ⚠️  ${plan}: Not configured`);
      }
    }
    
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    console.error('   Make sure your STRIPE_SECRET_KEY is valid');
  }
}

testStripeConnection(); 