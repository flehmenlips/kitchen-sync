import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';
import { UserRole } from '@prisma/client';
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
  addCustomerNote,
  resetCustomerPassword,
  getCustomerAnalytics
} from '../controllers/adminCustomerController';
import {
  getStaffUsers,
  getStaffById,
  createStaffUser,
  updateStaffUser,
  resetStaffPassword,
  toggleStaffStatus,
  getStaffAnalytics
} from '../controllers/adminStaffController';

const router = Router();

// Middleware to check if user has required roles
const requireRoles = (roles: UserRole[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// All routes require authentication and restaurant context
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Customer management routes - Admin and above can access
router.get('/customers', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), getCustomers);
router.get('/customers/analytics', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), getCustomerAnalytics);
router.get('/customers/:id', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), getCustomerById);
router.put('/customers/:id', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), updateCustomer);
router.post('/customers/:id/notes', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.USER]), addCustomerNote);
router.post('/customers/:id/reset-password', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), resetCustomerPassword);

// Staff management routes - Admin and above only
router.get('/staff', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), getStaffUsers);
router.get('/staff/analytics', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), getStaffAnalytics);
router.get('/staff/:id', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), getStaffById);
router.post('/staff', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), createStaffUser);
router.put('/staff/:id', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), updateStaffUser);
router.post('/staff/:id/reset-password', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), resetStaffPassword);
router.delete('/staff/:id', requireRoles([UserRole.ADMIN, UserRole.SUPERADMIN]), toggleStaffStatus);

export default router; 