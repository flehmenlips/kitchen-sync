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

  // Read JWT from the httpOnly cookie
  token = req.cookies.jwt;
  console.log('[AuthMiddleware] Cookie found:', token ? 'Yes' : 'No'); // Log if cookie exists
  // console.log('[AuthMiddleware] Full req.cookies:', req.cookies); // Optional: Log all cookies

  if (token) {
    try {
      console.log('[AuthMiddleware] Token exists, verifying...');
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }
      
      // Verify token
      const decoded = jwt.verify(token, secret) as JwtPayload;
      console.log('[AuthMiddleware] Token verified, decoded userId:', decoded.userId);

      // Get user from the database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
            id: true, email: true, name: true, createdAt: true, updatedAt: true 
        }
      });
      console.log('[AuthMiddleware] User found in DB:', user ? user.id : 'Not Found');

      // Check if user was found BEFORE assigning to req.user
      if (!user) {
          res.status(401);
          throw new Error('Not authorized, user not found');
      }

      // Assign the found user (which cannot be null here) to req.user
      req.user = user; 
      console.log('[AuthMiddleware] User attached to request, calling next()');
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('[AuthMiddleware] Auth Error:', error);
      res.status(401); // Unauthorized
      // Send specific message based on error type if needed
      if (error instanceof jwt.JsonWebTokenError) {
          next(new Error('Not authorized, token failed'));
      } else if (error instanceof jwt.TokenExpiredError) {
          next(new Error('Not authorized, token expired'));
      } else {
          next(new Error('Not authorized, no token or invalid token'));
      }
    }
  } else {
    console.log('[AuthMiddleware] No token found in cookies');
    res.status(401);
    next(new Error('Not authorized, no token')); // Pass error to error handler
  }
};

// Optional: Middleware for admin checks later
// export const admin = (req: Request, res: Response, next: NextFunction) => { ... }; 