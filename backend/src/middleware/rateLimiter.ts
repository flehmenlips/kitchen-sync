import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * Protects against brute force attacks, spam, and bots
 */

// Strict rate limit for registration endpoints
// 3 attempts per 15 minutes per IP
export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 registration attempts
  message: {
    error: 'Too many registration attempts from this IP. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
});

// Moderate rate limit for login endpoints
// 10 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login attempts
  message: {
    error: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Moderate rate limit for password reset
// 5 attempts per hour per IP
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 password reset attempts
  message: {
    error: 'Too many password reset requests. Please try again in 1 hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit
// 100 requests per minute per IP
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests from this IP. Please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for reservation creation
// 5 reservations per hour per customer (prevents spam/abuse)
export const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 reservations per hour
  message: {
    error: 'Too many reservations. Please limit to 5 reservations per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use customer ID if available, otherwise fall back to IP
  keyGenerator: (req: any) => {
    if (req.customer?.id) {
      return `reservation:customer:${req.customer.id}`;
    }
    if (req.customerUser?.userId) {
      return `reservation:customer:${req.customerUser.userId}`;
    }
    // Use req.ip directly - express-rate-limit provides this by default
    // req.ip is already normalized (handles proxies via trust proxy settings)
    return `reservation:ip:${req.ip || req.connection?.remoteAddress || 'unknown'}`;
  },
  skipSuccessfulRequests: false, // Count successful reservations
  skipFailedRequests: true, // Don't count failed attempts
});

// Very strict rate limit for email verification
// 5 attempts per hour (prevents email bombing)
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: 'Too many verification attempts. Please try again in 1 hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

