import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables - must be configured
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return secret;
};

const getRefreshTokenSecret = (): string => {
  return process.env.REFRESH_TOKEN_SECRET || getJwtSecret();
};

interface TokenPayload {
  userId: number;
  email: string;
  isCustomer: boolean;
  role?: string;
}

interface RefreshTokenPayload extends TokenPayload {
  tokenId: number;
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '1h' // Access token expires in 1 hour
  });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, getRefreshTokenSecret(), {
    expiresIn: '30d' // Refresh token expires in 30 days
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, getRefreshTokenSecret()) as RefreshTokenPayload;
}

export function generateEmailVerificationToken(): string {
  return generateSecureToken(32);
}

export function generatePasswordResetToken(): string {
  return generateSecureToken(32);
}

export function generateConversionToken(): string {
  return generateSecureToken(24);
}

export function getTokenExpiryDate(hours: number = 24): Date {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}

export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
} 