import { Router } from 'express';
import {
  platformLogin,
  platformLogout,
  getCurrentPlatformAdmin,
  createFirstSuperAdmin,
  changePlatformPassword,
} from '../controllers/platform/authController';
import {
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  verifyRestaurant,
  suspendRestaurant,
  unsuspendRestaurant,
  addRestaurantNote,
  getRestaurantAnalytics,
  getPlatformAnalytics,
} from '../controllers/platform/restaurantController';
import {
  getSubscriptions,
  getSubscription,
  updateSubscription,
  createTrialSubscription,
  cancelSubscription,
  getSubscriptionAnalytics,
} from '../controllers/platform/subscriptionController';
import { handleStripeWebhook } from '../controllers/platform/webhookController';
import { platformAuth, requirePlatformRole, logPlatformAction } from '../middleware/platformAuth';
import express from 'express';

const router = Router();

// ===== AUTH ROUTES =====

// Create first super admin (only works if no admins exist)
router.post('/auth/setup', createFirstSuperAdmin);

// Login
router.post('/auth/login', platformLogin);

// Protected auth routes
router.post('/auth/logout', platformAuth, platformLogout);
router.get('/auth/me', platformAuth, getCurrentPlatformAdmin);
router.post('/auth/change-password', platformAuth, changePlatformPassword);

// ===== RESTAURANT MANAGEMENT ROUTES =====

// List all restaurants
router.get(
  '/restaurants',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN', 'SUPPORT']),
  getRestaurants
);

// Get restaurant details
router.get(
  '/restaurants/:id',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN', 'SUPPORT']),
  getRestaurant
);

// Update restaurant
router.put(
  '/restaurants/:id',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN']),
  updateRestaurant
);

// Verify restaurant
router.post(
  '/restaurants/:id/verify',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN']),
  verifyRestaurant
);

// Suspend restaurant
router.post(
  '/restaurants/:id/suspend',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN']),
  suspendRestaurant
);

// Unsuspend restaurant
router.post(
  '/restaurants/:id/unsuspend',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN']),
  unsuspendRestaurant
);

// Add note to restaurant
router.post(
  '/restaurants/:id/notes',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN', 'SUPPORT']),
  addRestaurantNote
);

// Get restaurant analytics
router.get(
  '/restaurants/:id/analytics',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN', 'SUPPORT']),
  getRestaurantAnalytics
);

// Get platform analytics
router.get(
  '/analytics',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN']),
  getPlatformAnalytics
);

// ===== SUBSCRIPTION MANAGEMENT ROUTES =====

// List all subscriptions
router.get(
  '/subscriptions',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN', 'BILLING']),
  getSubscriptions
);

// Get subscription analytics (must be before :id route)
router.get(
  '/subscriptions/analytics',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN', 'BILLING']),
  getSubscriptionAnalytics
);

// Get subscription details
router.get(
  '/subscriptions/:id',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN', 'BILLING']),
  getSubscription
);

// Update subscription (admin override)
router.put(
  '/subscriptions/:id',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN']),
  updateSubscription
);

// Create trial subscription
router.post(
  '/subscriptions/trial',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN', 'ADMIN']),
  createTrialSubscription
);

// Cancel subscription
router.post(
  '/subscriptions/:id/cancel',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN']),
  cancelSubscription
);

// ===== ADMIN MANAGEMENT ROUTES =====
// (For super admins only)

// Create new platform admin
router.post(
  '/admins',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN']),
  logPlatformAction('CREATE_ADMIN'),
  (req, res) => {
    // TODO: Implement admin creation
    res.json({ message: 'Admin creation endpoint - to be implemented' });
  }
);

// List platform admins
router.get(
  '/admins',
  platformAuth,
  requirePlatformRole(['SUPER_ADMIN']),
  logPlatformAction('LIST_ADMINS'),
  (req, res) => {
    // TODO: Implement admin listing
    res.json({ message: 'Admin listing endpoint - to be implemented' });
  }
);

// ===== STRIPE WEBHOOK =====
// This route should NOT have authentication middleware
// Stripe sends the raw body which we need to verify the signature
router.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router; 