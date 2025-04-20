import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { CookieOptions } from 'express';

// Define payload structure (adjust as needed)
interface JwtPayload {
  userId: number;
  // Add other fields like email or roles if useful
}

const generateTokenAndSetCookie = (res: Response, userId: number) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not defined in environment variables');
    throw new Error('Server configuration error'); // Don't leak details
  }

  const nodeEnv = process.env.NODE_ENV;
  console.log(`[generateToken] NODE_ENV value: ${nodeEnv}`); // Log NODE_ENV

  const payload: JwtPayload = { userId };

  const token = jwt.sign(payload, secret, {
    expiresIn: '30d', // Token expiration (e.g., 30 days)
  });

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined,
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  };

  // Log the options being used
  console.log('[generateToken] Setting cookie with options:', cookieOptions);

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, cookieOptions);
};

export default generateTokenAndSetCookie; 