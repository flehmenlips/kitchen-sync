import Stripe from 'stripe';
import { SubscriptionPlan } from '@prisma/client';

// Initialize Stripe with your secret key (only if available)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2025-04-30.basil',
}) : null;

// Price IDs for each plan (you'll need to create these in Stripe)
const PRICE_IDS: Record<SubscriptionPlan, string | null> = {
  TRIAL: null, // No price for trial
  FREE: null,
  HOME: process.env.STRIPE_PRICE_HOME || 'price_home',
  STARTER: process.env.STRIPE_PRICE_STARTER || 'price_starter',
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
};

// Helper function to check if Stripe is configured
const checkStripeConfig = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
};

export const stripeService = {
  // Create a new customer in Stripe
  async createCustomer(email: string, name?: string, metadata?: any) {
    checkStripeConfig();
    try {
      const customer = await stripe!.customers.create({
        email,
        name,
        metadata,
      });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  },

  // Create a subscription
  async createSubscription(
    customerId: string,
    priceId: string,
    trialDays?: number
  ) {
    checkStripeConfig();
    try {
      const subscription = await stripe!.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Update subscription (upgrade/downgrade)
  async updateSubscription(
    subscriptionId: string,
    newPriceId: string,
    prorationBehavior: 'create_prorations' | 'none' = 'create_prorations'
  ) {
    checkStripeConfig();
    try {
      const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await stripe!.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: prorationBehavior,
      });
      
      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ) {
    checkStripeConfig();
    try {
      if (immediately) {
        return await stripe!.subscriptions.cancel(subscriptionId);
      } else {
        return await stripe!.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Reactivate a canceled subscription
  async reactivateSubscription(subscriptionId: string) {
    checkStripeConfig();
    try {
      return await stripe!.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  },

  // Get customer portal session
  async createPortalSession(customerId: string, returnUrl: string) {
    checkStripeConfig();
    try {
      const session = await stripe!.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  // Create checkout session for new subscription
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    trialDays?: number,
    metadata?: any
  ) {
    checkStripeConfig();
    try {
      const session = await stripe!.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          trial_period_days: trialDays,
          metadata,
        },
      });
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Get invoices for a customer
  async getInvoices(customerId: string, limit: number = 10) {
    checkStripeConfig();
    try {
      const invoices = await stripe!.invoices.list({
        customer: customerId,
        limit,
      });
      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Webhook handling
  async constructWebhookEvent(payload: string | Buffer, signature: string) {
    checkStripeConfig();
    
    // Try the primary webhook secret first
    const primarySecret = process.env.STRIPE_WEBHOOK_SECRET;
    const secondarySecret = process.env.STRIPE_WEBHOOK_SECRET_2;
    
    if (!primarySecret && !secondarySecret) {
      throw new Error('No webhook secret configured');
    }
    
    // Try primary secret first
    if (primarySecret) {
      try {
        return stripe!.webhooks.constructEvent(payload, signature, primarySecret);
      } catch (error) {
        // If primary fails and we have a secondary, try that
        if (secondarySecret) {
          console.log('Primary webhook secret failed, trying secondary...');
          try {
            return stripe!.webhooks.constructEvent(payload, signature, secondarySecret);
          } catch (secondaryError) {
            console.error('Both webhook secrets failed');
            throw secondaryError;
          }
        }
        throw error;
      }
    }
    
    // If only secondary secret exists, use it
    if (secondarySecret) {
      return stripe!.webhooks.constructEvent(payload, signature, secondarySecret);
    }
    
    throw new Error('Webhook signature verification failed');
  },

  // Helper to get price ID for a plan
  getPriceId(plan: SubscriptionPlan): string | null {
    return PRICE_IDS[plan];
  },

  // Verify webhook signature
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    checkStripeConfig();
    
    const primarySecret = process.env.STRIPE_WEBHOOK_SECRET;
    const secondarySecret = process.env.STRIPE_WEBHOOK_SECRET_2;
    
    // Try primary secret
    if (primarySecret) {
      try {
        stripe!.webhooks.constructEvent(payload, signature, primarySecret);
        return true;
      } catch (error) {
        // Continue to try secondary
      }
    }
    
    // Try secondary secret
    if (secondarySecret) {
      try {
        stripe!.webhooks.constructEvent(payload, signature, secondarySecret);
        return true;
      } catch (error) {
        // Both failed
      }
    }
    
    return false;
  },

  // Get Stripe billing portal URL
  async getPortalUrl(customerId: string, returnUrl: string): Promise<string> {
    checkStripeConfig();
    const session = await stripe!.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  },
}; 