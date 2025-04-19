import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { User } from '@prisma/client'; // Import User type

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
  let token;

  // Read JWT from the httpOnly cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }
      
      // Verify token
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Get user from the database based on decoded userId
      // Select all fields except password
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
            id: true, 
            email: true, 
            name: true, 
            createdAt: true, 
            updatedAt: true 
        }
      });

      if (!req.user) {
          // Handle case where user ID in token doesn't exist anymore
          res.status(401);
          throw new Error('Not authorized, user not found');
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Auth Error:', error);
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
    res.status(401);
    next(new Error('Not authorized, no token')); // Pass error to error handler
  }
};

// Optional: Middleware for admin checks later
// export const admin = (req: Request, res: Response, next: NextFunction) => { ... }; 