import { Router } from 'express';
import {
  getSubscription,
  getInvoices,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  checkStripeConfig
} from '../controllers/subscriptionController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = Router();

// All routes require authentication and restaurant context
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Get current subscription
router.get('/', getSubscription);

// Get invoices
router.get('/invoices', getInvoices);

// Create checkout session
router.post('/checkout', createCheckoutSession);

// Create billing portal session
router.post('/billing-portal', createBillingPortalSession);

// Cancel subscription
router.post('/cancel', cancelSubscription);

// Debug endpoint
router.get('/debug-config', checkStripeConfig);

export default router; 