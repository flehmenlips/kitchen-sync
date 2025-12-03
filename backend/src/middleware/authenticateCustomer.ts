import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authenticateCustomer.ts:73',message:'email verification check middleware',data:{requiresVerification,emailVerified:customer.emailVerified,originalUrl:req.originalUrl,method:req.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      if (requiresVerification && !customer.emailVerified) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authenticateCustomer.ts:74',message:'email verification blocked',data:{emailVerified:customer.emailVerified},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
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