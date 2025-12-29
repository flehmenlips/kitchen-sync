import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';
import prisma from '../config/db';

// Use a different interface name to avoid conflicts with the global Express Request extension
export interface CustomerAuthRequest extends Request {
  customerUser?: {
    userId: number;
    email: string;
    isCustomer: boolean;
    role?: string;
  };
  customer?: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    restaurantId: number | null;
    emailVerified: boolean | null;
  };
}

export const authenticateCustomer = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = verifyAccessToken(token);
      
      // Ensure the user is a customer
      if (!payload.isCustomer) {
        res.status(403).json({ error: 'Access forbidden: Customer account required' });
        return;
      }
      
      // Fetch customer from database
      const customer = await prisma.customer.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          restaurantId: true,
          emailVerified: true
        }
      });

      if (!customer) {
        res.status(401).json({ error: 'Customer not found' });
        return;
      }
      
      // Check if email is verified (for reservation endpoints)
      // Allow unverified customers for profile/account endpoints
      // Use req.originalUrl instead of req.path because when middleware is applied via router.use(),
      // req.path is relative to the router (e.g., '/'), not the full path
      const requiresVerification = req.originalUrl.includes('/reservations') && req.method === 'POST';
      if (requiresVerification && !customer.emailVerified) {
        res.status(403).json({ 
          error: 'Email verification required',
          message: 'Please verify your email address before making a reservation. Check your inbox for the verification email.',
          requiresVerification: true
        });
        return;
      }
      
      // Add both for backward compatibility
      req.customerUser = payload;
      req.customer = customer;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
    return;
  }
}; 