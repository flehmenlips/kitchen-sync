import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { stripeService } from '../services/stripeService';

const prisma = new PrismaClient();

// Get current subscription
export const getSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.restaurantId;
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { restaurantId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            ownerEmail: true
          }
        }
      }
    });

    if (!subscription) {
      // Create a trial subscription if none exists
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const newSubscription = await prisma.subscription.create({
        data: {
          restaurantId,
          plan: 'TRIAL',
          status: 'TRIAL',
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
          trialEndsAt: trialEnd,
          seats: 5
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              ownerEmail: true
            }
          }
        }
      });

      res.json(newSubscription);
      return;
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

// Get invoices
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.restaurantId;
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { restaurantId }
    });

    if (!subscription) {
      res.json([]);
      return;
    }

    const invoices = await prisma.invoice.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Create checkout session
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.restaurantId;
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const { plan, successUrl, cancelUrl } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        subscription: true
      }
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    // Create or get customer
    let customerId = restaurant.subscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripeService.createCustomer(
        restaurant.ownerEmail || '',
        restaurant.name,
        {
          restaurantId: restaurant.id.toString()
        }
      );
      customerId = customer.id;

      // Update subscription with customer ID
      await prisma.subscription.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          plan: 'TRIAL',
          status: 'TRIAL',
          stripeCustomerId: customerId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          seats: 5
        },
        update: {
          stripeCustomerId: customerId
        }
      });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customerId,
      stripeService.getPriceId(plan) || '',
      successUrl || `${process.env.FRONTEND_URL}/settings/billing?success=true`,
      cancelUrl || `${process.env.FRONTEND_URL}/settings/billing?canceled=true`,
      14, // trial days
      {
        restaurantId: restaurant.id.toString(),
        plan
      }
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// Create billing portal session
export const createBillingPortalSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.restaurantId;
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const { returnUrl } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { restaurantId }
    });

    if (!subscription?.stripeCustomerId) {
      res.status(400).json({ error: 'No billing account found' });
      return;
    }

    const session = await stripeService.createPortalSession(
      subscription.stripeCustomerId,
      returnUrl || `${process.env.FRONTEND_URL}/settings/billing`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.restaurantId;
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { restaurantId }
    });

    if (!subscription?.stripeSubId) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    // Cancel at period end in Stripe
    await stripeService.cancelSubscription(subscription.stripeSubId);

    // Update local subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAt: subscription.currentPeriodEnd
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            ownerEmail: true
          }
        }
      }
    });

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}; 