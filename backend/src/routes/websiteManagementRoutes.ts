import express from 'express';
import { websiteManagementController } from '../controllers/websiteManagementController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// All routes require authentication and restaurant context
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Get website summary/stats
router.get('/summary', websiteManagementController.getWebsiteSummary);

// Reset website to default template
router.post('/reset', websiteManagementController.resetWebsite);

// Delete website completely
router.delete('/', websiteManagementController.deleteWebsite);

// Get default template preview
router.get('/default-template', websiteManagementController.getDefaultTemplate);

export default router;

