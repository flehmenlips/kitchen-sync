import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
// Use relative path for generated User type
import { User } from '../generated/prisma/client';

// Extend Express Request interface to include user property
// Place this in a types definition file (e.g., src/types/express/index.d.ts) later for better organization
declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'password'>; // Add optional user property, excluding password
        }
    }
}

interface JwtPayload {
  userId: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  console.log('[AuthMiddleware] protect called for path:', req.path); // Log entry
  let token;

  // Read JWT from the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];
       console.log('[AuthMiddleware] Token found in header');

      const secret = process.env.JWT_SECRET;
      if (!secret) { throw new Error('JWT_SECRET not configured'); }
      
      const decoded = jwt.verify(token, secret) as JwtPayload;
       console.log('[AuthMiddleware] Token verified, decoded userId:', decoded.userId);

      // Get user from DB (excluding password)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
            id: true, email: true, name: true, createdAt: true, updatedAt: true 
        }
      });
       console.log('[AuthMiddleware] User found in DB:', user ? user.id : 'Not Found');

      if (!user) {
          res.status(401);
          throw new Error('Not authorized, user not found');
      }
      req.user = user;
      console.log('[AuthMiddleware] User attached to request, calling next()');
      next(); 
    } catch (error) {
       console.error('[AuthMiddleware] Auth Error:', error);
       res.status(401);
       // Send specific message based on error type if needed
       if (error instanceof jwt.JsonWebTokenError) {
           next(new Error('Not authorized, token failed'));
       } else if (error instanceof jwt.TokenExpiredError) {
           next(new Error('Not authorized, token expired'));
       } else {
           next(new Error('Not authorized, no token or invalid token'));
       }
    }
  } 

  // If no token found in header
  if (!token) {
    console.log('[AuthMiddleware] No token found in header');
    res.status(401);
    next(new Error('Not authorized, no token')); 
  }
};

// Optional: Middleware for admin checks later
// export const admin = (req: Request, res: Response, next: NextFunction) => { ... }; 