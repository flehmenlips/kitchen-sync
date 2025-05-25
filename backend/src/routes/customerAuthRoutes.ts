import { Router } from 'express';
import { customerAuthController } from '../controllers/customerAuthController';
import { authenticateCustomer } from '../middleware/authenticateCustomer';

const router = Router();

// Public routes - no authentication required
router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);
router.post('/verify-email', customerAuthController.verifyEmail);
router.post('/request-password-reset', customerAuthController.requestPasswordReset);
router.post('/reset-password', customerAuthController.resetPassword);
router.post('/refresh-token', customerAuthController.refreshToken);
router.post('/logout', customerAuthController.logout);

// Protected routes - require customer authentication
router.get('/profile', authenticateCustomer as any, customerAuthController.getProfile as any);
router.put('/profile', authenticateCustomer as any, customerAuthController.updateProfile as any);

export default router; 