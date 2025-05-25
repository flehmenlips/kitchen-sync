import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    isCustomer: boolean;
    role?: string;
  };
}

export const authenticateCustomer = (
  req: AuthenticatedRequest,
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
      
      req.user = payload;
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