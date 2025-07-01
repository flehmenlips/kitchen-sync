import express from 'express';
import {
  getWebsiteBuilderData,
  updateWebsiteBuilderSettings,
  createWebsiteBuilderPage,
  updateWebsiteBuilderPage,
  deleteWebsiteBuilderPage,
  getPageTemplates,
  updateContentBlock,
  createContentBlock,
  deleteContentBlock,
  reorderContentBlocks,
  getContentBlockSchemas
} from '../controllers/websiteBuilderController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// Get unified website builder data
router.get('/data', protect, setRestaurantContext, requireRestaurantContext, getWebsiteBuilderData);

// Update website settings
router.put('/settings', protect, setRestaurantContext, requireRestaurantContext, updateWebsiteBuilderSettings);

// Page management
router.post('/pages', protect, setRestaurantContext, requireRestaurantContext, createWebsiteBuilderPage);
router.put('/pages/:slug', protect, setRestaurantContext, requireRestaurantContext, updateWebsiteBuilderPage);
router.delete('/pages/:slug', protect, setRestaurantContext, requireRestaurantContext, deleteWebsiteBuilderPage);

// Content block management
router.put('/pages/:slug/blocks/:blockId', protect, setRestaurantContext, requireRestaurantContext, updateContentBlock);
router.post('/pages/:slug/blocks', protect, setRestaurantContext, requireRestaurantContext, createContentBlock);
router.delete('/pages/:slug/blocks/:blockId', protect, setRestaurantContext, requireRestaurantContext, deleteContentBlock);
router.put('/pages/:slug/blocks/reorder', protect, setRestaurantContext, requireRestaurantContext, reorderContentBlocks);

// Get page templates (public endpoint)
router.get('/templates', getPageTemplates);

// Get content block schemas (public endpoint)
router.get('/schemas', getContentBlockSchemas);

export default router; 