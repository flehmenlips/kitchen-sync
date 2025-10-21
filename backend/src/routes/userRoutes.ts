import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    getUserRestaurants
    // updateUserProfile // Add later if needed
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware'; // Import protect middleware (to be created)
import { registrationLimiter, loginLimiter } from '../middleware/rateLimiter';
import { validateRegistration } from '../middleware/emailValidator';

const router = express.Router();

// Apply full security stack to prevent bot attacks
router.post('/register', 
  registrationLimiter,      // Rate limiting
  ...validateRegistration,  // Email + name validation
  registerUser
);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.route('/profile').get(protect, getUserProfile);
router.route('/restaurants').get(protect, getUserRestaurants);
// Add PUT route later: .put(protect, updateUserProfile);

export default router; 