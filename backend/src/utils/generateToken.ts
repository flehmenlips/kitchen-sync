import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// Define payload structure (adjust as needed)
interface JwtPayload {
  userId: number;
  role: UserRole;
  // Add other fields like email or roles if useful
}

const generateToken = (userId: number, role: UserRole = 'USER'): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not defined');
    throw new Error('Server configuration error');
  }

  const payload: JwtPayload = { 
    userId,
    role
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: '30d', // Token expiration (e.g., 30 days)
  });

  return token;
};

export default generateToken; 