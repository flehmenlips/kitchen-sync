import { Response } from 'express';
import { PrismaClient, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { PlatformAuthRequest } from '../../middleware/platformAuth';
import { stripeService } from '../../services/stripeService';

const prisma = new PrismaClient();

// Get all subscriptions with filters
export const getSubscriptions = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      plan,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status as SubscriptionStatus;
    }
    
    if (plan) {
      where.plan = plan as SubscriptionPlan;
    }
    
    if (search) {
      where.OR = [
        { restaurant: { name: { contains: String(search), mode: 'insensitive' } } },
        { billingEmail: { contains: String(search), mode: 'insensitive' } },
        { billingName: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    // Count total
    const total = await prisma.subscription.count({ where });

    // Get subscriptions with restaurant info
    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerEmail: true,
            ownerName: true
          }
        },
        _count: {
          select: {
            invoices: true,
            usageRecords: true
          }
        }
      },
      skip,
      take,
      orderBy: {
        [String(sortBy)]: sortOrder as any
      }
    });

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'VIEW_SUBSCRIPTIONS',
        metadata: { filters: { status, plan, search } },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      subscriptions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

// Get single subscription details
export const getSubscription = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id: Number(id) },
      include: {
        restaurant: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        usageRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    // Get Stripe data if available
    let stripeData = null;
    if (subscription.stripeSubId) {
      try {
        // This would fetch from Stripe API - commented out for now
        // stripeData = await stripeService.getSubscription(subscription.stripeSubId);
      } catch (error) {
        console.error('Error fetching Stripe data:', error);
      }
    }

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'VIEW_SUBSCRIPTION',
        entityType: 'subscription',
        entityId: Number(id),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      subscription,
      stripeData
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

// Update subscription (admin override)
export const updateSubscription = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { plan, status, notes } = req.body;

    // Check permissions - only SUPER_ADMIN can modify subscriptions
    if (req.platformAdmin!.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const updateData: any = {};
    if (plan) updateData.plan = plan;
    if (status) updateData.status = status;

    const subscription = await prisma.subscription.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        restaurant: true
      }
    });

    // Add note if provided
    if (notes) {
      await prisma.restaurantNote.create({
        data: {
          restaurantId: subscription.restaurantId,
          adminId: req.platformAdmin!.id,
          note: `Subscription updated: ${notes}`,
          isInternal: true
        }
      });
    }

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'UPDATE_SUBSCRIPTION',
        entityType: 'subscription',
        entityId: Number(id),
        metadata: { changes: updateData, notes },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({ message: 'Subscription updated', subscription });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

// Create trial subscription for new restaurant
export const createTrialSubscription = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { restaurantId, billingEmail, billingName, trialDays = 14 } = req.body;

    // Check if subscription already exists
    const existing = await prisma.subscription.findUnique({
      where: { restaurantId: Number(restaurantId) }
    });

    if (existing) {
      res.status(400).json({ error: 'Subscription already exists for this restaurant' });
      return;
    }

    // Calculate trial end date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        restaurantId: Number(restaurantId),
        plan: 'TRIAL',
        status: 'TRIAL',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        billingEmail,
        billingName
      },
      include: {
        restaurant: true
      }
    });

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'CREATE_TRIAL_SUBSCRIPTION',
        entityType: 'subscription',
        entityId: subscription.id,
        metadata: { restaurantId, trialDays },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create trial subscription error:', error);
    res.status(500).json({ error: 'Failed to create trial subscription' });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { immediately = false, reason } = req.body;

    // Check permissions
    if (req.platformAdmin!.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: Number(id) }
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    // Update subscription
    const updateData: any = {
      status: 'CANCELED',
      canceledAt: new Date()
    };

    if (!immediately) {
      updateData.cancelAt = subscription.currentPeriodEnd;
    }

    const updated = await prisma.subscription.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        restaurant: true
      }
    });

    // Add note
    await prisma.restaurantNote.create({
      data: {
        restaurantId: subscription.restaurantId,
        adminId: req.platformAdmin!.id,
        note: `Subscription canceled: ${reason || 'No reason provided'}`,
        isInternal: true
      }
    });

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'CANCEL_SUBSCRIPTION',
        entityType: 'subscription',
        entityId: Number(id),
        metadata: { immediately, reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({ message: 'Subscription canceled', subscription: updated });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

// Get subscription analytics
export const getSubscriptionAnalytics = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    // Subscriptions by status
    const byStatus = await prisma.subscription.groupBy({
      by: ['status'],
      _count: true
    });

    // Subscriptions by plan
    const byPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      _count: true
    });

    // Calculate MRR
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { plan: true }
    });

    // Plan pricing (for MRR calculation and analytics)
    const planPrices = {
      TRIAL: 0,
      FREE: 0,
      HOME: 19,
      STARTER: 49,
      PROFESSIONAL: 149,
      ENTERPRISE: 299
    };

    const mrr = activeSubscriptions.reduce((total, sub) => {
      const basePrice = planPrices[sub.plan] || 0;
      return total + basePrice;
    }, 0);

    // Churn rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCancellations = await prisma.subscription.count({
      where: {
        canceledAt: { gte: thirtyDaysAgo }
      }
    });

    const totalActive = await prisma.subscription.count({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] }
      }
    });

    const churnRate = totalActive > 0 ? (recentCancellations / totalActive) * 100 : 0;

    // Growth (new subscriptions last 30 days)
    const newSubscriptions = await prisma.subscription.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    res.json({
      byStatus,
      byPlan,
      mrr,
      churnRate: churnRate.toFixed(2),
      newSubscriptions,
      totalActive
    });
  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}; 