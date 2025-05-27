import { Request, Response } from 'express';
import { PrismaClient, OnboardingStatus, Prisma } from '@prisma/client';
import { PlatformAuthRequest } from '../../middleware/platformAuth';

const prisma = new PrismaClient();

// Get all restaurants with filters
export const getRestaurants = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      plan,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: Prisma.RestaurantWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { ownerEmail: { contains: String(search), mode: 'insensitive' } },
        { ownerName: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.onboardingStatus = status as OnboardingStatus;
    }

    if (plan) {
      where.subscription = {
        plan: plan as any
      };
    }

    // Count total - for plan filter, we need a different approach
    let total;
    if (plan) {
      // When filtering by plan, we need to count differently because of the relation
      const countResult = await prisma.restaurant.findMany({
        where,
        select: { id: true }
      });
      total = countResult.length;
    } else {
      total = await prisma.restaurant.count({ where });
    }

    // Get restaurants - try with full relations first, fallback to basic query
    let restaurants;
    try {
      restaurants = await prisma.restaurant.findMany({
        where,
        include: {
          subscription: true,
          _count: {
            select: {
              staff: true,
              reservations: true,
              orders: true,
              customers: true
            }
          }
        },
        skip,
        take,
        orderBy: {
          [String(sortBy)]: sortOrder as Prisma.SortOrder
        }
      });
    } catch (includeError) {
      console.warn('Failed to include full relations, falling back to basic query:', includeError);
      // Fallback to basic query without problematic relations
      restaurants = await prisma.restaurant.findMany({
        where,
        include: {
          _count: {
            select: {
              reservations: true,
              staff: true
            }
          }
        },
        skip,
        take,
        orderBy: {
          [String(sortBy)]: sortOrder as Prisma.SortOrder
        }
      });

      // Add default values for missing relations
      restaurants = restaurants.map(r => ({
        ...r,
        subscription: null,
        _count: {
          ...r._count,
          orders: 0,
          customers: 0
        }
      }));
    }

    // Log action - wrap in try-catch to avoid breaking the main flow
    try {
      await prisma.platformAction.create({
        data: {
          adminId: req.platformAdmin!.id,
          action: 'VIEW_RESTAURANTS',
          metadata: { filters: { search, status, plan } },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
    } catch (logError) {
      console.error('Failed to log platform action:', logError);
    }

    res.json({
      restaurants,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

// Get single restaurant details
export const getRestaurant = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(id) },
      include: {
        subscription: {
          include: {
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        notes: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            staff: true,
            reservations: true,
            orders: true,
            customers: true,
            categories: true,
            contentBlocks: true
          }
        }
      }
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    // Get some analytics
    const analytics = await prisma.reservation.aggregate({
      where: {
        restaurantId: Number(id),
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      },
      _count: true,
      _sum: {
        partySize: true
      }
    });

    // Get recent activity
    const recentActivity = await prisma.platformAction.findMany({
      where: {
        entityType: 'restaurant',
        entityId: Number(id)
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'VIEW_RESTAURANT',
        entityType: 'restaurant',
        entityId: Number(id),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      restaurant,
      analytics,
      recentActivity
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
};

// Update restaurant
export const updateRestaurant = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check permissions - only SUPER_ADMIN and ADMIN can update
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.platformAdmin!.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: Number(id) },
      data: updates
    });

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'UPDATE_RESTAURANT',
        entityType: 'restaurant',
        entityId: Number(id),
        metadata: { updates },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json(restaurant);
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
};

// Verify restaurant
export const verifyRestaurant = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check permissions
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.platformAdmin!.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: Number(id) },
      data: {
        onboardingStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: req.platformAdmin!.id
      }
    });

    // Add note if provided
    if (notes) {
      await prisma.restaurantNote.create({
        data: {
          restaurantId: Number(id),
          adminId: req.platformAdmin!.id,
          note: notes,
          isInternal: true
        }
      });
    }

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'VERIFY_RESTAURANT',
        entityType: 'restaurant',
        entityId: Number(id),
        metadata: { notes },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({ message: 'Restaurant verified successfully', restaurant });
  } catch (error) {
    console.error('Verify restaurant error:', error);
    res.status(500).json({ error: 'Failed to verify restaurant' });
  }
};

