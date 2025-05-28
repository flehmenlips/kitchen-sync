import { Request, Response } from 'express';
import { PrismaClient, SubscriptionPlan } from '@prisma/client';
import { stripeService } from '../../services/stripeService';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Construct the event using the raw body and signature
    event = await stripeService.constructWebhookEvent(req.body, sig);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Handle subscription created
async function handleSubscriptionCreated(stripeSubscription: Stripe.Subscription) {
  const customerId = stripeSubscription.customer as string;
  
  // Find the subscription by Stripe customer ID
  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  });

  if (!subscription) {
    console.error(`Subscription not found for customer ${customerId}`);
    return;
  }

  // Update subscription with Stripe details
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      stripeSubId: stripeSubscription.id,
      status: mapStripeStatus(stripeSubscription.status),
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAt: (stripeSubscription as any).cancel_at ? new Date((stripeSubscription as any).cancel_at * 1000) : null,
    }
  });
}

// Handle subscription updated
async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubId: stripeSubscription.id }
  });

  if (!subscription) {
    console.error(`Subscription not found for Stripe ID ${stripeSubscription.id}`);
    return;
  }

  // Extract plan from the subscription items
  const stripePlan = stripeSubscription.items.data[0]?.price;
  const plan = mapStripePlanToPlan(stripePlan?.id);

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: mapStripeStatus(stripeSubscription.status),
      ...(plan && { plan: plan as SubscriptionPlan }),
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAt: (stripeSubscription as any).cancel_at ? new Date((stripeSubscription as any).cancel_at * 1000) : null,
      canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
    }
  });
}

// Handle subscription deleted
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubId: stripeSubscription.id }
  });

  if (!subscription) {
    console.error(`Subscription not found for Stripe ID ${stripeSubscription.id}`);
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    }
  });
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(stripeInvoice: Stripe.Invoice) {
  const subscriptionId = (stripeInvoice as any).subscription as string;
  
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubId: subscriptionId }
  });

  if (!subscription) {
    console.error(`Subscription not found for invoice ${stripeInvoice.id}`);
    return;
  }

  // Create or update invoice record
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: stripeInvoice.id },
    create: {
      subscriptionId: subscription.id,
      stripeInvoiceId: stripeInvoice.id,
      invoiceNumber: stripeInvoice.number || `INV-${Date.now()}`,
      status: 'PAID',
      amount: (stripeInvoice.subtotal || 0) / 100,
      tax: ((stripeInvoice as any).tax || 0) / 100,
      total: (stripeInvoice.total || 0) / 100,
      currency: stripeInvoice.currency?.toUpperCase() || 'USD',
      periodStart: new Date((stripeInvoice as any).period_start * 1000),
      periodEnd: new Date((stripeInvoice as any).period_end * 1000),
      paidAt: (stripeInvoice as any).status_transitions?.paid_at ? new Date((stripeInvoice as any).status_transitions.paid_at * 1000) : new Date(),
      invoiceUrl: stripeInvoice.hosted_invoice_url || null,
      invoicePdf: stripeInvoice.invoice_pdf || null,
    },
    update: {
      status: 'PAID',
      paidAt: (stripeInvoice as any).status_transitions?.paid_at ? new Date((stripeInvoice as any).status_transitions.paid_at * 1000) : new Date(),
      invoiceUrl: stripeInvoice.hosted_invoice_url || null,
      invoicePdf: stripeInvoice.invoice_pdf || null,
    }
  });

  // Update subscription payment status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      lastPaymentStatus: 'succeeded',
      lastPaymentDate: new Date(),
    }
  });
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(stripeInvoice: Stripe.Invoice) {
  const subscriptionId = (stripeInvoice as any).subscription as string;
  
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubId: subscriptionId }
  });

  if (!subscription) {
    console.error(`Subscription not found for invoice ${stripeInvoice.id}`);
    return;
  }

  // Update subscription to past due
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'PAST_DUE',
      lastPaymentStatus: 'failed',
      lastPaymentDate: new Date(),
    }
  });

  // TODO: Send email notification to restaurant owner
}

// Handle trial ending soon
async function handleTrialWillEnd(stripeSubscription: Stripe.Subscription) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubId: stripeSubscription.id },
    include: {
      restaurant: true
    }
  });

  if (!subscription) {
    console.error(`Subscription not found for Stripe ID ${stripeSubscription.id}`);
    return;
  }

  // TODO: Send email notification about trial ending
  console.log(`Trial ending soon for ${subscription.restaurant.name}`);
}

// Helper function to map Stripe status to our status
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): any {
  const statusMap: Record<string, string> = {
    'active': 'ACTIVE',
    'past_due': 'PAST_DUE',
    'canceled': 'CANCELED',
    'unpaid': 'SUSPENDED',
    'trialing': 'TRIAL',
    'incomplete': 'SUSPENDED',
    'incomplete_expired': 'CANCELED',
    'paused': 'SUSPENDED',
  };

  return statusMap[stripeStatus] || 'SUSPENDED';
}

// Helper function to map Stripe price ID to our plan
function mapStripePlanToPlan(priceId?: string): SubscriptionPlan | null {
  if (!priceId) return null;
  
  // This should match your actual Stripe price IDs
  const planMap: Record<string, SubscriptionPlan> = {
    [process.env.STRIPE_PRICE_HOME || 'price_home']: 'HOME',
    [process.env.STRIPE_PRICE_STARTER || 'price_starter']: 'STARTER',
    [process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional']: 'PROFESSIONAL',
    [process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise']: 'ENTERPRISE',
  };

  return planMap[priceId] || null;
} 