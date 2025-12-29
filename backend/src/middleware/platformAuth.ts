import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../config/db';

dotenv.config();
const PLATFORM_JWT_SECRET = process.env.PLATFORM_JWT_SECRET || process.env.JWT_SECRET || 'platform-secret-key';

export interface PlatformAuthRequest extends Request {
  platformAdmin?: {
    id: number;
    email: string;
    role: string;
  };
}

// Verify platform admin token
export const platformAuth = async (
  req: PlatformAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, PLATFORM_JWT_SECRET) as any;

    // Check if it's a platform token
    if (decoded.type !== 'platform') {
      res.status(401).json({ message: 'Invalid token type' });
      return;
    }

    // Get admin from database
    const admin = await prisma.platformAdmin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!admin) {
      res.status(401).json({ message: 'Admin not found' });
      return;
    }

    // Attach admin to request
    req.platformAdmin = admin;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
      return;
    }
    
    console.error('Platform auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Require specific platform roles
export const requirePlatformRole = (roles: string[]) => {
  return (req: PlatformAuthRequest, res: Response, next: NextFunction) => {
    if (!req.platformAdmin) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.platformAdmin.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Log platform admin actions
export const logPlatformAction = (action: string, entityType?: string) => {
  return async (req: PlatformAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.platformAdmin) {
        const entityId = req.params.id ? parseInt(req.params.id) : undefined;
        
        await prisma.platformAction.create({
          data: {
            adminId: req.platformAdmin.id,
            action,
            entityType,
            entityId,
            metadata: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: req.body ? Object.keys(req.body) : undefined,
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
        });
      }
    } catch (error) {
      console.error('Failed to log platform action:', error);
      // Don't fail the request if logging fails
    }
    
    next();
  };
}; 