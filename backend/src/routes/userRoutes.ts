import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile
    // updateUserProfile // Add later if needed
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware'; // Import protect middleware (to be created)

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected route
router.route('/profile').get(protect, getUserProfile);
// Add PUT route later: .put(protect, updateUserProfile);

export default router; 