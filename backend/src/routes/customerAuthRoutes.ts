import { Router, Request, Response, NextFunction } from 'express';
import { customerAuthController } from '../controllers/customerAuthController';
import { authenticateCustomer, CustomerAuthRequest } from '../middleware/authenticateCustomer';

const router = Router();

// Wrapper functions to handle async controller methods
const register = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.register(req, res);
};

const login = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.login(req, res);
};

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.verifyEmail(req, res);
};

const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.requestPasswordReset(req, res);
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.resetPassword(req, res);
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.refreshToken(req, res);
};

const logout = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.logout(req, res);
};

const getProfile = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.getProfile(req as CustomerAuthRequest, res);
};

const updateProfile = async (req: Request, res: Response): Promise<void> => {
  await customerAuthController.updateProfile(req as CustomerAuthRequest, res);
};

// Public routes - no authentication required
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected routes - require customer authentication
router.get('/profile', authenticateCustomer as any, getProfile);
router.put('/profile', authenticateCustomer as any, updateProfile);

export default router; 