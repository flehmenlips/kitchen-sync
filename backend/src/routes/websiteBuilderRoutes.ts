import { Router } from 'express';
import {
  getWebsiteBuilderData,
  updateWebsiteBuilderSettings,
  createWebsiteBuilderPage,
  deleteWebsiteBuilderPage,
  getPageTemplates
} from '../controllers/websiteBuilderController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = Router();

// Website Builder data endpoints
router.get('/data', protect, setRestaurantContext, requireRestaurantContext, getWebsiteBuilderData);
router.put('/settings', protect, setRestaurantContext, requireRestaurantContext, updateWebsiteBuilderSettings);

// Page management endpoints
router.post('/pages', protect, setRestaurantContext, requireRestaurantContext, createWebsiteBuilderPage);
router.delete('/pages/:slug', protect, setRestaurantContext, requireRestaurantContext, deleteWebsiteBuilderPage);

// Template endpoints
router.get('/templates', getPageTemplates);

export default router; 