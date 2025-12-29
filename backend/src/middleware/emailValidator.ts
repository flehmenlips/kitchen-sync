import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * Email Validation Middleware
 * Blocks disposable emails, validates format, and checks blocklist
 */

// Common disposable email domains
const DISPOSABLE_DOMAINS = [
  'bltiwd.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'maildrop.cc',
  'yopmail.com',
  'getnada.com',
  'trashmail.com',
  '10minutemail.net',
  'mohmal.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'dispostable.com',
  'emailondeck.com'
];

/**
 * Basic email format validation
 */
const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if email domain is disposable/temporary
 */
const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return DISPOSABLE_DOMAINS.some(disposableDomain => 
    domain === disposableDomain || domain.endsWith(`.${disposableDomain}`)
  );
};

/**
 * Middleware to validate and sanitize email during registration
 */
export const validateRegistrationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    
    // Check if email is provided
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    // Validate email format
    if (!isValidEmailFormat(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }
    
    // Check for disposable email domains
    if (isDisposableEmail(email)) {
      console.log(`[SECURITY] Blocked disposable email registration attempt: ${email} from IP: ${req.ip}`);
      res.status(400).json({ 
        error: 'Temporary or disposable email addresses are not allowed. Please use a permanent email address.' 
      });
      return;
    }
    
    // Check database blocklist (if table exists)
    try {
      const blockedEmail = await prisma.$queryRaw<Array<{email: string}>>`
        SELECT email FROM blocked_emails WHERE email = ${email} LIMIT 1
      `;
      
      if (blockedEmail && blockedEmail.length > 0) {
        console.log(`[SECURITY] Blocked email registration attempt: ${email} from IP: ${req.ip}`);
        res.status(403).json({ 
          error: 'This email address is not allowed to register.' 
        });
        return;
      }
    } catch (error) {
      // Table doesn't exist yet - that's okay, continue
      console.log('[EmailValidator] blocked_emails table not found, skipping blocklist check');
    }
    
    // Sanitize email for storage
    req.body.email = email;
    
    next();
  } catch (error) {
    console.error('[EmailValidator] Error validating email:', error);
    res.status(500).json({ error: 'Error validating email' });
  }
};

/**
 * Middleware to validate name during registration
 * Prevents keyboard smashing and garbage input
 */
export const validateRegistrationName = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const name = req.body.name?.trim();
  const firstName = req.body.firstName?.trim();
  const ownerName = req.body.ownerName?.trim();
  
  // Check whichever name field is being used
  const nameToValidate = name || firstName || ownerName;
  
  if (!nameToValidate) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  
  // Must be at least 2 characters
  if (nameToValidate.length < 2) {
    res.status(400).json({ error: 'Name must be at least 2 characters long' });
    return;
  }
  
  // Must not exceed 100 characters
  if (nameToValidate.length > 100) {
    res.status(400).json({ error: 'Name must not exceed 100 characters' });
    return;
  }
  
  // Must contain at least some actual letters (not just random characters)
  // Allows: letters, spaces, hyphens, apostrophes, periods (for international names)
  const namePattern = /^[a-zA-ZÀ-ÿ\s.'-]+$/;
  if (!namePattern.test(nameToValidate)) {
    res.status(400).json({ 
      error: 'Name must contain only letters, spaces, and basic punctuation' 
    });
    return;
  }
  
  // Check for obvious keyboard smashing patterns
  const keyboardPatterns = [
    /asdf/i, /qwer/i, /zxcv/i, /hjkl/i,
    /fdsa/i, /rewq/i, /vcxz/i,
    /sdasd/i, /dgdf/i, /fgfg/i,
    /(.)\1{4,}/ // Same character repeated 5+ times
  ];
  
  const hasKeyboardSmash = keyboardPatterns.some(pattern => 
    pattern.test(nameToValidate)
  );
  
  if (hasKeyboardSmash) {
    console.log(`[SECURITY] Blocked keyboard smash name: ${nameToValidate} from IP: ${req.ip}`);
    res.status(400).json({ 
      error: 'Please provide a valid name' 
    });
    return;
  }
  
  // Sanitize the name (remove extra spaces, trim)
  const sanitizedName = nameToValidate.replace(/\s+/g, ' ').trim();
  
  if (name) req.body.name = sanitizedName;
  if (firstName) req.body.firstName = sanitizedName;
  if (ownerName) req.body.ownerName = sanitizedName;
  
  next();
};

/**
 * Middleware to validate restaurant name during registration
 */
export const validateRestaurantName = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const restaurantName = req.body.restaurantName?.trim();
  
  if (!restaurantName) {
    res.status(400).json({ error: 'Restaurant name is required' });
    return;
  }
  
  // Must be at least 2 characters
  if (restaurantName.length < 2) {
    res.status(400).json({ error: 'Restaurant name must be at least 2 characters long' });
    return;
  }
  
  // Must not exceed 200 characters
  if (restaurantName.length > 200) {
    res.status(400).json({ error: 'Restaurant name must not exceed 200 characters' });
    return;
  }
  
  // Check for keyboard smashing
  const keyboardPatterns = [
    /asdf/i, /qwer/i, /zxcv/i, /hjkl/i,
    /fdsa/i, /rewq/i, /vcxz/i,
    /sdasd/i, /dgdf/i, /fgfg/i,
    /(.)\1{4,}/
  ];
  
  const hasKeyboardSmash = keyboardPatterns.some(pattern => 
    pattern.test(restaurantName)
  );
  
  if (hasKeyboardSmash) {
    console.log(`[SECURITY] Blocked keyboard smash restaurant name: ${restaurantName} from IP: ${req.ip}`);
    res.status(400).json({ 
      error: 'Please provide a valid restaurant name' 
    });
    return;
  }
  
  // Sanitize
  req.body.restaurantName = restaurantName.replace(/\s+/g, ' ').trim();
  
  next();
};

/**
 * Combined validation middleware for registration
 * Use this as a single middleware for all registration routes
 */
export const validateRegistration = [
  validateRegistrationEmail,
  validateRegistrationName
];

/**
 * Combined validation for restaurant registration
 */
export const validateRestaurantRegistration = [
  validateRegistrationEmail,
  validateRegistrationName,
  validateRestaurantName
];

