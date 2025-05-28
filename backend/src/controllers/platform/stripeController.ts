import { Response } from 'express';
import { PlatformAuthRequest } from '../../middleware/platformAuth';
import stripe from '../../config/stripe';
import { stripeConfig } from '../../config/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create checkout session for subscription upgrade
export const createCheckoutSession = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { restaurantId, priceId, successUrl, cancelUrl } = req.body;

    if (!stripe) {
      res.status(503).json({ error: 'Stripe is not configured' });
      return;
    }

    // Get restaurant and subscription
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { subscription: true }
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    // Create or get Stripe customer
    let customerId = restaurant.subscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: restaurant.ownerEmail || restaurant.email || undefined,
        name: restaurant.ownerName || restaurant.name,
        metadata: {
          restaurantId: restaurant.id.toString(),
          restaurantName: restaurant.name
        }
      });
      customerId = customer.id;

      // Update subscription with customer ID
      if (restaurant.subscription) {
        await prisma.subscription.update({
          where: { id: restaurant.subscription.id },
          data: { stripeCustomerId: customerId }
        });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: restaurant.subscription?.status === 'TRIAL' ? 14 : undefined,
        metadata: {
          restaurantId: restaurant.id.toString(),
        }
      },
      success_url: successUrl || `${process.env.FRONTEND_URL}/settings/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/settings/billing?canceled=true`,
      metadata: {
        restaurantId: restaurant.id.toString(),
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// Create billing portal session
export const createBillingPortalSession = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId, returnUrl } = req.body;

    if (!stripe) {
      res.status(503).json({ error: 'Stripe is not configured' });
      return;
    }

    if (!customerId) {
      res.status(400).json({ error: 'Customer ID is required' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.FRONTEND_URL}/settings/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create billing portal session error:', error);
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
};

// Get subscription details from Stripe
export const getStripeSubscription = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;

    if (!stripe) {
      res.status(503).json({ error: 'Stripe is not configured' });
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'customer', 'default_payment_method']
    });

    res.json({ subscription });
  } catch (error) {
    console.error('Get Stripe subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch Stripe subscription' });
  }
};

// Cancel subscription immediately in Stripe
export const cancelStripeSubscription = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    const { immediately = false } = req.body;

    if (!stripe) {
      res.status(503).json({ error: 'Stripe is not configured' });
      return;
    }

    let subscription;
    if (immediately) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Cancel Stripe subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel Stripe subscription' });
  }
}; 