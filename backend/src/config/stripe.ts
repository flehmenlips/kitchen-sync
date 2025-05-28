import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    })
  : null;

// Stripe configuration
export const stripeConfig = {
  // Subscription prices (these should match your Stripe dashboard)
  prices: {
    TRIAL: null, // Free trial
    STARTER: process.env.STRIPE_PRICE_STARTER || 'price_starter_monthly',
    PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional_monthly',
    HOME: process.env.STRIPE_PRICE_HOME || 'price_home_monthly',
  },
  
  // Trial period in days
  trialPeriodDays: 14,
  
  // Webhook endpoint secret
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Portal configuration
  portalConfigId: process.env.STRIPE_PORTAL_CONFIG_ID || '',
};

export default stripe; 