// Suspend restaurant
export const suspendRestaurant = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check permissions
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.platformAdmin!.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    if (!reason) {
      res.status(400).json({ error: 'Suspension reason is required' });
      return;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: Number(id) },
      data: {
        suspendedAt: new Date(),
        suspendedReason: reason
      }
    });

    // Add note
    await prisma.restaurantNote.create({
      data: {
        restaurantId: Number(id),
        adminId: req.platformAdmin!.id,
        note: `Restaurant suspended: ${reason}`,
        isInternal: true
      }
    });

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'SUSPEND_RESTAURANT',
        entityType: 'restaurant',
        entityId: Number(id),
        metadata: { reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({ message: 'Restaurant suspended', restaurant });
  } catch (error) {
    console.error('Suspend restaurant error:', error);
    res.status(500).json({ error: 'Failed to suspend restaurant' });
  }
};

// Unsuspend restaurant
export const unsuspendRestaurant = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check permissions
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.platformAdmin!.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: Number(id) },
      data: {
        suspendedAt: null,
        suspendedReason: null
      }
    });

    // Add note if provided
    if (notes) {
      await prisma.restaurantNote.create({
        data: {
          restaurantId: Number(id),
          adminId: req.platformAdmin!.id,
          note: `Restaurant unsuspended: ${notes}`,
          isInternal: true
        }
      });
    }

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'UNSUSPEND_RESTAURANT',
        entityType: 'restaurant',
        entityId: Number(id),
        metadata: { notes },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({ message: 'Restaurant unsuspended', restaurant });
  } catch (error) {
    console.error('Unsuspend restaurant error:', error);
    res.status(500).json({ error: 'Failed to unsuspend restaurant' });
  }
};

// Add note to restaurant
export const addRestaurantNote = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note, isInternal = true } = req.body;

    if (!note) {
      res.status(400).json({ error: 'Note content is required' });
      return;
    }

    const newNote = await prisma.restaurantNote.create({
      data: {
        restaurantId: Number(id),
        adminId: req.platformAdmin!.id,
        note,
        isInternal
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin!.id,
        action: 'ADD_RESTAURANT_NOTE',
        entityType: 'restaurant',
        entityId: Number(id),
        metadata: { isInternal },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json(newNote);
  } catch (error) {
    console.error('Add restaurant note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

// Get restaurant analytics
export const getRestaurantAnalytics = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(String(startDate));
    }
    if (endDate) {
      dateFilter.lte = new Date(String(endDate));
    }

    // Get reservation stats
    const reservationStats = await prisma.reservation.groupBy({
      by: ['status'],
      where: {
        restaurantId: Number(id),
        ...(startDate || endDate ? { createdAt: dateFilter } : {})
      },
      _count: true
    });

    // Get revenue stats if we have order data
    const orderStats = await prisma.order.aggregate({
      where: {
        restaurantId: Number(id),
        ...(startDate || endDate ? { createdAt: dateFilter } : {})
      },
      _sum: {
        totalAmount: true
      },
      _count: true,
      _avg: {
        totalAmount: true
      }
    });

    // Get active staff count
    const activeStaff = await prisma.restaurantStaff.count({
      where: {
        restaurantId: Number(id),
        isActive: true
      }
    });

    // Growth metrics
    const growthMetrics = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as reservations
      FROM reservations
      WHERE restaurant_id = ${Number(id)}
        AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month ASC
    `;

    res.json({
      reservationStats,
      orderStats,
      activeStaff,
      growthMetrics
    });
  } catch (error) {
    console.error('Get restaurant analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Platform overview analytics
export const getPlatformAnalytics = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    // Total restaurants by status
    const restaurantsByStatus = await prisma.restaurant.groupBy({
      by: ['onboardingStatus'],
      _count: true
    });

    // Total subscriptions by plan
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      where: {
        status: 'ACTIVE'
      },
      _count: true
    });

    // Calculate MRR
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { plan: true }
    });

    const planPrices: Record<string, number> = {
      TRIAL: 0,
      STARTER: 49,
      PROFESSIONAL: 149,
      ENTERPRISE: 299 // placeholder
    };

    const mrr = activeSubscriptions.reduce((total, sub) => {
      return total + (planPrices[sub.plan] || 0);
    }, 0);

    // Recent signups
    const recentSignups = await prisma.restaurant.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });

    // Platform activity
    const recentActivity = await prisma.platformAction.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      restaurantsByStatus,
      subscriptionsByPlan,
      mrr,
      recentSignups,
      recentActivity
    });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
}; 