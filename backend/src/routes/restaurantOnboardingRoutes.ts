import express from 'express';
import { registerRestaurant, checkEmailAvailability, verifyEmail } from '../controllers/restaurantOnboardingController';
import { registrationLimiter, emailVerificationLimiter } from '../middleware/rateLimiter';
import { validateRestaurantRegistration } from '../middleware/emailValidator';

const router = express.Router();

// Public routes for restaurant self-service registration - with full security stack
router.post('/register', 
  registrationLimiter,           // Rate limiting (3 per 15 min)
  ...validateRestaurantRegistration,  // Email + name + restaurant validation
  registerRestaurant
);
router.get('/check-email', checkEmailAvailability);
router.post('/verify-email', emailVerificationLimiter, verifyEmail);

export default router; 