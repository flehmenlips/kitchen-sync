import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { emailService } from '../services/emailService';
import prisma from '../config/db';

// @desc    Get all customers with filters and pagination
// @route   GET /api/admin/customers
// @access  Private (Admin/Manager)
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      emailVerified,
      hasReservations
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      restaurantId: 1 // Single restaurant for MVP
    };

    // Search by name, email, or phone
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Filter by email verification status
    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified === 'true';
    }

    // Get total count
    const totalCount = await prisma.customer.count({ where });

    // Get customers with related data
    const customers = await prisma.customer.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder
      },
      include: {
        customerPreferences: true,
        _count: {
          select: {
            sessions: true
          }
        }
      }
    });

    // Get reservation counts for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const reservationCount = await prisma.reservation.count({
          where: { customerEmail: customer.email }
        });

        const lastReservation = await prisma.reservation.findFirst({
          where: { customerEmail: customer.email },
          orderBy: { createdAt: 'desc' },
          select: {
            reservationDate: true,
            reservationTime: true,
            status: true
          }
        });

        return {
          ...customer,
          reservationCount,
          lastReservation
        };
      })
    );

    res.json({
      customers: customersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// @desc    Get single customer with full details
// @route   GET /api/admin/customers/:id
// @access  Private (Admin/Manager)
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        customerPreferences: true,
        restaurantLinks: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Get reservation history
    const reservations = await prisma.reservation.findMany({
      where: { customerEmail: customer.email },
      orderBy: { reservationDate: 'desc' },
      include: {
        restaurant: {
          select: {
            name: true
          }
        }
      }
    });

    // Calculate statistics
    const stats = {
      totalReservations: reservations.length,
      completedReservations: reservations.filter(r => r.status === 'COMPLETED').length,
      cancelledReservations: reservations.filter(r => r.status === 'CANCELLED').length,
      noShowReservations: reservations.filter(r => r.status === 'NO_SHOW').length,
      averagePartySize: reservations.length > 0
        ? Math.round(reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length)
        : 0,
      lastVisit: reservations.find(r => r.status === 'COMPLETED')?.reservationDate
    };

    res.json({
      customer,
      reservations: reservations.slice(0, 10), // Last 10 reservations
      stats
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
};

// @desc    Update customer information
// @route   PUT /api/admin/customers/:id
// @access  Private (Admin/Manager)
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    const {
      firstName,
      lastName,
      email,
      phone,
      emailVerified,
      notes,
      tags,
      vipStatus
    } = req.body;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!existingCustomer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName,
        lastName,
        email,
        phone,
        emailVerified
      }
    });

    // Update restaurant link if tags or VIP status provided
    if (tags !== undefined || vipStatus !== undefined || notes !== undefined) {
      await prisma.customerRestaurant.update({
        where: {
          customerId_restaurantId: {
            customerId,
            restaurantId: 1
          }
        },
        data: {
          ...(tags !== undefined && { tags }),
          ...(vipStatus !== undefined && { vipStatus }),
          ...(notes !== undefined && { notes })
        }
      });
    }

    res.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// @desc    Add note to customer
// @route   POST /api/admin/customers/:id/notes
// @access  Private (Admin/Manager/Staff)
export const addCustomerNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    const { note } = req.body;
    const userId = (req as any).user.id;

    // Get existing notes
    const customerLink = await prisma.customerRestaurant.findUnique({
      where: {
        customerId_restaurantId: {
          customerId,
          restaurantId: 1
        }
      }
    });

    if (!customerLink) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Append note with timestamp and user
    const existingNotes = customerLink.notes || '';
    const timestamp = new Date().toISOString();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    const newNote = `[${timestamp} - ${user?.name || 'Unknown'}]: ${note}\n\n${existingNotes}`;

    // Update notes
    await prisma.customerRestaurant.update({
      where: {
        customerId_restaurantId: {
          customerId,
          restaurantId: 1
        }
      },
      data: { notes: newNote }
    });

    res.json({ message: 'Note added successfully' });
  } catch (error) {
    console.error('Add customer note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

// @desc    Reset customer password
// @route   POST /api/admin/customers/:id/reset-password
// @access  Private (Admin only)
export const resetCustomerPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    const { sendEmail = true } = req.body;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + '!A1';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update password
    await prisma.customer.update({
      where: { id: customerId },
      data: { password: hashedPassword }
    });

    // Send email if requested
    if (sendEmail && customer.email) {
      // TODO: Create a specific temporary password email template
      await emailService.sendPasswordResetEmail(
        customer.email,
        customer.firstName || 'Customer',
        `${process.env.FRONTEND_URL}/customer/login`
      );
    }

    res.json({
      message: 'Password reset successfully',
      tempPassword: sendEmail ? undefined : tempPassword // Only return password if not emailing
    });
  } catch (error) {
    console.error('Reset customer password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// @desc    Get customer analytics
// @route   GET /api/admin/customers/analytics
// @access  Private (Admin/Manager)
export const getCustomerAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    // Get total customers
    const totalCustomers = await prisma.customer.count({
      where: { restaurantId: 1 }
    });

    // Get new customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        restaurantId: 1,
        createdAt: { gte: startOfMonth }
      }
    });

    // Get verified customers
    const verifiedCustomers = await prisma.customer.count({
      where: {
        restaurantId: 1,
        emailVerified: true
      }
    });

    // Get VIP customers
    const vipCustomers = await prisma.customerRestaurant.count({
      where: {
        restaurantId: 1,
        vipStatus: true
      }
    });

    // Get reservation stats
    const totalReservations = await prisma.reservation.count({
      where: {
        restaurantId: 1,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      }
    });

    const completedReservations = await prisma.reservation.count({
      where: {
        restaurantId: 1,
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      }
    });

    res.json({
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        verified: verifiedCustomers,
        vip: vipCustomers,
        verificationRate: totalCustomers > 0 ? (verifiedCustomers / totalCustomers * 100).toFixed(1) : 0
      },
      reservations: {
        total: totalReservations,
        completed: completedReservations,
        completionRate: totalReservations > 0 ? (completedReservations / totalReservations * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}; 