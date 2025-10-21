import express from 'express';
import { registerRestaurant, checkEmailAvailability, verifyEmail } from '../controllers/restaurantOnboardingController';
import { registrationLimiter, emailVerificationLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Public routes for restaurant self-service registration - with rate limiting
router.post('/register', registrationLimiter, registerRestaurant);
router.get('/check-email', checkEmailAvailability);
router.post('/verify-email', emailVerificationLimiter, verifyEmail);

export default router; 