import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../../config/db';

dotenv.config();

// Get platform JWT secret from environment variables - must be configured
const getPlatformJwtSecret = (): string => {
  const secret = process.env.PLATFORM_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('PLATFORM_JWT_SECRET or JWT_SECRET environment variable must be configured');
  }
  return secret;
};
const PLATFORM_JWT_EXPIRES_IN = '24h';

interface PlatformAuthRequest extends Request {
  platformAdmin?: {
    id: number;
    email: string;
    role: string;
  };
}

// Platform Admin Login
export const platformLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find platform admin
    const admin = await prisma.platformAdmin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Update last login
    await prisma.platformAdmin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Log the action
    await prisma.platformAction.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    // Generate token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'platform',
      },
      getPlatformJwtSecret(),
      { expiresIn: PLATFORM_JWT_EXPIRES_IN }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Platform login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Platform Admin Logout
export const platformLogout = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    if (req.platformAdmin) {
      // Log the action
      await prisma.platformAction.create({
        data: {
          adminId: req.platformAdmin.id,
          action: 'LOGOUT',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Platform logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// Get Current Platform Admin
export const getCurrentPlatformAdmin = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.platformAdmin) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const admin = await prisma.platformAdmin.findUnique({
      where: { id: req.platformAdmin.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    res.json(admin);
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({ message: 'Failed to get admin info' });
  }
};

// Create First Super Admin (only if no admins exist)
export const createFirstSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: 'Email, password, and name are required' });
      return;
    }

    // Check if any platform admins exist
    const adminCount = await prisma.platformAdmin.count();
    if (adminCount > 0) {
      res.status(403).json({ message: 'Platform admins already exist' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const admin = await prisma.platformAdmin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: 'SUPER_ADMIN',
      },
    });

    // Log the action
    await prisma.platformAction.create({
      data: {
        adminId: admin.id,
        action: 'FIRST_SUPER_ADMIN_CREATED',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.status(201).json({
      message: 'Super admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Create first super admin error:', error);
    res.status(500).json({ message: 'Failed to create super admin' });
  }
};

// Change Password
export const changePlatformPassword = async (req: PlatformAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.platformAdmin) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current and new passwords are required' });
      return;
    }

    // Get admin with password
    const admin = await prisma.platformAdmin.findUnique({
      where: { id: req.platformAdmin.id },
    });

    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.platformAdmin.update({
      where: { id: req.platformAdmin.id },
      data: { password: hashedPassword },
    });

    // Log the action
    await prisma.platformAction.create({
      data: {
        adminId: req.platformAdmin.id,
        action: 'PASSWORD_CHANGED',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
}; 