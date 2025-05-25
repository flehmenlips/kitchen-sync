import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';

// Use a different interface name to avoid conflicts with the global Express Request extension
export interface CustomerAuthRequest extends Request {
  customerUser?: {
    userId: number;
    email: string;
    isCustomer: boolean;
    role?: string;
  };
}

export const authenticateCustomer = (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction
): void => {
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
      
      req.customerUser = payload;
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