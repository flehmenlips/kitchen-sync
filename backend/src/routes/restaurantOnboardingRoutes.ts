import express from 'express';
import { registerRestaurant, checkEmailAvailability, verifyEmail } from '../controllers/restaurantOnboardingController';

const router = express.Router();

// Public routes for restaurant self-service registration
router.post('/register', registerRestaurant);
router.get('/check-email', checkEmailAvailability);
router.post('/verify-email', verifyEmail);

export default router; 