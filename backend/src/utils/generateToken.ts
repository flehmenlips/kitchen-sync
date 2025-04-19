import jwt from 'jsonwebtoken';
import { Response } from 'express';

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

  const payload: JwtPayload = { userId };

  const token = jwt.sign(payload, secret, {
    expiresIn: '30d', // Token expiration (e.g., 30 days)
  });

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true, // Prevent client-side JS access
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    sameSite: 'strict', // Mitigate CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });
};

export default generateTokenAndSetCookie; 