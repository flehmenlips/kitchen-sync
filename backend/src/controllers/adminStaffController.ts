import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { emailService } from '../services/emailService';

const prisma = new PrismaClient();

// @desc    Get all staff users
// @route   GET /api/admin/staff
// @access  Private (Admin/Manager)
export const getStaffUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause - exclude customers
    const where: any = {
      isCustomer: false
    };

    // Search by name or email
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Filter by role
    if (role) {
      where.role = role as UserRole;
    }

    // Get total count
    const totalCount = await prisma.user.count({ where });

    // Get staff users with activity stats
    const staffUsers = await prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            recipes: true,
            menus: true,
            prepTasks: true,
            orders: true,
            reservations: true
          }
        }
      }
    });

    // Get last login info from refresh tokens
    const staffWithActivity = await Promise.all(
      staffUsers.map(async (user) => {
        const lastToken = await prisma.refreshToken.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        });

        return {
          ...user,
          lastLogin: lastToken?.createdAt
        };
      })
    );

    res.json({
      staff: staffWithActivity,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Get staff users error:', error);
    res.status(500).json({ error: 'Failed to fetch staff users' });
  }
};

// @desc    Get single staff user details
// @route   GET /api/admin/staff/:id
// @access  Private (Admin/Manager)
export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        isCustomer: false
      },
      include: {
        _count: {
          select: {
            recipes: true,
            menus: true,
            prepTasks: true,
            orders: true,
            reservations: true,
            ingredients: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Staff user not found' });
      return;
    }

    // Get recent activity
    const recentRecipes = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    const recentOrders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        createdAt: true,
        status: true
      }
    });

    res.json({
      user,
      activity: {
        recentRecipes,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch staff details' });
  }
};

// @desc    Create new staff user
// @route   POST /api/admin/staff
// @access  Private (Admin only)
export const createStaffUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password, role, phone } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as UserRole,
        phone,
        isCustomer: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    // Send welcome email
    if (email) {
      await emailService.sendWelcomeEmail(email, name || 'Team Member');
    }

    res.status(201).json({
      message: 'Staff user created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Create staff user error:', error);
    res.status(500).json({ error: 'Failed to create staff user' });
  }
};

// @desc    Update staff user
// @route   PUT /api/admin/staff/:id
// @access  Private (Admin only)
export const updateStaffUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { email, name, role, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId, isCustomer: false }
    });

    if (!existingUser) {
      res.status(404).json({ error: 'Staff user not found' });
      return;
    }

    // Don't allow changing superadmin role
    if (existingUser.role === UserRole.SUPERADMIN && role !== UserRole.SUPERADMIN) {
      res.status(403).json({ error: 'Cannot change superadmin role' });
      return;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        name,
        role: role as UserRole,
        phone
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Staff user updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update staff user error:', error);
    res.status(500).json({ error: 'Failed to update staff user' });
  }
};

// @desc    Reset staff password
// @route   POST /api/admin/staff/:id/reset-password
// @access  Private (Admin only)
export const resetStaffPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { sendEmail = true } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId, isCustomer: false }
    });

    if (!user) {
      res.status(404).json({ error: 'Staff user not found' });
      return;
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + '!A1';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Send email if requested
    if (sendEmail && user.email) {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.name || 'Team Member',
        `${process.env.FRONTEND_URL}/login`
      );
    }

    res.json({
      message: 'Password reset successfully',
      tempPassword: sendEmail ? undefined : tempPassword
    });
  } catch (error) {
    console.error('Reset staff password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// @desc    Deactivate/activate staff user
// @route   DELETE /api/admin/staff/:id
// @access  Private (Admin only)
export const toggleStaffStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { active } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId, isCustomer: false }
    });

    if (!user) {
      res.status(404).json({ error: 'Staff user not found' });
      return;
    }

    // Don't allow deactivating superadmin
    if (user.role === UserRole.SUPERADMIN) {
      res.status(403).json({ error: 'Cannot deactivate superadmin' });
      return;
    }

    // For now, we'll invalidate all refresh tokens to effectively "deactivate"
    if (!active) {
      await prisma.refreshToken.deleteMany({
        where: { userId }
      });
    }

    res.json({
      message: active ? 'User activated' : 'User deactivated',
      active
    });
  } catch (error) {
    console.error('Toggle staff status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// @desc    Get staff analytics
// @route   GET /api/admin/staff/analytics
// @access  Private (Admin/Manager)
export const getStaffAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get staff by role
    const staffByRole = await prisma.user.groupBy({
      by: ['role'],
      where: { isCustomer: false },
      _count: true
    });

    // Get total content created
    const totalRecipes = await prisma.recipe.count();
    const totalMenus = await prisma.menu.count();
    const totalOrders = await prisma.order.count();

    // Get active staff (logged in within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeStaff = await prisma.refreshToken.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      distinct: ['userId'],
      select: { userId: true }
    });

    const totalStaff = await prisma.user.count({
      where: { isCustomer: false }
    });

    res.json({
      staff: {
        total: totalStaff,
        active: activeStaff.length,
        byRole: staffByRole.reduce((acc, curr) => {
          acc[curr.role] = curr._count;
          return acc;
        }, {} as Record<string, number>)
      },
      content: {
        recipes: totalRecipes,
        menus: totalMenus,
        orders: totalOrders
      }
    });
  } catch (error) {
    console.error('Get staff analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}; 