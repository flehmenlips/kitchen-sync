const Stripe = require('stripe');
require('dotenv').config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('Setting up Stripe products and prices...\n');

    // Create the main product
    const product = await stripe.products.create({
      name: 'KitchenSync Subscription',
      description: 'Restaurant management platform subscription',
    });

    console.log('✅ Created product:', product.id);

    // Create prices for each plan
    const plans = [
      {
        name: 'Starter',
        price: 4900, // $49.00 in cents
        metadata: { plan: 'STARTER' }
      },
      {
        name: 'Professional',
        price: 9900, // $99.00 in cents
        metadata: { plan: 'PROFESSIONAL' }
      },
      {
        name: 'Home',
        price: 19900, // $199.00 in cents
        metadata: { plan: 'HOME' }
      }
    ];

    console.log('\nCreating prices:');
    
    for (const plan of plans) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        nickname: plan.name,
        metadata: plan.metadata,
      });

      console.log(`✅ ${plan.name} Plan: ${price.id} ($${plan.price / 100}/month)`);
    }

    console.log('\n🎉 Setup complete! Add these price IDs to your environment variables:');
    console.log('STRIPE_PRICE_STARTER=price_...');
    console.log('STRIPE_PRICE_PROFESSIONAL=price_...');
    console.log('STRIPE_PRICE_HOME=price_...');

  } catch (error) {
    console.error('Error setting up Stripe products:', error.message);
  }
}

// Run the setup
setupStripeProducts(); 