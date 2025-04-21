import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                role: UserRole;
                name?: string | null;
            };
        }
    }
}

export const requireRole = (requiredRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }

        const userRole = req.user.role;
        
        // Create a hierarchy of roles
        const roleHierarchy: Record<UserRole, number> = {
            'SUPERADMIN': 3,
            'ADMIN': 2,
            'USER': 1
        };

        if (roleHierarchy[userRole] >= roleHierarchy[requiredRole]) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
        }
    };
};

// Specific middleware for SuperAdmin
export const requireSuperAdmin = requireRole('SUPERADMIN');

// Middleware to check if user is accessing their own resource or is an admin
export const requireOwnershipOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized - No user found' });
    }

    // If user is SuperAdmin or Admin, allow access
    if (req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN') {
        return next();
    }

    // Check if user is accessing their own resource
    const resourceUserId = parseInt(req.params.userId);
    if (req.user.id === resourceUserId) {
        return next();
    }

    res.status(403).json({ message: 'Forbidden - You can only access your own resources' });
}; 